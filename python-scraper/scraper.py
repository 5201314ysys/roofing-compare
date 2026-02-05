"""
BizCompare Pro - 多源数据爬虫系统
从多个公开数据源获取企业信息和价格数据
"""

import os
import sys
import json
import asyncio
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse, quote

import aiohttp
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client
from tenacity import retry, stop_after_attempt, wait_exponential
from fake_useragent import UserAgent
from rich.console import Console
from rich.progress import Progress, TaskID

load_dotenv()

console = Console()

# Supabase 配置
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# 数据源配置
DATA_SOURCES = {
    "california_cslb": {
        "name": "California CSLB",
        "url": "https://www.cslb.ca.gov",
        "type": "government",
        "state": "CA",
    },
    "texas_tdlr": {
        "name": "Texas TDLR",
        "url": "https://www.tdlr.texas.gov",
        "type": "government", 
        "state": "TX",
    },
    "bbb": {
        "name": "Better Business Bureau",
        "url": "https://www.bbb.org",
        "type": "business_directory",
    },
    "yelp": {
        "name": "Yelp",
        "url": "https://www.yelp.com",
        "type": "review_site",
    },
}

# 行业配置
INDUSTRIES = {
    "roofing": {
        "name": "屋顶服务",
        "keywords": ["roofing", "roof repair", "roof installation", "roofer"],
        "license_types": ["C-39", "B"],
    },
    "hvac": {
        "name": "HVAC空调",
        "keywords": ["hvac", "air conditioning", "heating", "cooling"],
        "license_types": ["C-20", "C-38"],
    },
    "plumbing": {
        "name": "管道服务",
        "keywords": ["plumbing", "plumber", "pipe", "drain"],
        "license_types": ["C-36"],
    },
    "electrical": {
        "name": "电气服务",
        "keywords": ["electrical", "electrician", "wiring"],
        "license_types": ["C-10"],
    },
    "construction": {
        "name": "建筑装修",
        "keywords": ["construction", "general contractor", "remodeling"],
        "license_types": ["B"],
    },
}

# 美国各州信息
US_STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming"
}


@dataclass
class Company:
    """企业数据模型"""
    name: str
    legal_name: Optional[str] = None
    industry_id: Optional[str] = None
    state_code: str = ""
    city: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    website: str = ""
    license_number: str = ""
    license_type: str = ""
    license_expiry: Optional[str] = None
    is_verified: bool = False
    is_insured: bool = False
    founded_year: Optional[int] = None
    employees_count: Optional[str] = None
    description: str = ""
    source: str = ""
    source_url: str = ""
    rating: Optional[float] = None
    review_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None and v != ""}


