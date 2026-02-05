"""
多数据库管理器
支持 Supabase + Railway 双数据库架构
"""
import os
import asyncio
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from db_config import (
    SUPABASE_URL, SUPABASE_KEY, RAILWAY_URL,
    get_database_for_company, should_migrate_to_supabase,
    estimate_company_size_kb, update_database_stats,
    print_database_stats, DatabaseType
)

class MultiDatabaseManager:
    """多数据库管理器"""
    
    def __init__(self):
        """初始化数据库连接"""
        # Supabase 客户端
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("Missing Supabase credentials in environment variables")
        
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Railway PostgreSQL 连接
        if not RAILWAY_URL:
            raise ValueError("Missing Railway DATABASE_URL in environment variables")
        
        self.railway_conn = psycopg2.connect(RAILWAY_URL)
        self.railway_conn.autocommit = False
        
        print("✅ Connected to Supabase and Railway databases")
        
        # 更新数据库统计
        self._update_stats()
    
    def _update_stats(self):
        """更新数据库使用统计"""
        try:
            # Supabase 统计
            supabase_count = self.supabase.table('companies').select('id', count='exact').execute()
            supabase_size = len(str(supabase_count.data)) / 1024 / 1024  # 粗略估算
            
            # Railway 统计
            with self.railway_conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM companies")
                railway_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT pg_database_size(current_database())")
                railway_size = cursor.fetchone()[0] / 1024 / 1024  # MB
            
            update_database_stats('supabase', supabase_size, supabase_count.count or 0)
            update_database_stats('railway', railway_size, railway_count)
            
        except Exception as e:
            print(f"⚠️  Warning: Could not update database stats: {e}")
    
    def insert_company(self, company_data: Dict[str, Any]) -> tuple[str, DatabaseType]:
        """
        插入企业数据到合适的数据库
        
        Args:
            company_data: 企业数据字典
            
        Returns:
            (company_id, database_type) 元组
        """
        # 决定存储到哪个数据库
        target_db = get_database_for_company(company_data)
        
        try:
            if target_db == 'supabase':
                # 插入到 Supabase
                result = self.supabase.table('companies').insert(company_data).execute()
                company_id = result.data[0]['id'] if result.data else None
                print(f"✅ Inserted into Supabase: {company_data.get('name')}")
                
            else:
                # 插入到 Railway
                with self.railway_conn.cursor() as cursor:
                    columns = list(company_data.keys())
                    values = list(company_data.values())
                    
                    columns_str = ', '.join(columns)
                    placeholders = ', '.join(['%s'] * len(values))
                    
                    query = f"""
                    INSERT INTO companies ({columns_str})
                    VALUES ({placeholders})
                    RETURNING id
                    """
                    
                    cursor.execute(query, values)
                    company_id = cursor.fetchone()[0]
                    self.railway_conn.commit()
                    
                print(f"✅ Inserted into Railway: {company_data.get('name')}")
            
            return company_id, target_db
            
        except Exception as e:
            print(f"❌ Error inserting company {company_data.get('name')}: {e}")
            if target_db == 'railway':
                self.railway_conn.rollback()
            raise
    
    def batch_insert_companies(self, companies: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        批量插入企业数据
        
        Args:
            companies: 企业数据列表
            
        Returns:
            插入统计 {'supabase': count, 'railway': count}
        """
        stats = {'supabase': 0, 'railway': 0, 'errors': 0}
        
        for company_data in companies:
            try:
                _, db_type = self.insert_company(company_data)
                stats[db_type] += 1
            except Exception as e:
                stats['errors'] += 1
                print(f"⚠️  Skipping company due to error: {e}")
        
        print(f"\n📊 Batch insert complete:")
        print(f"  Supabase: {stats['supabase']} companies")
        print(f"  Railway: {stats['railway']} companies")
        print(f"  Errors: {stats['errors']}")
        
        return stats
    
    def search_companies(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        跨数据库搜索企业
        
        Args:
            query: 搜索关键词
            limit: 返回结果数量限制
            
        Returns:
            企业数据列表
        """
        results = []
        
        try:
            # 1. 先搜索 Supabase（热门企业，速度快）
            supabase_results = self.supabase.table('companies') \
                .select('*') \
                .ilike('name', f'%{query}%') \
                .limit(limit) \
                .execute()
            
            results.extend(supabase_results.data or [])
            print(f"🔍 Found {len(results)} companies in Supabase")
            
            # 2. 如果结果不足，再搜索 Railway
            if len(results) < 10:
                remaining = limit - len(results)
                
                with self.railway_conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(
                        "SELECT * FROM companies WHERE name ILIKE %s LIMIT %s",
                        (f'%{query}%', remaining)
                    )
                    railway_results = cursor.fetchall()
                    results.extend([dict(row) for row in railway_results])
                    
                print(f"🔍 Found {len(railway_results)} additional companies in Railway")
        
        except Exception as e:
            print(f"❌ Search error: {e}")
        
        return results
    
    def get_company_by_id(self, company_id: str) -> Optional[Dict[str, Any]]:
        """
        根据 ID 获取企业详情（跨数据库）
        
        Args:
            company_id: 企业 ID
            
        Returns:
            企业数据字典或 None
        """
        try:
            # 1. 先尝试 Supabase
            result = self.supabase.table('companies') \
                .select('*') \
                .eq('id', company_id) \
                .single() \
                .execute()
            
            if result.data:
                print(f"✅ Found in Supabase: {company_id}")
                return result.data
            
        except Exception as e:
            print(f"Not in Supabase, trying Railway: {e}")
        
        try:
            # 2. 再尝试 Railway
            with self.railway_conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "SELECT * FROM companies WHERE id = %s",
                    (company_id,)
                )
                row = cursor.fetchone()
                
                if row:
                    print(f"✅ Found in Railway: {company_id}")
                    return dict(row)
        
        except Exception as e:
            print(f"❌ Error getting company: {e}")
        
        return None
    
    def migrate_company_to_supabase(self, company_id: str) -> bool:
        """
        将企业从 Railway 迁移到 Supabase（热门企业优化）
        
        Args:
            company_id: 企业 ID
            
        Returns:
            是否迁移成功
        """
        try:
            # 1. 从 Railway 读取
            with self.railway_conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "SELECT * FROM companies WHERE id = %s",
                    (company_id,)
                )
                company = cursor.fetchone()
                
                if not company:
                    print(f"⚠️  Company {company_id} not found in Railway")
                    return False
                
                company_data = dict(company)
            
            # 2. 插入到 Supabase
            self.supabase.table('companies').insert(company_data).execute()
            print(f"✅ Migrated to Supabase: {company_data.get('name')}")
            
            # 3. 从 Railway 删除
            with self.railway_conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM companies WHERE id = %s",
                    (company_id,)
                )
                self.railway_conn.commit()
            
            print(f"✅ Removed from Railway: {company_id}")
            return True
            
        except Exception as e:
            print(f"❌ Migration error: {e}")
            self.railway_conn.rollback()
            return False
    
    def update_company_stats(self, company_id: str, increment_search: bool = False, increment_view: bool = False):
        """
        更新企业访问统计，并判断是否需要迁移
        
        Args:
            company_id: 企业 ID
            increment_search: 是否增加搜索计数
            increment_view: 是否增加浏览计数
        """
        try:
            # 尝试在 Railway 更新
            with self.railway_conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # 更新统计
                update_fields = []
                if increment_search:
                    update_fields.append("search_count = COALESCE(search_count, 0) + 1")
                if increment_view:
                    update_fields.append("view_count = COALESCE(view_count, 0) + 1")
                
                if update_fields:
                    cursor.execute(f"""
                        UPDATE companies 
                        SET {', '.join(update_fields)}
                        WHERE id = %s
                        RETURNING search_count, view_count
                    """, (company_id,))
                    
                    result = cursor.fetchone()
                    self.railway_conn.commit()
                    
                    if result:
                        # 检查是否需要迁移到 Supabase
                        if should_migrate_to_supabase(
                            company_id,
                            result['search_count'],
                            result['view_count']
                        ):
                            print(f"🔄 Migrating hot company {company_id} to Supabase...")
                            self.migrate_company_to_supabase(company_id)
        
        except Exception as e:
            print(f"⚠️  Error updating stats: {e}")
            self.railway_conn.rollback()
    
    def get_stats(self) -> Dict[str, Any]:
        """获取数据库统计信息"""
        self._update_stats()
        from db_config import get_database_stats
        return get_database_stats()
    
    def print_stats(self):
        """打印数据库统计信息"""
        self._update_stats()
        print_database_stats()
    
    def close(self):
        """关闭所有数据库连接"""
        try:
            self.railway_conn.close()
            print("✅ Database connections closed")
        except Exception as e:
            print(f"⚠️  Error closing connections: {e}")
    
    def __enter__(self):
        """上下文管理器入口"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器退出"""
        self.close()


