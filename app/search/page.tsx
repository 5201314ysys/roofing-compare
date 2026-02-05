'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronDown, Shield, MapPin, Star, Building2 } from 'lucide-react';
import { Navbar, Footer } from '@/app/components/Navigation';

// Mock data for demonstration
const MOCK_COMPANIES = [
  {
    id: 1,
    name: 'Premium Roofing Co.',
    industry: 'roofing',
    state: 'CA',
    city: 'Los Angeles',
    avgPrice: 8500,
    maxPrice: 15000,
    rating: 4.8,
    reviews: 342,
    verified: true,
    recentProjects: 45,
    license: '12345-CA',
  },
  {
    id: 2,
    name: 'Reliable Roofing Services',
    industry: 'roofing',
    state: 'CA',
    city: 'San Francisco',
    avgPrice: 7200,
    maxPrice: 12000,
    rating: 4.6,
    reviews: 256,
    verified: true,
    recentProjects: 38,
    license: '12346-CA',
  },
  {
    id: 3,
    name: 'Quick Roof Repair',
    industry: 'roofing',
    state: 'TX',
    city: 'Houston',
    avgPrice: 6800,
    maxPrice: 11500,
    rating: 4.5,
    reviews: 189,
    verified: false,
    recentProjects: 28,
    license: '12347-TX',
  },
];

const STATES_MAP: Record<string, string> = {
  ca: 'California',
  tx: 'Texas',
  ny: 'New York',
  fl: 'Florida',
};

const INDUSTRIES_MAP: Record<string, string> = {
  roofing: 'Roofing Services',
  hvac: 'HVAC Services',
  plumbing: 'Plumbing Services',
  electrical: 'Electrical Services',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [filteredCompanies, setFilteredCompanies] = useState(MOCK_COMPANIES);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get('q') || '';
  const state = searchParams.get('state') || '';
  const industry = searchParams.get('industry') || '';

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    let filtered = companies;

    // Filter by search term
    if (q) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.city.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Filter by state
    if (state) {
      filtered = filtered.filter((c) => c.state === state.toUpperCase());
    }

    // Filter by industry
    if (industry) {
      filtered = filtered.filter((c) => c.industry === industry);
    }

    // Filter by price range
    filtered = filtered.filter((c) => c.avgPrice >= priceRange[0] && c.avgPrice <= priceRange[1]);

    // Filter by rating
    filtered = filtered.filter((c) => c.rating >= minRating);

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.avgPrice - a.avgPrice);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredCompanies(filtered);
  }, [q, state, industry, priceRange, minRating, sortBy, companies]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Search Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Search Results</h1>
            {q && <p className="text-slate-300">Keyword: <span className="font-semibold">{q}</span></p>}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-64 flex-shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg font-semibold mb-4"
              >
                <Filter size={20} />
                Filters
              </button>

              <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* Price Range */}
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="font-bold text-slate-900 mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="font-bold text-slate-900 mb-4">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <label key={rating} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700">
                          {rating === 0 ? 'All' : `${rating}+⭐`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification */}
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="font-bold text-slate-900 mb-4">Verification Status</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-slate-700">Show verified only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Sort Options */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-slate-600">
                  Found <span className="font-bold">{filteredCompanies.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                </div>
              </div>

              {/* Companies List */}
              <div className="space-y-4">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}`}
                      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition block"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
                            {company.verified && (
                              <Shield size={20} className="text-green-600" title="Verified" />
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 size={16} />
                              {INDUSTRIES_MAP[company.industry] || company.industry}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              {company.city}, {company.state}
                            </div>
                            <div>License: {company.license}</div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < Math.floor(company.rating) ? '⭐' : '☆'} />
                                ))}
                              </div>
                              <span className="font-semibold">{company.rating}</span>
                              <span className="text-slate-500">({company.reviews})</span>
                            </div>
                            <div className="text-slate-500">{company.recentProjects} projects</div>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <div className="text-sm text-slate-600 mb-1">Average Price</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${company.avgPrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-500">
                            up to ${company.maxPrice.toLocaleString()}
                          </div>
                          <button className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-slate-600">No matching companies found</p>
                    <p className="text-slate-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