@dataclass
class PriceRecord:
    """价格记录数据模型"""
    company_id: str
    service_type: str
    price_min: float
    price_max: float
    price_unit: str = "project"  # project, sqft, hour
    region_id: Optional[str] = None
    source: str = ""
    recorded_at: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class DataScraper:
    """数据爬虫基类"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.session: Optional[aiohttp.ClientSession] = None
        self.supabase: Optional[Client] = None
        
    async def init(self):
        """初始化连接"""
        self.session = aiohttp.ClientSession(
            headers={"User-Agent": self.ua.random},
            timeout=aiohttp.ClientTimeout(total=30)
        )
        if SUPABASE_URL and SUPABASE_KEY:
            self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
    async def close(self):
        """关闭连接"""
        if self.session:
            await self.session.close()
            
    def get_headers(self) -> Dict[str, str]:
        """获取随机请求头"""
        return {
            "User-Agent": self.ua.random,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def fetch_page(self, url: str) -> Optional[str]:
        """获取页面内容"""
        try:
            async with self.session.get(url, headers=self.get_headers()) as response:
                if response.status == 200:
                    return await response.text()
                console.print(f"[yellow]警告: {url} 返回状态码 {response.status}[/yellow]")
                return None
        except Exception as e:
            console.print(f"[red]错误: 获取 {url} 失败 - {e}[/red]")
            raise
            
    def parse_html(self, html: str) -> BeautifulSoup:
        """解析HTML"""
        return BeautifulSoup(html, "lxml")


class CaliforniaCSLBScraper(DataScraper):
    """加州承包商执照委员会数据爬虫"""
    
    BASE_URL = "https://www.cslb.ca.gov"
    
    async def search_contractors(self, license_type: str, city: str = "") -> List[Company]:
        """搜索承包商"""
        companies = []
        # 注意: 实际实现需要遵守网站的robots.txt和服务条款
        # 这里是示例代码，实际使用时需要调整
        
        console.print(f"[blue]搜索加州 {license_type} 类承包商...[/blue]")
        
        # 模拟数据 (实际需要实现真实爬取逻辑)
        sample_companies = [
            Company(
                name="Premium Roofing Inc",
                legal_name="Premium Roofing Inc.",
                industry_id="roofing",
                state_code="CA",
                city="Los Angeles",
                address="123 Main St, Los Angeles, CA 90001",
                phone="(555) 123-4567",
                license_number="1234567",
                license_type="C-39",
                license_expiry="2027-12-31",
                is_verified=True,
                is_insured=True,
                founded_year=2008,
                source="california_cslb",
                source_url=self.BASE_URL,
            ),
        ]
        
        return sample_companies


class YelpScraper(DataScraper):
    """Yelp数据爬虫 - 获取评价和评分"""
    
    BASE_URL = "https://www.yelp.com"
    
    async def search_businesses(self, category: str, location: str) -> List[Dict]:
        """搜索商家"""
        # 注意: Yelp有严格的爬取限制，建议使用官方API
        # 这里是示例代码
        console.print(f"[blue]在Yelp搜索 {location} 的 {category}...[/blue]")
        
        results = []
        # 实际需要使用Yelp Fusion API
        return results


class BBBScraper(DataScraper):
    """BBB商业改进局数据爬虫"""
    
    BASE_URL = "https://www.bbb.org"
    
    async def search_businesses(self, category: str, state: str) -> List[Dict]:
        """搜索BBB认证商家"""
        console.print(f"[blue]在BBB搜索 {state} 的 {category}...[/blue]")
        
        results = []
        # 实际需要实现真实爬取逻辑
        return results


class PermitDataScraper(DataScraper):
    """建筑许可证数据爬虫 - 用于获取价格数据"""
    
    async def fetch_permits(self, state: str, city: str) -> List[Dict]:
        """获取建筑许可证数据"""
        console.print(f"[blue]获取 {city}, {state} 的建筑许可证数据...[/blue]")
        
        # 许可证数据通常包含项目价值，可用于估算价格
        # 需要针对每个城市/县的开放数据门户实现
        permits = []
        return permits


class DataProcessor:
    """数据处理器"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        
    def deduplicate_companies(self, companies: List[Company]) -> List[Company]:
        """企业去重"""
        seen = set()
        unique = []
        
        for company in companies:
            # 基于名称和地址生成唯一标识
            key = hashlib.md5(
                f"{company.name.lower()}{company.state_code}{company.city.lower()}".encode()
            ).hexdigest()
            
            if key not in seen:
                seen.add(key)
                unique.append(company)
                
        return unique
    
    def validate_company(self, company: Company) -> bool:
        """验证企业数据"""
        if not company.name or len(company.name) < 2:
            return False
        if not company.state_code or company.state_code not in US_STATES:
            return False
        return True
    
    def calculate_price_stats(self, prices: List[float]) -> Dict[str, float]:
        """计算价格统计"""
        if not prices:
            return {}
        
        import numpy as np
        
        return {
            "min": float(np.min(prices)),
            "max": float(np.max(prices)),
            "avg": float(np.mean(prices)),
            "median": float(np.median(prices)),
            "std": float(np.std(prices)),
        }
    
    async def save_company(self, company: Company) -> Optional[str]:
        """保存企业到数据库"""
        try:
            data = company.to_dict()
            data["created_at"] = datetime.utcnow().isoformat()
            data["updated_at"] = datetime.utcnow().isoformat()
            
            # 检查是否已存在
            existing = self.supabase.table("companies").select("id").eq(
                "license_number", company.license_number
            ).eq("state_code", company.state_code).execute()
            
            if existing.data:
                # 更新现有记录
                result = self.supabase.table("companies").update(data).eq(
                    "id", existing.data[0]["id"]
                ).execute()
                return existing.data[0]["id"]
            else:
                # 插入新记录
                result = self.supabase.table("companies").insert(data).execute()
                if result.data:
                    return result.data[0]["id"]
                    
        except Exception as e:
            console.print(f"[red]保存企业失败: {e}[/red]")
            
        return None
    
    async def save_price_record(self, price: PriceRecord) -> bool:
        """保存价格记录"""
        try:
            data = price.to_dict()
            data["created_at"] = datetime.utcnow().isoformat()
            
            self.supabase.table("price_records").insert(data).execute()
            return True
        except Exception as e:
            console.print(f"[red]保存价格记录失败: {e}[/red]")
            return False


