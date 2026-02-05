'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Shield, MapPin, Building2, ChevronRight } from 'lucide-react';
import { Navbar, Footer } from '@/app/components/Navigation';

const ALL_COMPANIES = [
  { id: 1, name: 'Premium Roofing Co.', industry: 'Roofing Services', state: 'CA', city: 'Los Angeles', avgPrice: 8500, rating: 4.8, reviews: 342, verified: true },
  { id: 2, name: 'Reliable Roofing Services', industry: 'Roofing Services', state: 'CA', city: 'San Francisco', avgPrice: 7200, rating: 4.6, reviews: 256, verified: true },
  { id: 3, name: 'Pro HVAC Services', industry: 'HVAC Services', state: 'TX', city: 'Houston', avgPrice: 3500, rating: 4.7, reviews: 287, verified: true },
  { id: 4, name: 'Reliable Plumbing Works', industry: 'Plumbing Services', state: 'NY', city: 'New York', avgPrice: 2800, rating: 4.9, reviews: 521, verified: true },
  { id: 5, name: 'Pro Electrical Co.', industry: 'Electrical Services', state: 'CA', city: 'Los Angeles', avgPrice: 4500, rating: 4.6, reviews: 198, verified: false },
  { id: 6, name: 'Quick Construction & Remodel', industry: 'Construction & Remodel', state: 'FL', city: 'Miami', avgPrice: 15000, rating: 4.5, reviews: 167, verified: true },
  { id: 7, name: 'Landscaping Experts', industry: 'Landscaping', state: 'TX', city: 'Dallas', avgPrice: 2200, rating: 4.4, reviews: 134, verified: false },
  { id: 8, name: 'Premium HVAC Installation', industry: 'HVAC Services', state: 'NY', city: 'Buffalo', avgPrice: 4200, rating: 4.8, reviews: 312, verified: true },
];

const INDUSTRIES = ['All', 'Roofing Services', 'HVAC Services', 'Plumbing Services', 'Electrical Services', 'Construction & Remodel', 'Landscaping'];
const STATES = ['All', 'CA', 'TX', 'NY', 'FL', 'IL', 'PA'];

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  const filteredCompanies = ALL_COMPANIES.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
    const matchesState = selectedState === 'All' || company.state === selectedState;
    return matchesSearch && matchesIndustry && matchesState;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse Companies</h1>
          <p className="text-slate-300 text-lg">Explore pricing and services from 10,000+ certified businesses nationwide</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search companies or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-slate-600 mb-6">
          Found <span className="font-bold">{filteredCompanies.length}</span> companies
        </p>

        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {company.name}
                  </h3>
                  {company.verified && <Shield size={20} className="text-green-600" />}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <Building2 size={16} />
                  {company.industry}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <MapPin size={16} />
                  {company.city}, {company.state}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(company.rating) ? '⭐' : '☆'} />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900">{company.rating}</span>
                  <span className="text-sm text-slate-500">({company.reviews})</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-sm text-slate-500">Average Price</p>
                    <p className="text-lg font-bold text-blue-600">${company.avgPrice.toLocaleString()}</p>
                  </div>
                  <ChevronRight className="text-slate-400 group-hover:text-blue-600 transition" size={24} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-slate-600">No matching companies found</p>
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
