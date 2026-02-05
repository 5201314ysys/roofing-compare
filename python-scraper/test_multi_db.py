"""
测试多数据库连接和基本功能
运行前确保环境变量已设置：
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_KEY  
- RAILWAY_DATABASE_URL
"""
import os
import sys
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('../.env.local')

def test_environment():
    """测试环境变量"""
    print("="*60)
    print("🔧 检查环境变量")
    print("="*60)
    
    required_vars = {
        'NEXT_PUBLIC_SUPABASE_URL': os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
        'SUPABASE_SERVICE_KEY': os.getenv('SUPABASE_SERVICE_KEY'),
        'RAILWAY_DATABASE_URL': os.getenv('RAILWAY_DATABASE_URL'),
    }
    
    all_set = True
    for var_name, var_value in required_vars.items():
        if var_value:
            # 隐藏敏感信息
            display_value = var_value[:20] + '...' if len(var_value) > 20 else var_value
            print(f"✅ {var_name}: {display_value}")
        else:
            print(f"❌ {var_name}: NOT SET")
            all_set = False
    
    if not all_set:
        print("\n⚠️  请先在 .env.local 文件中设置所有必需的环境变量")
        return False
    
    print("\n✅ 所有环境变量已设置")
    return True

def test_supabase():
    """测试 Supabase 连接"""
    print("\n" + "="*60)
    print("🔵 测试 Supabase 连接")
    print("="*60)
    
    try:
        from supabase import create_client
        
        supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        
        # 测试查询
        result = supabase.table('companies').select('id', count='exact').limit(1).execute()
        
        print(f"✅ Supabase 连接成功！")
        print(f"   企业总数: {result.count if result.count else 0}")
        
        return True
        
    except Exception as e:
        print(f"❌ Supabase 连接失败: {e}")
        return False

def test_railway():
    """测试 Railway 连接"""
    print("\n" + "="*60)
    print("🚂 测试 Railway 连接")
    print("="*60)
    
    try:
        import psycopg2
        
        conn = psycopg2.connect(os.getenv('RAILWAY_DATABASE_URL'))
        cursor = conn.cursor()
        
        # 测试查询
        cursor.execute("SELECT version()")
        version = cursor.fetchone()[0]
        print(f"✅ Railway 连接成功！")
        print(f"   PostgreSQL 版本: {version[:50]}...")
        
        # 检查 companies 表是否存在
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'companies'
            )
        """)
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            cursor.execute("SELECT COUNT(*) FROM companies")
            count = cursor.fetchone()[0]
            print(f"✅ companies 表存在，企业总数: {count}")
        else:
            print(f"⚠️  companies 表不存在，需要运行 schema 初始化")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Railway 连接失败: {e}")
        return False

def test_multi_db_manager():
    """测试多数据库管理器"""
    print("\n" + "="*60)
    print("🔄 测试多数据库管理器")
    print("="*60)
    
    try:
        from multi_db_manager import MultiDatabaseManager
        
        with MultiDatabaseManager() as manager:
            print("✅ 多数据库管理器初始化成功")
            
            # 显示统计
            manager.print_stats()
            
            # 测试搜索（使用常见公司名）
            print("\n测试搜索功能...")
            results = manager.search_companies("company", limit=5)
            print(f"✅ 搜索返回 {len(results)} 条结果")
            
        return True
        
    except Exception as e:
        print(f"❌ 多数据库管理器测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """运行所有测试"""
    print("\n" + "="*60)
    print("🧪 多数据库连接测试")
    print("="*60 + "\n")
    
    # 测试环境变量
    if not test_environment():
        sys.exit(1)
    
    # 测试 Supabase
    supabase_ok = test_supabase()
    
    # 测试 Railway
    railway_ok = test_railway()
    
    # 测试管理器
    if supabase_ok and railway_ok:
        manager_ok = test_multi_db_manager()
    else:
        print("\n⚠️  跳过多数据库管理器测试（基础连接失败）")
        manager_ok = False
    
    # 总结
    print("\n" + "="*60)
    print("📋 测试总结")
    print("="*60)
    print(f"Supabase: {'✅ 通过' if supabase_ok else '❌ 失败'}")
    print(f"Railway: {'✅ 通过' if railway_ok else '❌ 失败'}")
    print(f"多数据库管理器: {'✅ 通过' if manager_ok else '❌ 失败'}")
    
    if supabase_ok and railway_ok and manager_ok:
        print("\n🎉 所有测试通过！可以开始使用多数据库方案")
        return 0
    else:
        print("\n⚠️  部分测试失败，请检查配置")
        return 1

if __name__ == '__main__':
    sys.exit(main())