# 测试代码
if __name__ == '__main__':
    # 需要先设置环境变量
    print("Testing Multi-Database Manager...\n")
    
    try:
        with MultiDatabaseManager() as db_manager:
            # 显示初始统计
            db_manager.print_stats()
            
            # 测试插入
            test_company = {
                'name': 'Test Company Inc.',
                'ein': '12-3456789',
                'address': '123 Main St, New York, NY 10001',
                'phone': '(555) 123-4567',
                'website': 'https://testcompany.com',
                'state': 'NY',
                'annual_revenue': 500000,
            }
            
            print("\n" + "="*60)
            print("Testing company insertion...")
            print("="*60)
            
            company_id, db_type = db_manager.insert_company(test_company)
            print(f"\nInserted company ID: {company_id} into {db_type}")
            
            # 测试搜索
            print("\n" + "="*60)
            print("Testing search...")
            print("="*60)
            
            results = db_manager.search_companies("Test Company")
            print(f"\nFound {len(results)} results")
            
            # 测试获取详情
            if company_id:
                print("\n" + "="*60)
                print("Testing get by ID...")
                print("="*60)
                
                company = db_manager.get_company_by_id(company_id)
                if company:
                    print(f"\nRetrieved: {company['name']}")
            
            # 显示最终统计
            db_manager.print_stats()
            
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