class ScraperOrchestrator:
    """爬虫调度器"""
    
    def __init__(self):
        self.scrapers = {}
        self.processor: Optional[DataProcessor] = None
        self.supabase: Optional[Client] = None
        
    async def init(self):
        """初始化所有爬虫"""
        if SUPABASE_URL and SUPABASE_KEY:
            self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            self.processor = DataProcessor(self.supabase)
        
        self.scrapers = {
            "california_cslb": CaliforniaCSLBScraper(),
            "yelp": YelpScraper(),
            "bbb": BBBScraper(),
            "permits": PermitDataScraper(),
        }
        
        for scraper in self.scrapers.values():
            await scraper.init()
            
    async def close(self):
        """关闭所有爬虫"""
        for scraper in self.scrapers.values():
            await scraper.close()
            
    async def run_full_scrape(self, states: List[str] = None, industries: List[str] = None):
        """运行完整爬取任务"""
        states = states or list(US_STATES.keys())[:5]  # 默认前5个州
        industries = industries or list(INDUSTRIES.keys())
        
        console.print(f"[green]开始数据爬取任务[/green]")
        console.print(f"目标州: {states}")
        console.print(f"目标行业: {industries}")
        
        total_companies = 0
        total_prices = 0
        
        with Progress() as progress:
            task = progress.add_task("[cyan]爬取数据...", total=len(states) * len(industries))
            
            for state in states:
                for industry in industries:
                    try:
                        # 从各数据源获取数据
                        companies = await self._scrape_state_industry(state, industry)
                        
                        # 处理和保存数据
                        if self.processor:
                            companies = self.processor.deduplicate_companies(companies)
                            for company in companies:
                                if self.processor.validate_company(company):
                                    company_id = await self.processor.save_company(company)
                                    if company_id:
                                        total_companies += 1
                                        
                    except Exception as e:
                        console.print(f"[red]爬取 {state}/{industry} 失败: {e}[/red]")
                        
                    progress.advance(task)
                    await asyncio.sleep(1)  # 避免请求过快
                    
        console.print(f"[green]爬取完成! 保存了 {total_companies} 家企业[/green]")
        
        return {
            "companies": total_companies,
            "prices": total_prices,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    async def _scrape_state_industry(self, state: str, industry: str) -> List[Company]:
        """爬取特定州和行业的数据"""
        companies = []
        
        # 根据州选择爬虫
        if state == "CA":
            cslb = self.scrapers.get("california_cslb")
            if cslb:
                license_types = INDUSTRIES.get(industry, {}).get("license_types", [])
                for lt in license_types:
                    results = await cslb.search_contractors(lt)
                    companies.extend(results)
                    
        # 从BBB获取数据
        bbb = self.scrapers.get("bbb")
        if bbb:
            keywords = INDUSTRIES.get(industry, {}).get("keywords", [])
            for keyword in keywords[:1]:  # 限制请求数量
                results = await bbb.search_businesses(keyword, state)
                # 转换为Company对象
                
        return companies


async def main():
    """主函数"""
    console.print("[bold blue]BizCompare Pro 数据爬虫系统[/bold blue]")
    console.print("=" * 50)
    
    # 检查环境变量
    if not SUPABASE_URL or not SUPABASE_KEY:
        console.print("[yellow]警告: 未配置Supabase，数据将不会保存到数据库[/yellow]")
    
    orchestrator = ScraperOrchestrator()
    
    try:
        await orchestrator.init()
        
        # 运行爬取任务
        # 可以通过命令行参数指定州和行业
        import sys
        
        states = sys.argv[1].split(",") if len(sys.argv) > 1 else ["CA", "TX", "NY"]
        industries = sys.argv[2].split(",") if len(sys.argv) > 2 else ["roofing", "hvac"]
        
        results = await orchestrator.run_full_scrape(states, industries)
        
        # 输出结果
        console.print("\n[bold green]爬取结果:[/bold green]")
        console.print(json.dumps(results, indent=2))
        
    finally:
        await orchestrator.close()


if __name__ == "__main__":
    asyncio.run(main())
