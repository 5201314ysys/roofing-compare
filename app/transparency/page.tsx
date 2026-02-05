'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Building2, Shield, FileText, AlertTriangle, 
  Users, DollarSign, Calendar, Lock, Crown, CheckCircle2, 
  XCircle, Clock, TrendingUp, Eye, MapPin
} from 'lucide-react';
import { Navbar, Footer } from '@/app/components/Navigation';
import { useAuth } from '@/app/context/AuthContext';

// Mock data for business transparency
const MOCK_BUSINESS_DATA = {
  basicInfo: {
    name: 'Premium Roofing Co.',
    legalName: 'Premium Roofing Inc.',
    registrationNumber: 'C12345678',
    status: 'Active',
    type: 'Limited Liability Company (LLC)',
    registrationDate: '2008-03-15',
    capital: '$500,000',
    paidCapital: '$500,000',
    address: '123 Main Street, Los Angeles, CA 90001',
    scope: 'Roofing installation, repair, inspection services; Building materials sales',
  },
  people: {
    legalRep: { name: 'John Smith', title: 'CEO', shares: '60%' },
    executives: [
      { name: 'John Smith', title: 'CEO', since: '2008-03-15' },
      { name: 'Jane Doe', title: 'CFO', since: '2012-06-01' },
      { name: 'Mike Johnson', title: 'COO', since: '2015-01-15' },
    ],
    shareholders: [
      { name: 'John Smith', type: 'Individual', shares: '60%', contribution: '$300,000' },
      { name: 'Smith Family Trust', type: 'Entity', shares: '25%', contribution: '$125,000' },
      { name: 'Jane Doe', type: 'Individual', shares: '15%', contribution: '$75,000' },
    ],
  },
  licenses: [
    { type: 'Contractor License', number: '12345-CA', issuer: 'CSLB', validUntil: '2027-12-31', status: 'Valid' },
    { type: 'Business License', number: 'BL-2008-001234', issuer: 'City of LA', validUntil: '2026-12-31', status: 'Valid' },
    { type: 'Insurance Certificate', number: 'INS-2024-5678', issuer: 'State Farm', validUntil: '2026-06-30', status: 'Valid' },
  ],
  financials: {
    annualRevenue: '$8.5M',
    employees: '75',
    assets: '$2.5M',
    liabilities: '$800K',
    netWorth: '$1.7M',
    revenueHistory: [
      { year: '2023', revenue: 7200000 },
      { year: '2024', revenue: 7800000 },
      { year: '2025', revenue: 8500000 },
    ],
  },
  litigation: [
    { 
      caseNumber: 'LA-2023-CV-12345',
      date: '2023-05-15', 
      type: 'Contract Dispute', 
      role: 'Defendant',
      plaintiff: 'ABC Construction LLC',
      court: 'LA County Superior Court',
      amount: '$15,000', 
      status: 'Resolved',
      resolution: 'Settlement'
    },
    { 
      caseNumber: 'LA-2021-CV-67890',
      date: '2021-08-20', 
      type: 'Workers Compensation', 
      role: 'Defendant',
      plaintiff: 'Employee John Doe',
      court: 'Workers Comp Board',
      amount: '$8,500', 
      status: 'Resolved',
      resolution: 'Compensation Paid'
    },
  ],
  violations: [
    { date: '2022-03-10', type: 'Safety Violation', agency: 'OSHA', fine: '$2,500', status: 'Corrected' },
  ],
  relatedCompanies: [
    { name: 'Premium Materials Supply', relation: 'Subsidiary', shares: '100%' },
    { name: 'Smith Property Holdings', relation: 'Affiliated Company', shares: 'Common Control' },
  ],
};

