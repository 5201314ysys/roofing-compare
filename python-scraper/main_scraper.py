"""
PriceCompare Pro - 主数据挖掘脚本
从多个数据源获取企业和价格数据
"""

import os
import sys
import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from dotenv import load_dotenv

import aiohttp
import pandas as pd
from supabase import create_client, Client
from tenacity import retry, stop_after_attempt, wait_exponential
from rich.console import Console
from rich.progress import Progress, TaskID

# 加载环境变量
load_dotenv()

console = Console()

# Supabase 配置
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    console.print("[red]错误: 缺少 Supabase 配置，请检查 .env 文件[/red]")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@dataclass
class Company:
    """企业数据模型"""
    name: str
    legal_name: Optional[str]
    industry_id: str
    state_code: str
    city: str
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    license_number: Optional[str]
    license_expiry: Optional[str]
    founded_year: Optional[int]
    employees: Optional[str]
    is_verified: bool = False
    source: str = 'scraper'
    source_id: Optional[str] = None


@dataclass
class PriceRecord:
    """价格记录数据模型"""
    company_id: str
    service_type: str
    price_low: float
    price_high: float
    price_unit: str
    source: str
    source_url: Optional[str]
    recorded_at: str


@dataclass
class Permit:
    """许可证/项目数据模型"""
    company_id: str
    permit_number: str
    permit_type: str
    issue_date: str
    project_address: str
    project_description: Optional[str]
    reported_cost: Optional[float]
    source: str
    source_url: Optional[str]


