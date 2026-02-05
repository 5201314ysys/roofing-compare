"""
多数据库配置和路由模块
支持 Supabase (主数据库) + Railway (辅助数据库)
"""
import os
from typing import Literal, Dict, Any
from dataclasses import dataclass

# 数据库连接配置
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
RAILWAY_URL = os.getenv('RAILWAY_DATABASE_URL')

# 数据库类型
DatabaseType = Literal['supabase', 'railway']

@dataclass
class DatabaseConfig:
    """数据库配置"""
    name: str
    max_size_mb: int
    current_size_mb: int = 0
    company_count: int = 0
    
    @property
    def remaining_mb(self) -> int:
        return self.max_size_mb - self.current_size_mb
    
    @property
    def is_full(self) -> bool:
        return self.remaining_mb < 10  # 剩余小于 10MB 视为已满
    
    @property
    def usage_percent(self) -> float:
        return (self.current_size_mb / self.max_size_mb) * 100

# 数据库配置实例
DATABASES = {
    'supabase': DatabaseConfig(
        name='Supabase',
        max_size_mb=500,  # 500MB 免费版
    ),
    'railway': DatabaseConfig(
        name='Railway',
        max_size_mb=8192,  # 8GB 免费版
    )
}

def get_database_for_company(company_data: Dict[str, Any]) -> DatabaseType:
    """
    根据企业数据决定存储到哪个数据库
    
    存储策略：
    - Supabase (500MB): 热门、高价值企业
    - Railway (8GB): 长尾、一般企业
    
    优先级（存入 Supabase）：
    1. 上市公司（有 SEC CIK 编号）
    2. BBB A+ 或 A 评级
    3. 大型联邦承包商（年合同额 > $1M）
    4. 财富 500 强企业
    5. 员工数 > 1000
    
    Args:
        company_data: 企业数据字典
        
    Returns:
        'supabase' 或 'railway'
    """
    # 检查 Supabase 是否已满
    if DATABASES['supabase'].is_full:
        return 'railway'
    
    # 1. 上市公司 - 最高优先级
    if company_data.get('cik_number'):
        return 'supabase'
    
    # 2. 高 BBB 评级
    bbb_rating = company_data.get('bbb_rating', '').upper()
    if bbb_rating in ['A+', 'A']:
        return 'supabase'
    
    # 3. 大型承包商
    annual_revenue = company_data.get('annual_revenue', 0)
    if isinstance(annual_revenue, (int, float)) and annual_revenue > 1_000_000:
        return 'supabase'
    
    # 4. 财富 500 强标志
    if company_data.get('is_fortune_500'):
        return 'supabase'
    
    # 5. 大型企业（员工数）
    employee_count = company_data.get('employee_count', 0)
    if isinstance(employee_count, int) and employee_count > 1000:
        return 'supabase'
    
    # 6. 行业领导者
    if company_data.get('industry_rank', float('inf')) <= 100:
        return 'supabase'
    
    # 默认存入 Railway（容量大）
    return 'railway'

def should_migrate_to_supabase(company_id: str, search_count: int, view_count: int = 0) -> bool:
    """
    判断是否应该将高频访问企业从 Railway 迁移到 Supabase
    
    迁移条件：
    - 搜索次数 >= 10 次
    - 或页面浏览次数 >= 20 次
    - 且 Supabase 未满
    
    Args:
        company_id: 企业 ID
        search_count: 搜索次数
        view_count: 页面浏览次数
        
    Returns:
        True 表示应该迁移
    """
    if DATABASES['supabase'].is_full:
        return False
    
    return search_count >= 10 or view_count >= 20

def should_migrate_to_railway(company_id: str) -> bool:
    """
    判断是否应该将低频访问企业从 Supabase 迁移到 Railway
    
    迁移条件：
    - 90 天内搜索次数 < 3 次
    - 且不是优先级企业（非上市公司等）
    - 用于释放 Supabase 空间
    
    Args:
        company_id: 企业 ID
        
    Returns:
        True 表示应该迁移
    """
    # 仅在 Supabase 使用率 > 80% 时考虑迁移
    return DATABASES['supabase'].usage_percent > 80