export default function BusinessTransparencyPage() {
  const { isAuthenticated, subscription } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const isPremium = subscription === 'pro' || subscription === 'enterprise';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const renderLockedContent = (feature: string) => (
    <div className="bg-slate-100 rounded-xl p-8 text-center">
      <Lock size={48} className="mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Content</h3>
      <p className="text-slate-600 mb-4">Upgrade to Pro to view {feature}</p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        <Crown size={20} />
        Upgrade Now
      </Link>
    </div>
  );

  const data = MOCK_BUSINESS_DATA;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Eye size={16} />
            Business Transparency Report
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Business Background Check
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Look up business registration, shareholder structure, litigation records, licenses and more for transparent business decisions
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter company name, registration number, or owner name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          /* Features Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <Building2 size={32} />, title: 'Business Registration', desc: 'Company registration info, shareholder structure, change history' },
              { icon: <Users size={32} />, title: 'Personnel Info', desc: 'Legal representative, executive team, employment history' },
              { icon: <FileText size={32} />, title: 'Licenses & Permits', desc: 'Business license, industry certifications, insurance proof' },
              { icon: <DollarSign size={32} />, title: 'Financial Info', desc: 'Annual revenue, asset scale, financial health' },
              { icon: <AlertTriangle size={32} />, title: 'Risk Information', desc: 'Litigation records, violations, negative news' },
              { icon: <Shield size={32} />, title: 'Credit Assessment', desc: 'Business credit score, risk level assessment' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Search Results */
          <div>
            {/* Company Header */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-900">{data.basicInfo.name}</h1>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {data.basicInfo.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{data.basicInfo.legalName}</p>
                  <div className="flex gap-4 mt-3 text-sm text-slate-500">
                    <span>Reg #: {data.basicInfo.registrationNumber}</span>
                    <span>Est. Date: {data.basicInfo.registrationDate}</span>
                  </div>
                </div>
                <Link
                  href="/companies/1"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
              <nav className="flex">
                {[
                  { id: 'basic', label: 'Registration', icon: <Building2 size={18} /> },
                  { id: 'people', label: 'Personnel', icon: <Users size={18} /> },
                  { id: 'licenses', label: 'Licenses', icon: <FileText size={18} /> },
                  { id: 'financials', label: 'Financials', icon: <DollarSign size={18} /> },
                  { id: 'litigation', label: 'Litigation', icon: <AlertTriangle size={18} /> },
                  { id: 'related', label: 'Related Co.', icon: <Shield size={18} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeSection === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {/* Basic Info */}
              {activeSection === 'basic' && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Business Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries({
                      'Company Name': data.basicInfo.name,
                      'Registration Number': data.basicInfo.registrationNumber,
                      'Company Type': data.basicInfo.type,
                      'Operating Status': data.basicInfo.status,
                      'Established Date': data.basicInfo.registrationDate,
                      'Registered Capital': data.basicInfo.capital,
                      'Paid-in Capital': data.basicInfo.paidCapital,
                      'Registered Address': data.basicInfo.address,
                    }).map(([key, value]) => (
                      <div key={key} className="border-b border-slate-100 pb-3">
                        <p className="text-sm text-slate-500 mb-1">{key}</p>
                        <p className="font-medium text-slate-900">{value}</p>
                      </div>
                    ))}
                    <div className="md:col-span-2 border-b border-slate-100 pb-3">
                      <p className="text-sm text-slate-500 mb-1">Business Scope</p>
                      <p className="font-medium text-slate-900">{data.basicInfo.scope}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* People Info */}
              {activeSection === 'people' && (
                <>
                  {isPremium ? (
                    <>
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Legal Representative</h2>
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
                            {data.people.legalRep.name[0]}
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-900">{data.people.legalRep.name}</p>
                            <p className="text-slate-600">{data.people.legalRep.title} · Shares: {data.people.legalRep.shares}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Key Personnel</h2>
                        <div className="space-y-4">
                          {data.people.executives.map((exec, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                  {exec.name[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{exec.name}</p>
                                  <p className="text-sm text-slate-500">{exec.title}</p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-500">Since: {exec.since}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Shareholder Information</h2>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Shareholder Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Ownership %</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Contribution</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.people.shareholders.map((shareholder, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                  <td className="py-3 px-4 font-medium">{shareholder.name}</td>
                                  <td className="py-3 px-4 text-slate-600">{shareholder.type}</td>
                                  <td className="py-3 px-4 text-blue-600 font-semibold">{shareholder.shares}</td>
                                  <td className="py-3 px-4 text-slate-600">{shareholder.contribution}</td>
                                </tr>
                              ))}  
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    renderLockedContent('Personnel and shareholder details')
                  )}
                </>
              )}

              {/* Licenses */}
              {activeSection === 'licenses' && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Licenses & Certifications</h2>
                  <div className="space-y-4">
                    {data.licenses.map((license, i) => (
                      <div key={i} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            license.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {license.status === 'Active' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{license.type}</p>
                            <p className="text-sm text-slate-500">License #: {license.number}</p>
                            <p className="text-sm text-slate-500">Issuer: {license.issuer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            license.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {license.status}
                          </span>
                          <p className="text-sm text-slate-500 mt-2">Valid until: {license.validUntil}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financials */}
              {activeSection === 'financials' && (
                <>
                  {isPremium ? (
                    <>
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Financial Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { label: 'Annual Revenue', value: data.financials.annualRevenue, color: 'blue' },
                            { label: 'Employees', value: data.financials.employees, color: 'cyan' },
                            { label: 'Total Assets', value: data.financials.assets, color: 'green' },
                            { label: 'Total Liabilities', value: data.financials.liabilities, color: 'orange' },
                            { label: 'Net Worth', value: data.financials.netWorth, color: 'purple' },
                          ].map((item, i) => (
                            <div key={i} className={`p-4 bg-${item.color}-50 rounded-xl text-center`}>
                              <p className="text-sm text-slate-600 mb-1">{item.label}</p>
                              <p className={`text-xl font-bold text-${item.color}-600`}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue Trend</h2>
                        <div className="h-48 flex items-end justify-between gap-8">
                          {data.financials.revenueHistory.map((item) => (
                            <div key={item.year} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-blue-500 rounded-t-lg"
                                style={{
                                  height: `${(item.revenue / 10000000) * 150}px`,
                                }}
                              />
                              <p className="text-sm text-slate-500 mt-2">{item.year}</p>
                              <p className="text-sm font-semibold">${(item.revenue / 1000000).toFixed(1)}M</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    renderLockedContent('Financial details')
                  )}
                </>
              )}

              {/* Litigation */}
              {activeSection === 'litigation' && (
                <>
                  {isPremium ? (
                    <>
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold text-slate-900">Litigation Records</h2>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            {data.litigation.length} records
                          </span>
                        </div>
                        <div className="space-y-4">
                          {data.litigation.map((case_, i) => (
                            <div key={i} className="p-4 border border-slate-200 rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="text-yellow-500" size={20} />
                                  <span className="font-semibold text-slate-900">{case_.type}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  case_.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {case_.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-500">Case Number</p>
                                  <p className="font-medium">{case_.caseNumber}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Filing Date</p>
                                  <p className="font-medium">{case_.date}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Role</p>
                                  <p className="font-medium">{case_.role}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Amount</p>
                                  <p className="font-medium text-orange-600">{case_.amount}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Plaintiff</p>
                                  <p className="font-medium">{case_.plaintiff}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Court</p>
                                  <p className="font-medium">{case_.court}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-slate-500">Resolution</p>
                                  <p className="font-medium">{case_.resolution}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold text-slate-900">Administrative Penalties</h2>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            {data.violations.length} records
                          </span>
                        </div>
                        <div className="space-y-4">
                          {data.violations.map((violation, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg">
                              <div>
                                <p className="font-semibold text-slate-900">{violation.type}</p>
                                <p className="text-sm text-slate-500">Agency: {violation.agency} · Date: {violation.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600">{violation.fine}</p>
                                <span className={`text-sm ${
                                  violation.status === 'Rectified' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {violation.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    renderLockedContent('Litigation and penalty records')
                  )}
                </>
              )}

              {/* Related Companies */}
              {activeSection === 'related' && (
                <>
                  {isPremium ? (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-slate-900 mb-6">Related Companies</h2>
                      <div className="space-y-4">
                        {data.relatedCompanies.map((company, i) => (
                          <div key={i} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Building2 className="text-slate-400" size={24} />
                              <div>
                                <p className="font-semibold text-slate-900">{company.name}</p>
                                <p className="text-sm text-slate-500">{company.relation}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {company.shares}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    renderLockedContent('Related company information')
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
