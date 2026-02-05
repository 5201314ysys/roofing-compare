'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Building2, TrendingUp, Users } from 'lucide-react';
import { Navbar, Footer } from '@/app/components/Navigation';

const ALL_STATES = [
  // All 50 US States (alphabetical order)
  { code: 'AL', name: 'Alabama', companies: 1234, avgPrice: 6500, updated: 'Today', region: 'Southeast', capital: 'Montgomery', population: '5.0M' },
  { code: 'AK', name: 'Alaska', companies: 456, avgPrice: 8200, updated: 'Yesterday', region: 'Pacific', capital: 'Juneau', population: '732K' },
  { code: 'AZ', name: 'Arizona', companies: 2341, avgPrice: 7100, updated: 'Today', region: 'Southwest', capital: 'Phoenix', population: '7.3M' },
  { code: 'AR', name: 'Arkansas', companies: 987, avgPrice: 5800, updated: 'Yesterday', region: 'Southeast', capital: 'Little Rock', population: '3.0M' },
  { code: 'CA', name: 'California', companies: 5234, avgPrice: 9500, updated: 'Today', region: 'Pacific', capital: 'Sacramento', population: '39.5M' },
  { code: 'CO', name: 'Colorado', companies: 1876, avgPrice: 7800, updated: 'Today', region: 'Mountain', capital: 'Denver', population: '5.8M' },
  { code: 'CT', name: 'Connecticut', companies: 1234, avgPrice: 8200, updated: 'Today', region: 'Northeast', capital: 'Hartford', population: '3.6M' },
  { code: 'DE', name: 'Delaware', companies: 567, avgPrice: 7500, updated: 'Yesterday', region: 'Northeast', capital: 'Dover', population: '990K' },
  { code: 'FL', name: 'Florida', companies: 3987, avgPrice: 7200, updated: 'Today', region: 'Southeast', capital: 'Tallahassee', population: '21.5M' },
  { code: 'GA', name: 'Georgia', companies: 2654, avgPrice: 6800, updated: 'Today', region: 'Southeast', capital: 'Atlanta', population: '10.7M' },
  { code: 'HI', name: 'Hawaii', companies: 345, avgPrice: 10500, updated: 'Yesterday', region: 'Pacific', capital: 'Honolulu', population: '1.4M' },
  { code: 'ID', name: 'Idaho', companies: 765, avgPrice: 6200, updated: 'Yesterday', region: 'Mountain', capital: 'Boise', population: '1.8M' },
  { code: 'IL', name: 'Illinois', companies: 3124, avgPrice: 7500, updated: 'Today', region: 'Midwest', capital: 'Springfield', population: '12.7M' },
  { code: 'IN', name: 'Indiana', companies: 1567, avgPrice: 6100, updated: 'Today', region: 'Midwest', capital: 'Indianapolis', population: '6.8M' },
  { code: 'IA', name: 'Iowa', companies: 987, avgPrice: 5900, updated: 'Yesterday', region: 'Midwest', capital: 'Des Moines', population: '3.2M' },
  { code: 'KS', name: 'Kansas', companies: 876, avgPrice: 5700, updated: 'Yesterday', region: 'Midwest', capital: 'Topeka', population: '2.9M' },
  { code: 'KY', name: 'Kentucky', companies: 1123, avgPrice: 5800, updated: 'Today', region: 'Southeast', capital: 'Frankfort', population: '4.5M' },
  { code: 'LA', name: 'Louisiana', companies: 1234, avgPrice: 6300, updated: 'Today', region: 'Southeast', capital: 'Baton Rouge', population: '4.6M' },
  { code: 'ME', name: 'Maine', companies: 654, avgPrice: 7200, updated: 'Yesterday', region: 'Northeast', capital: 'Augusta', population: '1.4M' },
  { code: 'MD', name: 'Maryland', companies: 1876, avgPrice: 8100, updated: 'Today', region: 'Northeast', capital: 'Annapolis', population: '6.2M' },
  { code: 'MA', name: 'Massachusetts', companies: 2345, avgPrice: 9200, updated: 'Today', region: 'Northeast', capital: 'Boston', population: '7.0M' },
  { code: 'MI', name: 'Michigan', companies: 2134, avgPrice: 6500, updated: 'Today', region: 'Midwest', capital: 'Lansing', population: '10.0M' },
  { code: 'MN', name: 'Minnesota', companies: 1654, avgPrice: 6800, updated: 'Today', region: 'Midwest', capital: 'Saint Paul', population: '5.7M' },
  { code: 'MS', name: 'Mississippi', companies: 765, avgPrice: 5400, updated: 'Yesterday', region: 'Southeast', capital: 'Jackson', population: '3.0M' },
  { code: 'MO', name: 'Missouri', companies: 1456, avgPrice: 6000, updated: 'Today', region: 'Midwest', capital: 'Jefferson City', population: '6.2M' },
  { code: 'MT', name: 'Montana', companies: 432, avgPrice: 6500, updated: 'Yesterday', region: 'Mountain', capital: 'Helena', population: '1.1M' },
  { code: 'NE', name: 'Nebraska', companies: 654, avgPrice: 5800, updated: 'Yesterday', region: 'Midwest', capital: 'Lincoln', population: '1.9M' },
  { code: 'NV', name: 'Nevada', companies: 1234, avgPrice: 7800, updated: 'Today', region: 'Mountain', capital: 'Carson City', population: '3.1M' },
  { code: 'NH', name: 'New Hampshire', companies: 567, avgPrice: 7500, updated: 'Yesterday', region: 'Northeast', capital: 'Concord', population: '1.4M' },
  { code: 'NJ', name: 'New Jersey', companies: 2543, avgPrice: 8500, updated: 'Today', region: 'Northeast', capital: 'Trenton', population: '9.3M' },
  { code: 'NM', name: 'New Mexico', companies: 765, avgPrice: 6200, updated: 'Yesterday', region: 'Southwest', capital: 'Santa Fe', population: '2.1M' },
  { code: 'NY', name: 'New York', companies: 4156, avgPrice: 9800, updated: 'Today', region: 'Northeast', capital: 'Albany', population: '19.5M' },
  { code: 'NC', name: 'North Carolina', companies: 2654, avgPrice: 6500, updated: 'Today', region: 'Southeast', capital: 'Raleigh', population: '10.4M' },
  { code: 'ND', name: 'North Dakota', companies: 345, avgPrice: 5800, updated: 'Yesterday', region: 'Midwest', capital: 'Bismarck', population: '779K' },
  { code: 'OH', name: 'Ohio', companies: 2876, avgPrice: 6200, updated: 'Today', region: 'Midwest', capital: 'Columbus', population: '11.8M' },
  { code: 'OK', name: 'Oklahoma', companies: 1123, avgPrice: 5600, updated: 'Today', region: 'Southwest', capital: 'Oklahoma City', population: '4.0M' },
  { code: 'OR', name: 'Oregon', companies: 1456, avgPrice: 7200, updated: 'Today', region: 'Pacific', capital: 'Salem', population: '4.2M' },
  { code: 'PA', name: 'Pennsylvania', companies: 2876, avgPrice: 7100, updated: 'Today', region: 'Northeast', capital: 'Harrisburg', population: '13.0M' },
  { code: 'RI', name: 'Rhode Island', companies: 432, avgPrice: 8000, updated: 'Yesterday', region: 'Northeast', capital: 'Providence', population: '1.1M' },
  { code: 'SC', name: 'South Carolina', companies: 1543, avgPrice: 6000, updated: 'Today', region: 'Southeast', capital: 'Columbia', population: '5.1M' },
  { code: 'SD', name: 'South Dakota', companies: 321, avgPrice: 5700, updated: 'Yesterday', region: 'Midwest', capital: 'Pierre', population: '887K' },
  { code: 'TN', name: 'Tennessee', companies: 1876, avgPrice: 6100, updated: 'Today', region: 'Southeast', capital: 'Nashville', population: '6.9M' },
  { code: 'TX', name: 'Texas', companies: 4821, avgPrice: 7000, updated: 'Today', region: 'Southwest', capital: 'Austin', population: '29.1M' },
  { code: 'UT', name: 'Utah', companies: 1234, avgPrice: 6800, updated: 'Today', region: 'Mountain', capital: 'Salt Lake City', population: '3.3M' },
  { code: 'VT', name: 'Vermont', companies: 321, avgPrice: 7200, updated: 'Yesterday', region: 'Northeast', capital: 'Montpelier', population: '643K' },
  { code: 'VA', name: 'Virginia', companies: 2345, avgPrice: 7500, updated: 'Today', region: 'Southeast', capital: 'Richmond', population: '8.6M' },
  { code: 'WA', name: 'Washington', companies: 2134, avgPrice: 7800, updated: 'Today', region: 'Pacific', capital: 'Olympia', population: '7.7M' },
  { code: 'WV', name: 'West Virginia', companies: 543, avgPrice: 5500, updated: 'Yesterday', region: 'Southeast', capital: 'Charleston', population: '1.8M' },
  { code: 'WI', name: 'Wisconsin', companies: 1543, avgPrice: 6300, updated: 'Today', region: 'Midwest', capital: 'Madison', population: '5.9M' },
  { code: 'WY', name: 'Wyoming', companies: 234, avgPrice: 6100, updated: 'Yesterday', region: 'Mountain', capital: 'Cheyenne', population: '577K' },
  
  // U.S. Territories and District
  { code: 'DC', name: 'Washington D.C.', companies: 1456, avgPrice: 9500, updated: 'Today', region: 'Northeast', capital: 'Washington', population: '705K' },
  { code: 'PR', name: 'Puerto Rico', companies: 876, avgPrice: 5200, updated: 'Yesterday', region: 'Caribbean', capital: 'San Juan', population: '3.2M' },
  { code: 'VI', name: 'U.S. Virgin Islands', companies: 123, avgPrice: 6800, updated: 'Yesterday', region: 'Caribbean', capital: 'Charlotte Amalie', population: '105K' },
  { code: 'GU', name: 'Guam', companies: 234, avgPrice: 7500, updated: 'Yesterday', region: 'Pacific', capital: 'Hagåtña', population: '169K' },
  { code: 'AS', name: 'American Samoa', companies: 89, avgPrice: 6200, updated: 'Yesterday', region: 'Pacific', capital: 'Pago Pago', population: '55K' },
  { code: 'MP', name: 'Northern Mariana Islands', companies: 67, avgPrice: 7000, updated: 'Yesterday', region: 'Pacific', capital: 'Saipan', population: '57K' },
];

