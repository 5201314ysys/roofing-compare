'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Info, Building2, CheckCircle2, Search, MapPin, Phone, Mail, Globe, Star, Award, Shield, Clock, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Contractor {
  id: string;
  name: string;
  initial: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  rating?: number;
  review_count?: number;
  total_projects: number;
  avg_quote: number;
  contractor_price: number;
  verified_at: string;
  specialties?: string[];
  service_areas?: string[];
  emergency_service?: boolean;
  warranty_years?: number;
  insurance_verified?: boolean;
  bonded?: boolean;
  is_featured?: boolean;
  bbb_rating?: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);

  // Load data from Supabase
  useEffect(() => {
    async function loadContractors() {
      try {
        setLoading(true);
        
        // Get contractor data (using more fields)
        const { data, error } = await supabase
          .from('contractors')
          .select(`
            id, name, initial, city, state, 
            phone, email, website, logo_url, description,
            rating, review_count, total_projects, total_value,
            avg_quote, contractor_price, verified_at,
            specialties, service_areas, emergency_service, warranty_years,
            insurance_verified, bonded, is_featured, bbb_rating
          `)
          .gte('total_projects', 3) // At least 3 projects
          .eq('is_active', true) // Only show active contractors
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false, nullsFirst: false })
          .order('total_projects', { ascending: false })
          .limit(100);
        
        if (error) throw error;
        
        if (data) {
          setContractors(data);
          
          // Extract city list
          const uniqueCities = [...new Set(data.map(c => `${c.city}, ${c.state}`).filter(Boolean))];
          setCities(uniqueCities.sort());
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadContractors();
  }, []);

  // Handle unlock click
  const handleUnlockClick = async () => {
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const userAgent = navigator.userAgent;
    
    window.location.href = "mailto:apex.roofing.group@outlook.com?subject=I want access to contractor pricing&body=Hello,%0D%0A%0D%0AI'm interested in accessing contractor pricing.%0D%0A%0D%0AThank you!";
    
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp, userAgent })
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
    
    setTimeout(() => setIsModalOpen(false), 1500);
  };

  // Filter contractors
  const filteredContractors = contractors.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || `${company.city}, ${company.state}` === cityFilter;
    return matchesSearch && matchesCity;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render star rating
  const renderStars = (rating?: number) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} size={16} className="text-slate-300" />);
      }
    }
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Roofing Compare</h1>
                <p className="text-sm text-slate-600">Nationwide Real Contractor Database</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Cities Covered</div>
                <div className="text-lg font-bold text-slate-900">{cities.length}+</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Contractors</div>
                <div className="text-lg font-bold text-slate-900">{contractors.length}+</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Find the Most Affordable Roofing Contractors
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Based on {contractors.reduce((sum, c) => sum + c.total_projects, 0).toLocaleString()}+ Real Government Permit Records
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search contractor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full md:w-48 pl-10 pr-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8 flex items-start space-x-3">
          <Info className="text-slate-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Data Source Information</h3>
            <p className="text-sm text-slate-700">
              All data comes from public government building permit databases in major US cities, including Chicago, Austin, Seattle, and more.
              Prices are based on real project quotes. Contractor base prices are approximately 85% of market average.
            </p>
          </div>
        </div>

        {/* Results Stats */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredContractors.length}</span> contractors
          </div>
          {loading && <div className="text-slate-500">Loading...</div>}
        </div>

        {/* Company Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading data...</p>
          </div>
        ) : filteredContractors.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-600 text-lg">No matching contractors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredContractors.map((company) => (
              <div 
                key={company.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden relative"
              >
                {/* Featured Badge */}
                {company.is_featured && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                    ⭐ Featured
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Company Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Logo */}
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                          {company.initial}
                        </div>
                      )}
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{company.name}</h3>
                          <CheckCircle2 className="text-blue-500" size={20} title="Verified" />
                        </div>
                        
                        {/* Rating */}
                        {company.rating && (
                          <div className="flex items-center space-x-2 mb-2">
                            {renderStars(company.rating)}
                            <span className="text-sm font-semibold text-slate-700">{company.rating.toFixed(1)}</span>
                            {company.review_count && company.review_count > 0 && (
                              <span className="text-sm text-slate-500">({company.review_count} reviews)</span>
                            )}
                            {company.bbb_rating && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                BBB: {company.bbb_rating}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Location & Stats */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin size={16} />
                            <span>{company.city}, {company.state}</span>
                          </div>
                          <div>Completed <span className="font-semibold text-slate-900">{company.total_projects}</span> projects</div>
                          <div>Verified on {formatDate(company.verified_at)}</div>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {company.emergency_service && (
                            <span className="inline-flex items-center space-x-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                              <Zap size={12} />
                              <span>24/7 Emergency</span>
                            </span>
                          )}
                          {company.insurance_verified && (
                            <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                              <Shield size={12} />
                              <span>Insurance Verified</span>
                            </span>
                          )}
                          {company.bonded && (
                            <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                              <Award size={12} />
                              <span>Bonded</span>
                            </span>
                          )}
                          {company.warranty_years && company.warranty_years > 0 && (
                            <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                              <Clock size={12} />
                              <span>{company.warranty_years}-Year Warranty</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Specialties */}
                        {company.specialties && company.specialties.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-slate-500 mb-1">Specialties:</div>
                            <div className="flex flex-wrap gap-1">
                              {company.specialties.slice(0, 4).map((specialty, idx) => (
                                <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                  {specialty}
                                </span>
                              ))}
                              {company.specialties.length > 4 && (
                                <span className="text-xs text-slate-500 px-2 py-1">
                                  +{company.specialties.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Contact Buttons */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          {company.phone && (
                            <a 
                              href={`tel:${company.phone}`}
                              className="inline-flex items-center space-x-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                            >
                              <Phone size={14} />
                              <span>{company.phone}</span>
                            </a>
                          )}
                          {company.website && (
                            <a 
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-sm bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                              <Globe size={14} />
                              <span>Website</span>
                            </a>
                          )}
                          {company.email && (
                            <a 
                              href={`mailto:${company.email}`}
                              className="inline-flex items-center space-x-1 text-sm bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                              <Mail size={14} />
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                        
                        {/* Pricing */}
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <div className="text-sm text-slate-500 mb-1">Market Average</div>
                            <div className="text-2xl font-bold text-slate-900">{formatCurrency(company.avg_quote)}</div>
                          </div>
                          
                          <div className="relative">
                            <div className="text-sm text-slate-500 mb-1 flex items-center space-x-1">
                              <span>Contractor Price</span>
                              <span className="text-xs text-green-600 font-semibold">(Save 15-20%)</span>
                            </div>
                            <div className="relative">
                              <div className="text-2xl font-bold text-green-600 blur-sm select-none">
                                {formatCurrency(company.contractor_price)}
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                  onClick={() => setIsModalOpen(true)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center space-x-2"
                                >
                                  <Lock size={14} />
                                  <span>Unlock</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {contractors.reduce((sum, c) => sum + c.total_projects, 0).toLocaleString()}+
            </div>
            <div className="text-slate-600">Real Project Records</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{cities.length}+</div>
            <div className="text-slate-600">Cities Covered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-slate-600">Government Verified Data</div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-white" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Unlock Contractor Pricing
              </h3>
              
              <p className="text-slate-600 mb-8">
                Email us to get real contractor base pricing information and save up to 15-20% on renovation costs.
              </p>
              
              <button
                onClick={handleUnlockClick}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Send Email to Unlock
              </button>
              
              <p className="text-sm text-slate-500 mt-4">
                Completely free, no credit card required
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
