'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Search, 
  ArrowLeft, 
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Navbar, Footer } from '../../components/Navigation';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { SubscriptionModal } from '../../components/SubscriptionModal';
import { industries, majorCities } from '../../lib/utils';

// Mock company data type
interface MockCompany {
  id: string;
  name: string;
  initial: string;
  city: string;
  state: string;
  verified: boolean;
  jobCount: number;
  avgQuote: string;
  contractorPrice: string;
  rating: number;
}

// Generate mock company data
const generateMockCompanies = (): MockCompany[] => {
  const companies: MockCompany[] = [];
  for (let i = 1; i <= 100; i++) {
    companies.push({
      id: `company-${i}`,
      name: `${['Elite', 'Pro', 'Master', 'Quality', 'First'][i % 5]} ${['Roofing', 'Construction', 'Services', 'Contractors', 'Solutions'][i % 5]} ${i}`,
      initial: String.fromCharCode(65 + (i % 26)),
      city: majorCities[i % majorCities.length],
      state: ['CA', 'TX', 'FL', 'NY', 'IL'][i % 5],
      verified: i % 3 !== 0,
      jobCount: 50 + Math.floor(Math.random() * 450),
      avgQuote: `$${(8000 + Math.floor(Math.random() * 12000)).toLocaleString()}`,
      contractorPrice: `$${(6000 + Math.floor(Math.random() * 10000)).toLocaleString()}`,
      rating: 3.5 + Math.random() * 1.5,
    });
  }
  return companies;
};

const allCompanies = generateMockCompanies();

function IndustryDetailContent() {
  const params = useParams();
  const industryId = params.id as string;
  const { subscription } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState<'jobs' | 'price' | 'name'>('jobs');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get industry info
  const industry = industries.find(i => i.id === industryId);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    const filtered = allCompanies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'all' || company.city === selectedCity;
      return matchesSearch && matchesCity;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'jobs') return b.jobCount - a.jobCount;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') {
        const priceA = parseFloat(a.avgQuote.replace(/[$,]/g, ''));
        const priceB = parseFloat(b.avgQuote.replace(/[$,]/g, ''));
        return priceA - priceB;
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, selectedCity, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canUnlockPrices = subscription === 'pro' || subscription === 'enterprise';

  if (!industry) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Industry Not Found</h1>
            <Link href="/industries" className="text-blue-600 hover:text-blue-700">
              ← Back to Industries
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/industries" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={18} />
            All Industries
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{industry.icon}</span>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">{industry.name}</h1>
              <p className="text-slate-300 mt-1">{industry.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-sm">Companies</p>
              <p className="text-2xl font-bold">{industry.company_count?.toLocaleString() ?? '2,500'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-sm">Avg. Savings</p>
              <p className="text-2xl font-bold text-green-400">-15%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-sm">Cities Covered</p>
              <p className="text-2xl font-bold">127</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-slate-400 text-sm">Last Update</p>
              <p className="text-2xl font-bold">Today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cities</option>
              {majorCities.slice(0, 20).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'jobs' | 'price' | 'name')}
              className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="jobs">Sort by Jobs</option>
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                  viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                  viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginatedCompanies.length} of {filteredCompanies.length} companies
          </p>
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-100">
                  <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-4 text-left">#</th>
                    <th className="px-4 py-4 text-left">Company</th>
                    <th className="px-4 py-4 text-left">Jobs</th>
                    <th className="px-4 py-4 text-left">Verified</th>
                    <th className="px-4 py-4 text-right">Avg. Quote</th>
                    <th className="px-4 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        Contractor Price
                        <Lock size={12} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCompanies.map((company, index) => (
                    <tr key={company.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-4 text-sm text-slate-400 font-medium">
                        #{(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
                            {company.initial}
                          </div>
                          <div>
                            <Link href={`/companies/${company.id}`} className="font-medium text-slate-900 hover:text-blue-600 transition">
                              {company.name}
                            </Link>
                            <p className="text-xs text-slate-500">{company.city}, {company.state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{company.jobCount}</td>
                      <td className="px-4 py-4">
                        {company.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">✓ Verified</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right font-medium">{company.avgQuote}</td>
                      <td className="px-4 py-4 text-right">
                        {canUnlockPrices ? (
                          <span className="font-bold text-green-600">{company.contractorPrice}</span>
                        ) : (
                          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-amber-600 hover:text-amber-700">
                            <span className="blur-sm select-none">{company.contractorPrice}</span>
                            <Lock size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCompanies.map(company => (
              <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl bg-slate-100 text-slate-600">
                    {company.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/companies/${company.id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition">
                      {company.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">{company.city}, {company.state}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span>{company.jobCount} jobs</span>
                      <span className="text-amber-500">★ {company.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-slate-500">Avg Quote</p>
                        <p className="font-semibold">{company.avgQuote}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Contractor</p>
                        {canUnlockPrices ? (
                          <p className="font-bold text-green-600">{company.contractorPrice}</p>
                        ) : (
                          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-amber-600">
                            <span className="blur-sm">{company.contractorPrice}</span>
                            <Lock size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-slate-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                      currentPage === totalPages
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </section>

      <Footer />

      <SubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        feature="contractor pricing"
      />
    </div>
  );
}

export default function IndustryDetailPage() {
  return (
    <AuthProvider>
      <IndustryDetailContent />
    </AuthProvider>
  );
}
