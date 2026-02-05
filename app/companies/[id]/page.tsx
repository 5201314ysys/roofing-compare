'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { 
  Shield, MapPin, Phone, Mail, Globe, Star, Building2, 
  FileText, TrendingUp, Lock, Crown, AlertTriangle, 
  CheckCircle2, Calendar, DollarSign, BarChart3
} from 'lucide-react';
import { Navbar, Footer } from '@/app/components/Navigation';
import { useAuth } from '@/app/context/AuthContext';

// Mock company data
const MOCK_COMPANY = {
  id: 1,
  name: 'Premium Roofing Co.',
  legalName: 'Premium Roofing Inc.',
  industry: 'Roofing Services',
  description: 'Premium Roofing Co. is a professional roofing installation and repair service provider with over 15 years of industry experience. We provide high-quality roofing services to both residential and commercial customers.',
  
  // Location
  state: 'CA',
  stateName: 'California',
  city: 'Los Angeles',
  address: '123 Main Street, Los Angeles, CA 90001',
  
  // Contact
  phone: '(555) 123-4567',
  email: 'contact@premiumroofing.com',
  website: 'https://premiumroofing.com',
  
  // Pricing
  avgPrice: 8500,
  maxPrice: 15000,
  minPrice: 5000,
  pricePerSqFt: 4.5,
  
  // Ratings
  rating: 4.8,
  reviews: 342,
  recentProjects: 45,
  
  // Verification
  verified: true,
  license: '12345-CA',
  licenseExpiry: '2027-12-31',
  insurance: true,
  bondAmount: 500000,
  
  // Business Info
  foundedYear: 2008,
  employees: '50-100',
  annualRevenue: '$5M - $10M',
  owner: 'John Smith',
  registrationNumber: 'C12345678',
  registrationDate: '2008-03-15',
  capital: '$500,000',
  status: 'Active',
  
  // Litigation
  litigationCount: 2,
  litigations: [
    { date: '2023-05-15', type: 'Contract Dispute', status: 'Resolved', amount: '$15,000' },
    { date: '2021-08-20', type: 'Workers Comp', status: 'Resolved', amount: '$8,500' },
  ],
  
  // Price History
  priceHistory: [
    { month: '2025-08', avgPrice: 8200 },
    { month: '2025-09', avgPrice: 8350 },
    { month: '2025-10', avgPrice: 8450 },
    { month: '2025-11', avgPrice: 8500 },
    { month: '2025-12', avgPrice: 8550 },
    { month: '2026-01', avgPrice: 8500 },
  ],
  
  // Recent Projects
  projects: [
    { date: '2026-01-15', type: 'Roof Replacement', cost: 12500, sqFt: 2800 },
    { date: '2026-01-10', type: 'Roof Repair', cost: 3500, sqFt: null },
    { date: '2025-12-20', type: 'New Roof Installation', cost: 18000, sqFt: 3200 },
  ],
  
  // Services
  services: ['Roof Installation', 'Roof Repair', 'Roof Inspection', 'Emergency Repair', 'Asphalt Shingles', 'Metal Roofing', 'Flat Roofing'],
  
  // Reviews
  reviewsList: [
    { id: 1, user: 'Mike T.', rating: 5, text: 'Very professional team, high quality work.', date: '2026-01-20' },
    { id: 2, user: 'Sarah L.', rating: 4, text: 'Reasonable prices, great service.', date: '2026-01-15' },
    { id: 3, user: 'James W.', rating: 5, text: 'Recommended to friends, they were also satisfied.', date: '2025-12-28' },
  ],
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetail({ params }: PageProps) {
  const { id } = use(params);
  const { isAuthenticated, subscription } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const company = MOCK_COMPANY;
  const isPremium = subscription === 'pro' || subscription === 'enterprise';
  const isBasic = subscription === 'basic';

  const renderLockedContent = (feature: string) => (
    <div className="bg-slate-100 rounded-xl p-8 text-center">
      <Lock size={48} className="mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Content</h3>
      <p className="text-slate-600 mb-4">Upgrade to view {feature}</p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        <Crown size={20} />
        Upgrade Now
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Company Header */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                {company.verified && (
                  <span className="flex items-center gap-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    <Shield size={16} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-slate-300 mb-4">{company.legalName}</p>
              
              <div className="flex flex-wrap gap-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 size={18} />
                  {company.industry}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  {company.city}, {company.stateName}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  Founded {company.foundedYear}
                </div>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="flex items-center gap-2 mb-2 md:justify-end">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(company.rating) ? '⭐' : '☆'} />
                  ))}
                </div>
                <span className="text-xl font-bold">{company.rating}</span>
                <span className="text-slate-400">({company.reviews} reviews)</span>
              </div>
              <p className="text-slate-300">{company.recentProjects} recent projects</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'pricing', label: 'Pricing Info' },
              { id: 'background', label: 'Business Background' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'projects', label: 'Project History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Company Description</h2>
                  <p className="text-slate-600">{company.description}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((service) => (
                      <span
                        key={service}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Credentials</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-green-600" size={24} />
                      <div>
                        <p className="font-semibold">License Number</p>
                        <p className="text-slate-600">{company.license}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-green-600" size={24} />
                      <div>
                        <p className="font-semibold">License Expiry</p>
                        <p className="text-slate-600">{company.licenseExpiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-green-600" size={24} />
                      <div>
                        <p className="font-semibold">Insurance Status</p>
                        <p className="text-slate-600">{company.insurance ? 'Insured' : 'Not Insured'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-green-600" size={24} />
                      <div>
                        <p className="font-semibold">Bond Amount</p>
                        <p className="text-slate-600">${company.bondAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Pricing */}
            {activeTab === 'pricing' && (
              <>
                {isPremium || isBasic ? (
                  <>
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h2 className="text-xl font-bold text-slate-900 mb-6">Pricing Information</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <DollarSign className="mx-auto text-blue-600 mb-2" size={32} />
                          <p className="text-sm text-slate-600">Average Price</p>
                          <p className="text-2xl font-bold text-blue-600">${company.avgPrice.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                          <TrendingUp className="mx-auto text-green-600 mb-2" size={32} />
                          <p className="text-sm text-slate-600">Minimum Price</p>
                          <p className="text-2xl font-bold text-green-600">${company.minPrice.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-xl">
                          <BarChart3 className="mx-auto text-orange-600 mb-2" size={32} />
                          <p className="text-sm text-slate-600">Maximum Price</p>
                          <p className="text-2xl font-bold text-orange-600">${company.maxPrice.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                          <FileText className="mx-auto text-purple-600 mb-2" size={32} />
                          <p className="text-sm text-slate-600">Per Sq Ft</p>
                          <p className="text-2xl font-bold text-purple-600">${company.pricePerSqFt}</p>
                        </div>
                      </div>
                    </div>

                    {isPremium ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Price Trend</h2>
                        <div className="h-64 flex items-end justify-between gap-4 p-4">
                          {company.priceHistory.map((item) => (
                            <div key={item.month} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-blue-500 rounded-t-lg transition-all"
                                style={{
                                  height: `${(item.avgPrice / 10000) * 200}px`,
                                }}
                              />
                              <p className="text-xs text-slate-500 mt-2">{item.month.slice(5)}</p>
                              <p className="text-xs font-semibold">${item.avgPrice}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      renderLockedContent('price trend charts')
                    )}
                  </>
                ) : (
                  renderLockedContent('detailed pricing information')
                )}
              </>
            )}

            {/* Background */}
            {activeTab === 'background' && (
              <>
                {isPremium ? (
                  <>
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h2 className="text-xl font-bold text-slate-900 mb-6">Business Information</h2>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-slate-500">Legal Representative</p>
                          <p className="font-semibold">{company.owner}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Registration Number</p>
                          <p className="font-semibold">{company.registrationNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Registered Capital</p>
                          <p className="font-semibold">{company.capital}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Established Date</p>
                          <p className="font-semibold">{company.registrationDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Company Size</p>
                          <p className="font-semibold">{company.employees} employees</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Annual Revenue</p>
                          <p className="font-semibold">{company.annualRevenue}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-slate-500">Operating Status</p>
                          <p className="font-semibold text-green-600">{company.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Litigation Records</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          company.litigationCount > 0 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {company.litigationCount} records
                        </span>
                      </div>
                      
                      {company.litigations.length > 0 ? (
                        <div className="space-y-4">
                          {company.litigations.map((litigation, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                              <AlertTriangle className="text-yellow-500 flex-shrink-0" size={24} />
                              <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                  <span className="font-semibold">{litigation.type}</span>
                                  <span className={`text-sm ${
                                    litigation.status === 'Resolved' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {litigation.status}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">Date: {litigation.date}</p>
                                <p className="text-sm text-slate-600">Amount: {litigation.amount}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-600">No litigation records</p>
                      )}
                    </div>
                  </>
                ) : (
                  renderLockedContent('business information and litigation records')
                )}
              </>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h2>
                <div className="space-y-6">
                  {company.reviewsList.map((review) => (
                    <div key={review.id} className="border-b border-slate-200 pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                            {review.user[0]}
                          </div>
                          <span className="font-semibold">{review.user}</span>
                        </div>
                        <span className="text-sm text-slate-500">{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? '⭐' : '☆'} />
                        ))}
                      </div>
                      <p className="text-slate-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <>
                {isPremium ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Projects</h2>
                    <div className="space-y-4">
                      {company.projects.map((project, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{project.type}</p>
                            <p className="text-sm text-slate-500">{project.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">${project.cost.toLocaleString()}</p>
                            {project.sqFt && (
                              <p className="text-sm text-slate-500">{project.sqFt} sq ft</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderLockedContent('detailed project history')
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600">
                  <Phone size={18} />
                  {company.phone}
                </a>
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600">
                  <Mail size={18} />
                  {company.email}
                </a>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-blue-600">
                  <Globe size={18} />
                  Website
                </a>
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin size={18} className="flex-shrink-0 mt-1" />
                  {company.address}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
              <h3 className="font-bold mb-4">Price Range</h3>
              {isPremium || isBasic ? (
                <>
                  <div className="text-3xl font-bold mb-2">
                    ${company.minPrice.toLocaleString()} - ${company.maxPrice.toLocaleString()}
                  </div>
                  <p className="text-blue-200 text-sm">Average ${company.avgPrice.toLocaleString()}</p>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Lock size={24} />
                  <span>Upgrade to view</span>
                </div>
              )}
              <Link
                href="/pricing"
                className="mt-4 block text-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition"
              >
                {isPremium ? 'Manage Subscription' : 'Upgrade Now'}
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                  Get Quote
                </button>
                <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">
                  Save Company
                </button>
                <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">
                  Set Price Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
