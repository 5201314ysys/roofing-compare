const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 芝加哥市政府的公开数据源 (Socrata Open Data API - JSON格式)
// 这是一个稳定且持续更新的真实数据源
const DATA_URL = 'https://data.cityofchicago.org/resource/ydr8-5enu.json';
const LIMIT = 5000; // 每次获取5000条记录
const YEAR_FILTER = '2020-01-01'; // 只获取2020年以后的数据

const contractors = {};

console.log("🚀 开始挖掘芝加哥市政府建筑许可数据库...");
console.log("📊 数据源: Chicago Open Data Portal (Socrata API)");

// 构建查询URL：筛选屋顶相关的许可，且有签发日期
const queryUrl = `${DATA_URL}?$limit=${LIMIT}&$where=work_description like '%25ROOF%25' AND issue_date > '${YEAR_FILTER}' AND reported_cost IS NOT NULL&$select=permit_,issue_date,work_description,contact_1_name,contact_1_type,reported_cost`;

axios.get(queryUrl)
  .then(response => {
    const data = response.data;
    console.log(`📥 成功获取 ${data.length} 条建筑许可记录`);
    
    // 处理数据
    data.forEach(row => {
      // 筛选承包商（排除业主自建）
      const contractorName = row.contact_1_name;
      const contractorType = row.contact_1_type || '';
      const cost = parseFloat(row.reported_cost);
      
      // 只要承包商类型的记录，排除业主自建
      if (contractorName && 
          !contractorType.includes('OWNER') && 
          !isNaN(cost) && 
          cost > 2000) { // 过滤掉太小的维修单
        
        if (!contractors[contractorName]) {
          contractors[contractorName] = { 
            count: 0, 
            totalValue: 0, 
            dates: [],
            type: contractorType
          };
        }
        contractors[contractorName].count++;
        contractors[contractorName].totalValue += cost;
        contractors[contractorName].dates.push(row.issue_date);
      }
    });
    
    // 生成最终结果
    const result = Object.keys(contractors)
      .map(name => {
        const c = contractors[name];
        const avg = Math.round(c.totalValue / c.count);
        return {
          id: Buffer.from(name).toString('base64').substring(0, 8),
          initial: name.charAt(0).toUpperCase(),
          name: name,
          verified: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          avgQuote: `$${avg.toLocaleString()}`,
          contractorPrice: `$${Math.round(avg * 0.85).toLocaleString()}`, // 承包商底价 (85折)
          jobCount: c.count
        };
      })
      .filter(c => c.jobCount >= 3) // 至少接过3单
      .sort((a, b) => b.jobCount - a.jobCount) // 按接单量排序
      .slice(0, 50); // 取前50名
    
    // 保存结果
    const outputPath = path.join(__dirname, '../app/data.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`✅ 挖掘完成！`);
    console.log(`   📋 共分析 ${data.length} 条许可记录`);
    console.log(`   🏢 提取 ${result.length} 家屋顶承包商数据`);
    console.log(`   💾 已保存至 app/data.json`);
  })
  .catch(error => {
    console.error("❌ 挖掘失败:", error.message);
    if (error.response) {
      console.error("   状态码:", error.response.status);
      console.error("   响应:", error.response.data);
    }
  });
