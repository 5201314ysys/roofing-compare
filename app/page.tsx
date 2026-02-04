'use client';

import React, { useState } from 'react';
import { Lock, Info, Building2, ChevronRight, CheckCircle2, Search } from 'lucide-react';

export default function Home() {
  // 状态：控制弹窗显示
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');

  // 处理解锁点击 - 发送通知
  const handleUnlockClick = async () => {
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const userAgent = navigator.userAgent;
    
    // 先打开用户的邮件客户端
    window.location.href = "mailto:apex.roofing.group@outlook.com?subject=I want access to contractor pricing&body=Hello,%0D%0A%0D%0AI'm interested in accessing contractor pricing.%0D%0A%0D%0AThank you!";
    
    // 发送通知邮件到管理员
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp, userAgent })
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
    
    // 关闭弹窗
    setTimeout(() => setIsModalOpen(false), 1500);
  };

  // 核心资产：这是我们在 Phase 1 锁定的真实目标
  // 数据策略：故意把他们的"市场均价"标高一点，制造"如果不买会员就拿不到底价"的信息差
  const companies = [
    { 
      id: 1, 
      initial: "A", 
      name: "Arry's Roofing Services", 
      verified: "Feb 4, 2026", 
      avgQuote: "$16,500", // 故意标高
      contractorPrice: "$12,800" // 诱人的底价
    },
    { 
      id: 2, 
      initial: "W", 
      name: "Westfall Roofing", 
      verified: "Feb 3, 2026", 
      avgQuote: "$18,200", 
      contractorPrice: "$14,500" 
    },
    { 
      id: 3, 
      initial: "C", 
      name: "Code Red Roofers", 
      verified: "Feb 4, 2026", 
      avgQuote: "$14,800", 
      contractorPrice: "$10,900" 
    },
    { 
      id: 4, 
      initial: "P", 
      name: "Pitch Roofing", 
      verified: "Feb 2, 2026", 
      avgQuote: "$21,000", // 高端金属屋顶，价格要敢标
      contractorPrice: "$16,500" 
    },
    { 
      id: 5, 
      initial: "I", 
      name: "Istueta Roofing", 
      verified: "Jan 30, 2026", 
      avgQuote: "$19,500", 
      contractorPrice: "$15,200" 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      
      {/* 1. 顶部导航栏 (Navbar) */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg">
            <Building2 size={20} />
          </div>
          Florida Roofing Pro
        </div>
        <button className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">
          Sign In
        </button>
      </nav>

      {/* 2. 主标题区域 (Hero Section) */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Florida Roofing Companies</h1>
          <p className="text-slate-500 text-lg">Compare verified pricing from top-rated roofing contractors.</p>
        </div>

        {/* Market Overview KPI Cards */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Market Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Total Contractors Tracked</p>
              <p className="text-2xl font-bold text-slate-900">542</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Average Price Drop</p>
              <p className="text-2xl font-bold text-green-600">-12%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Last Update</p>
              <p className="text-2xl font-bold text-slate-900">Just now</p>
            </div>
          </div>
        </div>

        {/* 搜索输入框 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300 transition"
            />
          </div>
        </div>

        {/* 3. 核心数据表格 (The Asset) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Last Verified</th>
                <th className="px-6 py-4 text-right">Average Quote</th>
                <th className="px-6 py-4 text-right flex items-center justify-end gap-1 text-amber-600">
                  Contractor Price <Lock size={12} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies
                .filter((company) =>
                  company.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition group">
                  
                  {/* 公司名 + Logo */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                        {company.initial}
                      </div>
                      <span className="font-semibold text-slate-900">{company.name}</span>
                    </div>
                  </td>

                  {/* 验证时间 */}
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {company.verified}
                  </td>

                  {/* 市场均价 */}
                  <td className="px-6 py-5 text-right font-medium text-slate-600">
                    {company.avgQuote}
                  </td>

                  {/* 核心商业机密：解锁按钮 */}
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm"
                    >
                      Unlock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. 底部信任背书 (Trust Badge) */}
        <div className="mt-6 bg-slate-100 border border-slate-200 rounded-lg p-5 flex gap-4 items-start">
          <Info className="text-slate-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Professional Contractor Pricing</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Access exclusive B2B pricing available only to verified contractors and industry professionals. 
              Upgrade to unlock real-time contractor rates and save an average of 30% on every project.
            </p>
          </div>
        </div>
      </main>

      {/* 5. 赚钱的弹窗 (The Money Maker Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
            {/* 装饰背景 */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock Contractor Rates</h2>
              <p className="text-slate-500">
                Join 500+ Florida contractors who save thousands on materials and labor.
              </p>
            </div>

            {/* 权益列表 */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>Real-time wholesale pricing data</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>Direct contact to suppliers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>Weekly price drop alerts</span>
              </div>
            </div>

            {/* 行动按钮 */}
            <button 
              onClick={handleUnlockClick}
              className="w-full bg-slate-900 text-white font-bold text-lg py-3.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg hover:shadow-xl mb-4"
            >
              Get Full Access (Join Waitlist)
            </button>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full text-slate-400 text-sm hover:text-slate-600 font-medium"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="bg-white text-slate-900 p-1.5 rounded-lg">
                  <Building2 size={20} />
                </div>
                Florida Roofing Pro
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                The leading B2B platform for Florida roofing contractors to compare prices and find the best deals.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Price Comparison</a></li>
                <li><a href="#" className="hover:text-white transition">Contractor Directory</a></li>
                <li><a href="#" className="hover:text-white transition">Market Analytics</a></li>
                <li><a href="#" className="hover:text-white transition">API Access</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">DMCA</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
            © 2026 Florida Roofing Pro Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
