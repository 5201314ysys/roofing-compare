require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// ============================================
// 配置部分
// ============================================

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 请在 .env.local 文件中配置 Supabase 凭据');
  console.error('   需要: NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 美国主要城市的建筑许可数据源配置
const DATA_SOURCES = [
  {
    name: 'Chicago',
    state: 'IL',
    url: 'https://data.cityofchicago.org/resource/ydr8-5enu.json',
    limit: 3000,
    query: {
      $limit: 3000,
      $where: "work_description like '%ROOF%' AND issue_date > '2020-01-01' AND reported_cost IS NOT NULL",
      $select: 'permit_,issue_date,work_description,contact_1_name,contact_1_type,reported_cost,street_number,street_name'
    },
    parser: (row) => ({
      permitNumber: row.permit_,
      issueDate: row.issue_date?.split('T')[0],
      description: row.work_description,
      contractorName: row.contact_1_name,
      contractorType: row.contact_1_type,
      cost: parseFloat(row.reported_cost),
      address: `${row.street_number || ''} ${row.street_name || ''}`.trim()
    })
  },
  {
    name: 'Austin',
    state: 'TX',
    url: 'https://data.austintexas.gov/resource/3syk-w9eu.json',
    limit: 2000,
    query: {
      $limit: 2000,
      $where: "description like '%ROOF%' AND issue_date > '2020-01-01'",
      $select: 'permit_number,issue_date,description,contractor_full_name,contractor_company_name,original_address1,work_class'
    },
    parser: (row) => ({
      permitNumber: row.permit_number,
      issueDate: row.issue_date?.split('T')[0],
      description: row.description,
      contractorName: row.contractor_company_name || row.contractor_full_name,
      contractorType: 'Contractor',
      cost: 15000, // 奥斯汀数据没有明确的成本字段，使用平均值
      address: row.original_address1
    })
  },
  {
    name: 'Seattle',
    state: 'WA',
    url: 'https://data.seattle.gov/resource/76t5-zqzr.json',
    limit: 2000,
    query: {
      $limit: 2000,
      $where: "description like '%ROOF%' AND statuscurrent = 'Permit Issued'",
      $select: 'permitnum,applieddate,description,originaladdress1,permitclassmapped'
    },
    parser: (row) => ({
      permitNumber: row.permitnum,
      issueDate: row.applieddate?.split('T')[0],
      description: row.description,
      contractorName: null, // 西雅图数据没有承包商信息
      contractorType: 'Unknown',
      cost: 18000,
      address: row.originaladdress1
    })
  }
];

// ============================================
// 工具函数
// ============================================

function cleanContractorName(name) {
  if (!name) return null;
  // 移除多余空格，统一大小写
  return name.trim().toUpperCase();
}

function isValidContractor(contractorName, contractorType) {
  if (!contractorName) return false;
  // 排除业主自建
  if (contractorType && contractorType.toLowerCase().includes('owner')) return false;
  return true;
}

// ============================================
// 数据获取与处理
// ============================================

async function fetchCityData(source) {
  console.log(`\n📍 正在获取 ${source.name}, ${source.state} 的数据...`);
  
  try {
    const response = await axios.get(source.url, { params: source.query });
    const rawData = response.data;
    
    console.log(`   ✓ 获取到 ${rawData.length} 条原始记录`);
    
    // 解析数据
    const permits = [];
    const contractorStats = {};
    
    rawData.forEach(row => {
      const parsed = source.parser(row);
      
      // 验证承包商
      if (!isValidContractor(parsed.contractorName, parsed.contractorType)) {
        return;
      }
      
      // 验证成本
      if (!parsed.cost || parsed.cost < 2000) {
        return;
      }
      
      const cleanName = cleanContractorName(parsed.contractorName);
      
      // 累计承包商统计
      if (!contractorStats[cleanName]) {
        contractorStats[cleanName] = {
          name: cleanName,
          city: source.name,
          state: source.state,
          projects: [],
          totalValue: 0
        };
      }
      
      contractorStats[cleanName].projects.push({
        permitNumber: parsed.permitNumber,
        issueDate: parsed.issueDate,
        description: parsed.description,
        cost: parsed.cost,
        address: parsed.address
      });
      
      contractorStats[cleanName].totalValue += parsed.cost;
      
      // 保存许可证记录
      permits.push({
        permit_number: parsed.permitNumber,
        city: source.name,
        state: source.state,
        description: parsed.description,
        work_type: parsed.contractorType,
        reported_cost: parsed.cost,
        issue_date: parsed.issueDate,
        address: parsed.address,
        data_source: `${source.name}, ${source.state}`,
        raw_data: row
      });
    });
    
    console.log(`   ✓ 提取到 ${Object.keys(contractorStats).length} 家承包商`);
    console.log(`   ✓ 处理了 ${permits.length} 条有效许可记录`);
    
    return { contractors: contractorStats, permits };
    
  } catch (error) {
    console.error(`   ✗ 获取 ${source.name} 数据失败:`, error.message);
    return { contractors: {}, permits: [] };
  }
}

// ============================================
// Supabase数据存储
// ============================================

async function saveToSupabase(allContractors, allPermits) {
  console.log('\n💾 开始保存数据到 Supabase...');
  
  let savedContractors = 0;
  let savedPermits = 0;
  let errors = 0;
  
  // 1. 保存承包商数据
  console.log('\n   📊 保存承包商数据...');
  
  for (const [name, data] of Object.entries(allContractors)) {
    if (data.projects.length < 3) continue; // 至少3个项目
    
    const avgQuote = Math.round(data.totalValue / data.projects.length);
    const contractorPrice = Math.round(avgQuote * 0.85);
    
    const dates = data.projects.map(p => p.issueDate).filter(Boolean).sort();
    
    const contractorData = {
      name: data.name,
      initial: data.name.charAt(0),
      city: data.city,
      state: data.state,
      total_projects: data.projects.length,
      total_value: data.totalValue,
      avg_quote: avgQuote,
      contractor_price: contractorPrice,
      first_permit_date: dates[0],
      last_permit_date: dates[dates.length - 1]
    };
    
    // 使用 upsert 避免重复
    const { data: inserted, error } = await supabase
      .from('contractors')
      .upsert(contractorData, { onConflict: 'name' })
      .select();
    
    if (error) {
      errors++;
      if (errors <= 5) { // 只显示前5个错误
        console.error(`      ✗ 保存失败 (${name}):`, error.message);
      }
    } else {
      savedContractors++;
      // 保存许可证记录（关联contractor_id）
      const contractorId = inserted[0].id;
      
      for (const permit of data.projects) {
        const permitData = allPermits.find(p => p.permit_number === permit.permitNumber);
        if (permitData) {
          permitData.contractor_id = contractorId;
        }
      }
    }
  }
  
  console.log(`   ✓ 已保存 ${savedContractors} 家承包商`);
  
  // 2. 保存许可证数据
  console.log('\n   📋 保存许可证数据...');
  
  // 批量插入（每次1000条）
  const batchSize = 1000;
  for (let i = 0; i < allPermits.length; i += batchSize) {
    const batch = allPermits.slice(i, i + batchSize).filter(p => p.contractor_id);
    
    if (batch.length === 0) continue;
    
    const { error } = await supabase
      .from('permits')
      .upsert(batch, { onConflict: 'permit_number', ignoreDuplicates: true });
    
    if (error) {
      console.error(`      ✗ 批量保存失败 (batch ${i / batchSize + 1}):`, error.message);
    } else {
      savedPermits += batch.length;
    }
  }
  
  console.log(`   ✓ 已保存 ${savedPermits} 条许可记录`);
  
  if (errors > 5) {
    console.log(`   ⚠ 共 ${errors} 个错误（仅显示前5个）`);
  }
  
  return { savedContractors, savedPermits };
}

// ============================================
// 主函数
// ============================================

async function main() {
  console.log('🚀 开始挖掘全美国建筑许可数据库...');
  console.log(`📊 数据源: ${DATA_SOURCES.length} 个美国主要城市`);
  console.log(`🔗 Supabase: ${supabaseUrl}`);
  
  const allContractors = {};
  const allPermits = [];
  
  // 并行获取所有城市的数据
  const results = await Promise.all(
    DATA_SOURCES.map(source => fetchCityData(source))
  );
  
  // 合并数据
  results.forEach(result => {
    // 合并承包商（同名承包商可能在不同城市）
    Object.entries(result.contractors).forEach(([name, data]) => {
      if (!allContractors[name]) {
        allContractors[name] = data;
      } else {
        // 合并项目
        allContractors[name].projects.push(...data.projects);
        allContractors[name].totalValue += data.totalValue;
      }
    });
    
    allPermits.push(...result.permits);
  });
  
  console.log('\n📈 数据汇总:');
  console.log(`   总承包商数: ${Object.keys(allContractors).length}`);
  console.log(`   总许可记录: ${allPermits.length}`);
  
  // 保存到Supabase
  const { savedContractors, savedPermits } = await saveToSupabase(allContractors, allPermits);
  
  console.log('\n✅ 数据挖掘完成！');
  console.log(`   💾 已保存 ${savedContractors} 家承包商`);
  console.log(`   💾 已保存 ${savedPermits} 条许可记录`);
  console.log(`   🌐 数据已同步到 Supabase 数据库`);
}

// 运行主函数
main().catch(error => {
  console.error('\n❌ 执行失败:', error);
  process.exit(1);
});