export default function StatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'companies' | 'price'>('name');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  // Get all regions
  const allRegions = Array.from(new Set(ALL_STATES.map(s => s.region))).sort();

  const filteredStates = ALL_STATES
    .filter((state) => {
      const matchesSearch = state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        state.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === 'all' || state.region === regionFilter;
      return matchesSearch && matchesRegion;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'companies') return b.companies - a.companies;
      if (sortBy === 'price') return b.avgPrice - a.avgPrice;
      return 0;
    });

  const totalCompanies = filteredStates.reduce((sum, s) => sum + s.companies, 0);
  const avgPrice = filteredStates.length > 0 
    ? Math.round(filteredStates.reduce((sum, s) => sum + s.avgPrice, 0) / filteredStates.length)
    : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse by State</h1>
          <p className="text-slate-300 text-lg mb-8">Explore business pricing data across all 50 US states</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl">
            <div>
              <div className="text-3xl font-bold text-blue-400">{ALL_STATES.length}</div>
              <div className="text-slate-400">States</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">{totalCompanies.toLocaleString()}</div>
              <div className="text-slate-400">Businesses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">${avgPrice.toLocaleString()}</div>
              <div className="text-slate-400">Avg. Price</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search state name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="md:w-48">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Regions</option>
                {allRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'companies' | 'price')}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="companies">Sort by Companies</option>
                <option value="price">Sort by Avg. Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-slate-600 mb-6">
          Showing <span className="font-bold">{filteredStates.length}</span> states
        </p>

        {/* States Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStates.map((state) => (
            <Link
              key={state.code}
              href={`/states/${state.code.toLowerCase()}`}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-500 transition group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600 text-lg">
                  {state.code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition">{state.name}</h3>
                  <span className="text-xs text-slate-500">{state.region}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Building2 size={14} />
                    Companies
                  </span>
                  <span className="font-semibold text-slate-900">{state.companies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <TrendingUp size={14} />
                    Avg. Price
                  </span>
                  <span className="font-semibold text-blue-600">${state.avgPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users size={14} />
                    Population
                  </span>
                  <span className="text-xs text-slate-600">{state.population}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">{state.region}</span>
                <span className="text-xs text-green-600">Updated: {state.updated}</span>
              </div>
            </Link>
          ))}
        </div>

        {filteredStates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-slate-600">No matching states found</p>
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