class DataScraper:
    """数据爬虫基类"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def fetch_json(self, url: str, params: Optional[Dict] = None) -> Dict:
        """获取 JSON 数据"""
        async with self.session.get(url, params=params) as response:
            response.raise_for_status()
            return await response.json()
    
    async def fetch_text(self, url: str) -> str:
        """获取文本数据"""
        async with self.session.get(url) as response:
            response.raise_for_status()
            return await response.text()


class ChicagoPermitScraper(DataScraper):
    """
    芝加哥市建筑许可证数据爬虫
    数据源: Chicago Data Portal - Building Permits
    """
    
    BASE_URL = "https://data.cityofchicago.org/resource/ydr8-5enu.json"
    
    async def fetch_permits(
        self, 
        limit: int = 1000, 
        offset: int = 0,
        work_type: Optional[str] = None,
        start_date: Optional[str] = None
    ) -> List[Dict]:
        """获取建筑许可证数据"""
        params = {
            '$limit': limit,
            '$offset': offset,
            '$order': 'issue_date DESC',
        }
        
        where_clauses = []
        
        if work_type:
            where_clauses.append(f"work_type='{work_type}'")
        
        if start_date:
            where_clauses.append(f"issue_date >= '{start_date}'")
        
        if where_clauses:
            params['$where'] = ' AND '.join(where_clauses)
        
        return await self.fetch_json(self.BASE_URL, params)
    
    def parse_permit(self, data: Dict) -> Optional[Permit]:
        """解析许可证数据"""
        try:
            return Permit(
                company_id='',  # 需要后续匹配
                permit_number=data.get('permit_', ''),
                permit_type=data.get('permit_type', ''),
                issue_date=data.get('issue_date', '')[:10] if data.get('issue_date') else '',
                project_address=f"{data.get('street_number', '')} {data.get('street_direction', '')} {data.get('street_name', '')}".strip(),
                project_description=data.get('work_description', ''),
                reported_cost=float(data.get('reported_cost', 0)) if data.get('reported_cost') else None,
                source='chicago_data_portal',
                source_url=f"https://data.cityofchicago.org/resource/ydr8-5enu.json?permit_={data.get('permit_', '')}"
            )
        except Exception as e:
            console.print(f"[yellow]解析许可证数据失败: {e}[/yellow]")
            return None


class NYCPermitScraper(DataScraper):
    """
    纽约市建筑许可证数据爬虫
    数据源: NYC Open Data - DOB Permit Issuance
    """
    
    BASE_URL = "https://data.cityofnewyork.us/resource/ipu4-2vj7.json"
    
    async def fetch_permits(
        self, 
        limit: int = 1000, 
        offset: int = 0,
        job_type: Optional[str] = None
    ) -> List[Dict]:
        """获取建筑许可证数据"""
        params = {
            '$limit': limit,
            '$offset': offset,
            '$order': 'issuance_date DESC',
        }
        
        if job_type:
            params['$where'] = f"job_type='{job_type}'"
        
        return await self.fetch_json(self.BASE_URL, params)


class LAPermitScraper(DataScraper):
    """
    洛杉矶市建筑许可证数据爬虫
    数据源: LA Open Data - Building and Safety Permit Information
    """
    
    BASE_URL = "https://data.lacity.org/resource/yv23-pmwf.json"
    
    async def fetch_permits(
        self, 
        limit: int = 1000, 
        offset: int = 0
    ) -> List[Dict]:
        """获取建筑许可证数据"""
        params = {
            '$limit': limit,
            '$offset': offset,
            '$order': 'issue_date DESC',
        }
        
        return await self.fetch_json(self.BASE_URL, params)


class OpenCorporatesScraper(DataScraper):
    """
    OpenCorporates 企业信息爬虫
    获取企业工商注册信息
    """
    
    BASE_URL = "https://api.opencorporates.com/v0.4"
    
    async def search_companies(
        self,
        query: str,
        jurisdiction_code: str = 'us',
        per_page: int = 30
    ) -> List[Dict]:
        """搜索企业"""
        url = f"{self.BASE_URL}/companies/search"
        params = {
            'q': query,
            'jurisdiction_code': jurisdiction_code,
            'per_page': per_page,
        }
        
        # 注意: OpenCorporates API 可能需要 API key
        api_key = os.getenv('OPENCORPORATES_API_KEY')
        if api_key:
            params['api_token'] = api_key
        
        try:
            result = await self.fetch_json(url, params)
            return result.get('results', {}).get('companies', [])
        except Exception as e:
            console.print(f"[yellow]OpenCorporates 搜索失败: {e}[/yellow]")
            return []


class USASpendingScraper(DataScraper):
    """
    USASpending 政府合同数据爬虫
    获取企业政府合同信息
    """
    
    BASE_URL = "https://api.usaspending.gov/api/v2"
    
    async def search_contracts(
        self,
        keyword: str,
        limit: int = 100
    ) -> List[Dict]:
        """搜索政府合同"""
        url = f"{self.BASE_URL}/search/spending_by_award/"
        
        payload = {
            "filters": {
                "keywords": [keyword],
                "award_type_codes": ["A", "B", "C", "D"]  # 合同类型
            },
            "fields": [
                "Award ID",
                "Recipient Name", 
                "Award Amount",
                "Start Date",
                "End Date",
                "Awarding Agency",
                "Description"
            ],
            "page": 1,
            "limit": limit,
            "sort": "Award Amount",
            "order": "desc"
        }
        
        try:
            async with self.session.post(url, json=payload) as response:
                response.raise_for_status()
                result = await response.json()
                return result.get('results', [])
        except Exception as e:
            console.print(f"[yellow]USASpending 搜索失败: {e}[/yellow]")
            return []


class DataProcessor:
    """数据处理器 - 清洗和存储数据"""
    
    def __init__(self):
        self.supabase = supabase
    
    async def upsert_company(self, company: Company) -> Optional[str]:
        """插入或更新企业数据"""
        try:
            # 检查企业是否已存在
            existing = self.supabase.table('companies').select('id').eq(
                'name', company.name
            ).eq('state_code', company.state_code).execute()
            
            company_data = asdict(company)
            company_data['updated_at'] = datetime.utcnow().isoformat()
            
            if existing.data:
                # 更新
                company_id = existing.data[0]['id']
                self.supabase.table('companies').update(company_data).eq(
                    'id', company_id
                ).execute()
                return company_id
            else:
                # 插入
                company_data['created_at'] = datetime.utcnow().isoformat()
                result = self.supabase.table('companies').insert(company_data).execute()
                return result.data[0]['id'] if result.data else None
                
        except Exception as e:
            console.print(f"[red]保存企业数据失败: {e}[/red]")
            return None
    
    async def insert_price_record(self, price: PriceRecord) -> bool:
        """插入价格记录"""
        try:
            price_data = asdict(price)
            price_data['created_at'] = datetime.utcnow().isoformat()
            
            self.supabase.table('price_records').insert(price_data).execute()
            return True
        except Exception as e:
            console.print(f"[red]保存价格记录失败: {e}[/red]")
            return False
    
    async def insert_permit(self, permit: Permit) -> bool:
        """插入许可证记录"""
        try:
            # 检查是否已存在
            existing = self.supabase.table('permits').select('id').eq(
                'permit_number', permit.permit_number
            ).execute()
            
            if existing.data:
                return False  # 已存在，跳过
            
            permit_data = asdict(permit)
            permit_data['created_at'] = datetime.utcnow().isoformat()
            
            self.supabase.table('permits').insert(permit_data).execute()
            return True
        except Exception as e:
            console.print(f"[red]保存许可证数据失败: {e}[/red]")
            return False
    
    def extract_price_from_permit(self, permit: Permit) -> Optional[PriceRecord]:
        """从许可证数据中提取价格信息"""
        if not permit.reported_cost or permit.reported_cost <= 0:
            return None
        
        # 根据项目描述判断服务类型
        description = (permit.project_description or '').lower()
        
        service_type = 'general'
        if 'roof' in description:
            service_type = 'roofing'
        elif 'hvac' in description or 'heating' in description or 'cooling' in description:
            service_type = 'hvac'
        elif 'plumb' in description:
            service_type = 'plumbing'
        elif 'electric' in description:
            service_type = 'electrical'
        
        return PriceRecord(
            company_id=permit.company_id,
            service_type=service_type,
            price_low=permit.reported_cost * 0.8,  # 估计范围
            price_high=permit.reported_cost * 1.2,
            price_unit='project',
            source=permit.source,
            source_url=permit.source_url,
            recorded_at=permit.issue_date
        )


async def run_chicago_scraper():
    """运行芝加哥数据爬虫"""
    console.print("\n[bold blue]开始爬取芝加哥建筑许可证数据...[/bold blue]")
    
    processor = DataProcessor()
    
    async with ChicagoPermitScraper() as scraper:
        # 获取最近30天的数据
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        total_permits = 0
        offset = 0
        limit = 1000
        
        with Progress() as progress:
            task = progress.add_task("[cyan]爬取中...", total=None)
            
            while True:
                permits_data = await scraper.fetch_permits(
                    limit=limit,
                    offset=offset,
                    start_date=start_date
                )
                
                if not permits_data:
                    break
                
                for data in permits_data:
                    permit = scraper.parse_permit(data)
                    if permit:
                        await processor.insert_permit(permit)
                        
                        # 提取价格信息
                        price = processor.extract_price_from_permit(permit)
                        if price:
                            await processor.insert_price_record(price)
                
                total_permits += len(permits_data)
                progress.update(task, advance=len(permits_data), description=f"[cyan]已处理 {total_permits} 条记录")
                
                if len(permits_data) < limit:
                    break
                
                offset += limit
                await asyncio.sleep(0.5)  # 限流
        
        console.print(f"[green]✓ 芝加哥数据爬取完成，共处理 {total_permits} 条许可证记录[/green]")


async def run_all_scrapers():
    """运行所有爬虫"""
    console.print("[bold]PriceCompare Pro 数据爬虫[/bold]")
    console.print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        # 运行各个爬虫
        await run_chicago_scraper()
        # 可以添加更多爬虫
        # await run_nyc_scraper()
        # await run_la_scraper()
        
        console.print("\n[bold green]所有数据爬取任务完成！[/bold green]")
        
    except Exception as e:
        console.print(f"\n[bold red]爬取过程中出错: {e}[/bold red]")
        raise


if __name__ == '__main__':
    asyncio.run(run_all_scrapers())
