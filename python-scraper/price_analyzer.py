"""
价格分析和计算模块
从许可证数据中提取和计算价格信息
"""

import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import statistics


@dataclass
class PriceAnalysis:
    """价格分析结果"""
    service_type: str
    min_price: float
    max_price: float
    avg_price: float
    median_price: float
    sample_size: int
    price_per_sqft: Optional[float] = None
    price_trend: Optional[str] = None  # 'up', 'down', 'stable'


class PriceCalculator:
    """价格计算器"""
    
    # 常见项目面积估算 (平方英尺)
    PROJECT_SIZE_ESTIMATES = {
        'roofing': {
            'small': 1500,    # 小型住宅
            'medium': 2500,   # 中型住宅
            'large': 4000,    # 大型住宅
            'commercial': 10000  # 商业
        },
        'hvac': {
            'small': 1000,
            'medium': 2000,
            'large': 3500,
            'commercial': 8000
        },
        'plumbing': {
            'small': 500,
            'medium': 1500,
            'large': 3000,
            'commercial': 5000
        },
        'electrical': {
            'small': 800,
            'medium': 1800,
            'large': 3000,
            'commercial': 6000
        }
    }
    
    # 服务类型关键词
    SERVICE_KEYWORDS = {
        'roofing': [
            'roof', 'roofing', 'shingle', 're-roof', 'reroof', 
            'roof repair', 'roof replacement', 'tile roof'
        ],
        'hvac': [
            'hvac', 'heating', 'cooling', 'air condition', 'a/c', 'ac unit',
            'furnace', 'ductwork', 'ventilation', 'heat pump'
        ],
        'plumbing': [
            'plumb', 'plumbing', 'pipe', 'drain', 'sewer', 'water heater',
            'bathroom', 'toilet', 'faucet', 'water line'
        ],
        'electrical': [
            'electric', 'electrical', 'wiring', 'panel', 'circuit',
            'outlet', 'lighting', 'rewire', 'breaker'
        ],
        'construction': [
            'construct', 'build', 'addition', 'remodel', 'renovation',
            'alteration', 'new build', 'extension'
        ],
        'landscaping': [
            'landscape', 'landscaping', 'garden', 'irrigation',
            'lawn', 'sprinkler', 'hardscape', 'patio'
        ]
    }
    
    @classmethod
    def detect_service_type(cls, description: str) -> str:
        """从描述中检测服务类型"""
        if not description:
            return 'general'
        
        description_lower = description.lower()
        
        for service_type, keywords in cls.SERVICE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in description_lower:
                    return service_type
        
        return 'general'
    
    @classmethod
    def extract_square_footage(cls, text: str) -> Optional[float]:
        """从文本中提取面积"""
        if not text:
            return None
        
        # 常见面积表示模式
        patterns = [
            r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|square\s*feet?|sf)',
            r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*sqft',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                value = match.group(1).replace(',', '')
                return float(value)
        
        return None
    
    @classmethod
    def estimate_price_per_sqft(
        cls, 
        total_cost: float, 
        description: str,
        service_type: str
    ) -> Optional[float]:
        """估算每平方英尺价格"""
        # 尝试从描述中提取面积
        sqft = cls.extract_square_footage(description)
        
        if sqft and sqft > 0:
            return round(total_cost / sqft, 2)
        
        # 使用估算面积
        if service_type in cls.PROJECT_SIZE_ESTIMATES:
            # 根据成本估算项目规模
            estimates = cls.PROJECT_SIZE_ESTIMATES[service_type]
            
            if total_cost < 5000:
                estimated_sqft = estimates['small']
            elif total_cost < 15000:
                estimated_sqft = estimates['medium']
            elif total_cost < 50000:
                estimated_sqft = estimates['large']
            else:
                estimated_sqft = estimates['commercial']
            
            return round(total_cost / estimated_sqft, 2)
        
        return None
    
    @classmethod
    def analyze_prices(
        cls, 
        prices: List[float], 
        service_type: str
    ) -> Optional[PriceAnalysis]:
        """分析价格数据"""
        if not prices or len(prices) < 3:
            return None
        
        # 过滤异常值 (使用 IQR 方法)
        sorted_prices = sorted(prices)
        q1 = sorted_prices[len(sorted_prices) // 4]
        q3 = sorted_prices[3 * len(sorted_prices) // 4]
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        filtered_prices = [p for p in prices if lower_bound <= p <= upper_bound]
        
        if len(filtered_prices) < 3:
            filtered_prices = prices
        
        return PriceAnalysis(
            service_type=service_type,
            min_price=min(filtered_prices),
            max_price=max(filtered_prices),
            avg_price=round(statistics.mean(filtered_prices), 2),
            median_price=round(statistics.median(filtered_prices), 2),
            sample_size=len(filtered_prices)
        )
    
    @classmethod
    def calculate_price_trend(
        cls,
        historical_prices: List[Tuple[datetime, float]]
    ) -> str:
        """计算价格趋势"""
        if len(historical_prices) < 2:
            return 'stable'
        
        # 按日期排序
        sorted_prices = sorted(historical_prices, key=lambda x: x[0])
        
        # 比较前半和后半的平均价格
        mid = len(sorted_prices) // 2
        earlier_avg = statistics.mean([p[1] for p in sorted_prices[:mid]])
        later_avg = statistics.mean([p[1] for p in sorted_prices[mid:]])
        
        change_pct = (later_avg - earlier_avg) / earlier_avg * 100
        
        if change_pct > 5:
            return 'up'
        elif change_pct < -5:
            return 'down'
        else:
            return 'stable'


class ContractorMatcher:
    """承包商匹配器 - 从许可证数据中识别承包商"""
    
    @staticmethod
    def normalize_name(name: str) -> str:
        """标准化公司名称"""
        if not name:
            return ''
        
        # 转换为大写并去除多余空格
        normalized = ' '.join(name.upper().split())
        
        # 移除常见后缀
        suffixes = [
            ' INC', ' INC.', ' LLC', ' LLC.', ' CO', ' CO.',
            ' CORP', ' CORP.', ' LTD', ' LTD.', ' LP', ' LP.'
        ]
        
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)]
        
        return normalized.strip()
    
    @staticmethod
    def extract_contractor_from_permit(permit_data: Dict) -> Optional[Dict]:
        """从许可证数据中提取承包商信息"""
        contractor_fields = [
            'contractor_name', 'contact_1_name', 'applicant_name',
            'owner_name', 'business_name', 'company_name'
        ]
        
        contractor_name = None
        for field in contractor_fields:
            if field in permit_data and permit_data[field]:
                contractor_name = permit_data[field]
                break
        
        if not contractor_name:
            return None
        
        # 提取联系信息
        return {
            'name': contractor_name,
            'phone': permit_data.get('phone', permit_data.get('contact_phone')),
            'email': permit_data.get('email', permit_data.get('contact_email')),
            'license': permit_data.get('license_number', permit_data.get('contractor_license')),
            'address': permit_data.get('contractor_address', permit_data.get('business_address'))
        }
    
    @classmethod
    def match_contractor_to_company(
        cls,
        contractor_name: str,
        existing_companies: List[Dict]
    ) -> Optional[str]:
        """匹配承包商到现有企业"""
        normalized_name = cls.normalize_name(contractor_name)
        
        for company in existing_companies:
            company_normalized = cls.normalize_name(company.get('name', ''))
            
            # 精确匹配
            if normalized_name == company_normalized:
                return company['id']
            
            # 部分匹配 (名称包含关系)
            if normalized_name in company_normalized or company_normalized in normalized_name:
                return company['id']
        
        return None
