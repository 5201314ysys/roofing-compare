/**
 * 更新承包商数据脚本
 * 用于向现有承包商记录添加新的字段数据（联系方式、评分、专业领域等）
 */

require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端（使用服务角色密钥以获得写入权限）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 示例联系方式和额外数据（可以根据实际情况调整）
const sampleData = {
  phones: [
    '(305) 555-0123',
    '(786) 555-0456',
    '(954) 555-0789',
    '(561) 555-0321',
    '(407) 555-0654',
    '(813) 555-0987',
    '(727) 555-0246',
    '(239) 555-0135',
    '(850) 555-0468',
    '(904) 555-0791'
  ],
  
  specialties: [
    ['Residential Roofing', 'Roof Repair'],
    ['Commercial Roofing', 'Metal Roofing'],
    ['Roof Repair', 'Emergency Service', 'Residential Roofing'],
    ['Metal Roofing', 'Tile Roofing', 'Flat Roofing'],
    ['Residential Roofing', 'Shingle Roofing', 'Roof Replacement'],
    ['Commercial Roofing', 'TPO Roofing', 'Flat Roofing'],
    ['Roof Repair', 'Storm Damage', 'Emergency Service'],
    ['Metal Roofing', 'Standing Seam', 'Residential Roofing']
  ],
  
  bbbRatings: ['A+', 'A', 'A-', 'B+', 'B'],
  
  descriptions: [
    'Professional roofing services with over 15 years of experience. We specialize in residential and commercial roofing projects.',
    'Family-owned roofing company serving Florida communities. Quality workmanship and customer satisfaction guaranteed.',
    'Licensed and insured roofing contractor. Expert in metal roofing, tile installation, and roof repairs.',
    'Leading roofing contractor specializing in energy-efficient roofing solutions and sustainable materials.',
    'Full-service roofing company offering installation, repair, and maintenance services throughout Florida.',
    'Certified roofing professionals dedicated to providing top-quality roofing solutions at competitive prices.',
    'Emergency roofing services available 24/7. Fast response times and reliable repairs.',
    'Commercial and residential roofing experts. Licensed, bonded, and insured for your protection.'
  ]
};

// 生成随机评分（4.0-5.0）
function generateRating() {
  return parseFloat((Math.random() * 1 + 4).toFixed(1));
}

// 生成随机评论数（10-150）
function generateReviewCount() {
  return Math.floor(Math.random() * 140) + 10;
}

// 生成随机质保年限（5-25年）
function generateWarrantyYears() {
  const options = [5, 10, 15, 20, 25];
  return options[Math.floor(Math.random() * options.length)];
}

// 生成随机成立年份（1990-2015）
function generateFoundedYear() {
  return Math.floor(Math.random() * 25) + 1990;
}

// 生成服务区域（基于城市）
function generateServiceAreas(city, state) {
  const floridaCities = ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale', 'West Palm Beach', 'Naples', 'Sarasota', 'Clearwater', 'Boca Raton'];
  const illioisCities = ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford'];
  const texasCities = ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth'];
  
  let baseCities = floridaCities;
  if (state === 'IL') baseCities = illioisCities;
  if (state === 'TX') baseCities = texasCities;
  
  // 返回主城市及周边2-4个城市
  const areas = [city];
  const nearby = baseCities.filter(c => c !== city);
  const count = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < count && i < nearby.length; i++) {
    areas.push(nearby[i]);
  }
  
  return areas;
}

async function updateContractorsData() {
  try {
    console.log('🔄 开始更新承包商数据...\n');
    
    // 1. 获取所有现有承包商
    const { data: contractors, error: fetchError } = await supabase
      .from('contractors')
      .select('id, name, city, state, total_projects');
    
    if (fetchError) {
      throw new Error(`获取数据失败: ${fetchError.message}`);
    }
    
    console.log(`📊 找到 ${contractors.length} 个承包商记录\n`);
    
    // 2. 为每个承包商生成并更新数据
    let successCount = 0;
    let failCount = 0;
    
    for (const contractor of contractors) {
      try {
        // 生成新数据
        const updates = {
          // 联系方式
          phone: sampleData.phones[Math.floor(Math.random() * sampleData.phones.length)],
          email: `info@${contractor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          website: `https://www.${contractor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          
          // 评分和评价
          rating: generateRating(),
          review_count: generateReviewCount(),
          bbb_rating: sampleData.bbbRatings[Math.floor(Math.random() * sampleData.bbbRatings.length)],
          
          // 公司信息
          description: sampleData.descriptions[Math.floor(Math.random() * sampleData.descriptions.length)],
          founded_year: generateFoundedYear(),
          employee_count: Math.floor(Math.random() * 50) + 5,
          
          // 认证信息
          insurance_verified: Math.random() > 0.2, // 80% 有保险认证
          bonded: Math.random() > 0.3, // 70% 有担保
          
          // 服务信息
          specialties: sampleData.specialties[Math.floor(Math.random() * sampleData.specialties.length)],
          service_areas: generateServiceAreas(contractor.city, contractor.state),
          emergency_service: Math.random() > 0.4, // 60% 提供紧急服务
          warranty_years: generateWarrantyYears(),
          
          // 推荐状态（项目数多的更容易被推荐）
          is_featured: contractor.total_projects > 50 && Math.random() > 0.7,
          
          // 营业状态
          is_active: Math.random() > 0.05 // 95% 处于营业中
        };
        
        // 更新数据库
        const { error: updateError } = await supabase
          .from('contractors')
          .update(updates)
          .eq('id', contractor.id);
        
        if (updateError) {
          throw updateError;
        }
        
        successCount++;
        console.log(`✅ [${successCount}/${contractors.length}] 更新成功: ${contractor.name}`);
        
      } catch (error) {
        failCount++;
        console.error(`❌ 更新失败: ${contractor.name} - ${error.message}`);
      }
      
      // 避免请求过快，稍微延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✨ 更新完成！`);
    console.log(`   成功: ${successCount} 个`);
    console.log(`   失败: ${failCount} 个`);
    console.log('='.repeat(50) + '\n');
    
    // 3. 显示一些统计信息
    const { data: stats } = await supabase
      .from('contractors')
      .select('rating, is_featured, insurance_verified')
      .not('rating', 'is', null);
    
    if (stats) {
      const avgRating = (stats.reduce((sum, c) => sum + (c.rating || 0), 0) / stats.length).toFixed(2);
      const featuredCount = stats.filter(c => c.is_featured).length;
      const insuredCount = stats.filter(c => c.insurance_verified).length;
      
      console.log('📈 数据统计:');
      console.log(`   平均评分: ${avgRating} ⭐`);
      console.log(`   推荐承包商: ${featuredCount} 个`);
      console.log(`   保险认证: ${insuredCount} 个 (${(insuredCount/stats.length*100).toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.error('❌ 发生错误:', error);
    process.exit(1);
  }
}

// 运行脚本
console.log('🚀 承包商数据更新脚本\n');
updateContractorsData();
