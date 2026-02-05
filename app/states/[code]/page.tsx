'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { 
  Search, MapPin, Building2, TrendingUp, Filter, Shield, 
  BarChart3, ChevronRight, ArrowUp, ArrowDown 
} from 'lucide-react';
import { Navbar, Footer } from '@/app/components/Navigation';

// Mock data for state
const STATE_DATA: Record<string, { name: string; description: string }> = {
  ca: { name: 'California', description: 'California is the most populous state with an active construction and service market.' },
  tx: { name: 'Texas', description: 'Texas is the second largest state with a diversified economy and thriving service industry.' },
  ny: { name: 'New York', description: 'New York is the financial and business center of the US with relatively higher service prices.' },
  fl: { name: 'Florida', description: 'Florida has warm climate with an active construction and repair market.' },
  il: { name: 'Illinois', description: 'Illinois is an economic hub of the Midwest region.' },
};

const STATE_STATS = {
  totalCompanies: 5234,
  avgPrice: 9500,
  priceChange: 3.2,
  totalProjects: 12543,
  topIndustry: 'Roofing',
};

const STATE_REGIONS = [
  { name: 'Los Angeles', companies: 1234, avgPrice: 10500 },
  { name: 'San Francisco', companies: 987, avgPrice: 12000 },
  { name: 'San Diego', companies: 654, avgPrice: 9200 },
  { name: 'San Jose', companies: 543, avgPrice: 11500 },
  { name: 'Sacramento', companies: 432, avgPrice: 8500 },
  { name: 'Oakland', companies: 321, avgPrice: 10000 },
];

const STATE_COMPANIES = [
  { id: 1, name: 'Premium Roofing Co.', industry: 'Roofing Services', city: 'Los Angeles', avgPrice: 8500, rating: 4.8, reviews: 342, verified: true },
  { id: 2, name: 'Reliable Roofing Services', industry: 'Roofing Services', city: 'San Francisco', avgPrice: 7200, rating: 4.6, reviews: 256, verified: true },
  { id: 3, name: 'Pro HVAC Services', industry: 'HVAC Services', city: 'San Diego', avgPrice: 3500, rating: 4.7, reviews: 287, verified: true },
  { id: 4, name: 'Reliable Plumbing Works', industry: 'Plumbing Services', city: 'San Jose', avgPrice: 2800, rating: 4.9, reviews: 521, verified: true },
  { id: 5, name: 'Pro Electrical Co.', industry: 'Electrical Services', city: 'Los Angeles', avgPrice: 4500, rating: 4.6, reviews: 198, verified: false },
  { id: 6, name: 'Quick Construction & Remodel', industry: 'Construction & Remodel', city: 'Sacramento', avgPrice: 15000, rating: 4.5, reviews: 167, verified: true },
];

const PRICE_HISTORY = [
  { month: 'Aug', price: 9200 },
  { month: 'Sep', price: 9350 },
  { month: 'Oct', price: 9400 },
  { month: 'Nov', price: 9450 },
  { month: 'Dec', price: 9480 },
  { month: 'Jan', price: 9500 },
];

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function StateDetail({ params }: PageProps) {
  const { code } = use(params);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const stateInfo = STATE_DATA[code] || { name: code.toUpperCase(), description: 'State detail page' };

  const industries = ['All', 'Roofing Services', 'HVAC Services', 'Plumbing Services', 'Electrical Services', 'Construction & Remodel'];

  const filteredCompanies = STATE_COMPANIES
    .filter((c) => selectedIndustry === 'All' || c.industry === selectedIndustry)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.avgPrice - b.avgPrice;
      if (sortBy === 'price-desc') return b.avgPrice - a.avgPrice;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Link href="/states" className="hover:text-white">States</Link>
            <span>/</span>
            <span className="text-white">{stateInfo.name}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{stateInfo.name}</h1>
          <p className="text-slate-300 text-lg mb-8 max-w-3xl">{stateInfo.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{STATE_STATS.totalCompanies.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Total Companies</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-cyan-400">${STATE_STATS.avgPrice.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Average Price</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400 flex items-center gap-1">
                <ArrowUp size={18} />
                {STATE_STATS.priceChange}%
              </div>
              <div className="text-slate-400 text-sm">Price Change (MoM)</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">{STATE_STATS.totalProjects.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Total Projects</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-400">{STATE_STATS.topIndustry}</div>
              <div className="text-slate-400 text-sm">Top Industry</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Price Trend</h2>
              <div className="h-48 flex items-end justify-between gap-4">
                {PRICE_HISTORY.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                      style={{
                        height: `${((item.price - 9000) / 600) * 150 + 20}px`,
                      }}
                    />
                    <p className="text-xs text-slate-500 mt-2">{item.month}</p>
                    <p className="text-xs font-semibold">${item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Companies List */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Company List</h2>
                <div className="flex gap-3">
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">{company.name}</h3>
                        {company.verified && <Shield size={16} className="text-green-600" />}
                      </div>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span>{company.industry}</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {company.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(company.rating) ? '⭐' : '☆'} />
                        ))}
                        <span className="font-semibold ml-1">{company.rating}</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">${company.avgPrice.toLocaleString()}</p>
                    </div>
                    <ChevronRight className="text-slate-400 ml-4" size={20} />
                  </Link>
                ))}
              </div>

              <Link
                href={`/search?state=${code}`}
                className="mt-6 block text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                View All Companies
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Regions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Popular Regions</h3>
              <div className="space-y-3">
                {STATE_REGIONS.map((region) => (
                  <Link
                    key={region.name}
                    href={`/search?state=${code}&city=${encodeURIComponent(region.name)}`}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{region.name}</p>
                      <p className="text-sm text-slate-500">{region.companies} companies</p>
                    </div>
                    <p className="font-bold text-blue-600">${region.avgPrice.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Industry Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Industry Distribution</h3>
              <div className="space-y-3">
                {[
                  { name: 'Roofing Services', count: 1234, percentage: 24 },
                  { name: 'HVAC Services', count: 987, percentage: 19 },
                  { name: 'Plumbing Services', count: 876, percentage: 17 },
                  { name: 'Electrical Services', count: 765, percentage: 15 },
                  { name: 'Construction & Remodel', count: 654, percentage: 13 },
                  { name: 'Other', count: 718, percentage: 12 },
                ].map((ind) => (
                  <div key={ind.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{ind.name}</span>
                      <span className="text-slate-500">{ind.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${ind.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
              <h3 className="font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href={`/search?state=${code}`}
                  className="block px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  Search {stateInfo.name} Companies
                </Link>
                <Link
                  href="/pricing"
                  className="block px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  Unlock Detailed Pricing
                </Link>
                <Link
                  href="/states"
                  className="block px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  Browse Other States
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