def estimate_company_size_kb(company_data: Dict[str, Any]) -> float:
    """
    估算单个企业数据的存储大小（KB）
    
    组成部分：
    - 基础信息: ~1KB
    - 联系方式: ~0.5KB
    - 注册信息: ~0.5KB
    - 高管信息: ~0.5KB per executive (avg 3)
    - 财务记录: ~2KB
    - 评分数据: ~0.5KB per source (avg 3)
    - 执照信息: ~1KB per license (avg 2)
    - 其他: ~3KB
    
    Args:
        company_data: 企业数据字典
        
    Returns:
        估算大小（KB）
    """
    base_size = 1.0  # 基础信息
    
    # 联系方式
    if company_data.get('phone') or company_data.get('email'):
        base_size += 0.5
    
    # 注册信息
    if company_data.get('registration_number'):
        base_size += 0.5
    
    # 高管信息
    executives = company_data.get('executives', [])
    if isinstance(executives, list):
        base_size += len(executives) * 0.5
    
    # 财务记录
    if company_data.get('annual_revenue') or company_data.get('financials'):
        base_size += 2.0
    
    # 评分数据
    ratings = company_data.get('ratings', [])
    if isinstance(ratings, list):
        base_size += len(ratings) * 0.5
    elif company_data.get('bbb_rating'):
        base_size += 0.5
    
    # 执照信息
    licenses = company_data.get('licenses', [])
    if isinstance(licenses, list):
        base_size += len(licenses) * 1.0
    
    # 其他附加数据
    base_size += 3.0
    
    return base_size

def update_database_stats(db_type: DatabaseType, size_mb: float, count: int):
    """
    更新数据库统计信息
    
    Args:
        db_type: 数据库类型
        size_mb: 当前使用大小（MB）
        count: 企业数量
    """
    if db_type in DATABASES:
        DATABASES[db_type].current_size_mb = size_mb
        DATABASES[db_type].company_count = count

def get_database_stats() -> Dict[str, Any]:
    """
    获取所有数据库的统计信息
    
    Returns:
        统计信息字典
    """
    return {
        'supabase': {
            'name': DATABASES['supabase'].name,
            'max_size_mb': DATABASES['supabase'].max_size_mb,
            'current_size_mb': DATABASES['supabase'].current_size_mb,
            'remaining_mb': DATABASES['supabase'].remaining_mb,
            'usage_percent': round(DATABASES['supabase'].usage_percent, 2),
            'company_count': DATABASES['supabase'].company_count,
            'is_full': DATABASES['supabase'].is_full,
        },
        'railway': {
            'name': DATABASES['railway'].name,
            'max_size_mb': DATABASES['railway'].max_size_mb,
            'current_size_mb': DATABASES['railway'].current_size_mb,
            'remaining_mb': DATABASES['railway'].remaining_mb,
            'usage_percent': round(DATABASES['railway'].usage_percent, 2),
            'company_count': DATABASES['railway'].company_count,
            'is_full': DATABASES['railway'].is_full,
        },
        'total': {
            'max_size_mb': DATABASES['supabase'].max_size_mb + DATABASES['railway'].max_size_mb,
            'current_size_mb': DATABASES['supabase'].current_size_mb + DATABASES['railway'].current_size_mb,
            'company_count': DATABASES['supabase'].company_count + DATABASES['railway'].company_count,
            'usage_percent': round(
                ((DATABASES['supabase'].current_size_mb + DATABASES['railway'].current_size_mb) /
                 (DATABASES['supabase'].max_size_mb + DATABASES['railway'].max_size_mb)) * 100,
                2
            )
        }
    }

def print_database_stats():
    """打印数据库统计信息（用于调试）"""
    stats = get_database_stats()
    
    print("\n" + "="*60)
    print("📊 数据库使用统计")
    print("="*60)
    
    for db_name in ['supabase', 'railway']:
        db_stats = stats[db_name]
        print(f"\n{db_stats['name']}:")
        print(f"  容量: {db_stats['current_size_mb']:.1f} / {db_stats['max_size_mb']} MB ({db_stats['usage_percent']}%)")
        print(f"  剩余: {db_stats['remaining_mb']} MB")
        print(f"  企业: {db_stats['company_count']:,} 家")
        print(f"  状态: {'🔴 已满' if db_stats['is_full'] else '🟢 正常'}")
    
    print(f"\n总计:")
    print(f"  容量: {stats['total']['current_size_mb']:.1f} / {stats['total']['max_size_mb']} MB ({stats['total']['usage_percent']}%)")
    print(f"  企业: {stats['total']['company_count']:,} 家")
    print("="*60 + "\n")

if __name__ == '__main__':
    # 测试示例
    test_company_1 = {
        'name': 'Apple Inc.',
        'cik_number': '0000320193',
        'bbb_rating': 'A+',
        'annual_revenue': 394_000_000_000,
        'employee_count': 164_000,
    }
    
    test_company_2 = {
        'name': 'Local Roofing Co.',
        'annual_revenue': 500_000,
        'employee_count': 15,
    }
    
    print("测试企业分配策略:")
    print(f"Apple Inc. -> {get_database_for_company(test_company_1)}")
    print(f"Local Roofing Co. -> {get_database_for_company(test_company_2)}")
    
    print(f"\nApple Inc. 估算大小: {estimate_company_size_kb(test_company_1):.2f} KB")
    print(f"Local Roofing Co. 估算大小: {estimate_company_size_kb(test_company_2):.2f} KB")
