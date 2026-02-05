'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Building2, MapPin, Shield, Zap, Crown, BarChart3, Users } from 'lucide-react';
import { Navbar, Footer } from './components/Navigation';
import { useRouter } from 'next/navigation';

// Industry categories grouped by type
const INDUSTRY_CATEGORIES = [
  {
    category: 'Construction',
    industries: [
      { id: 'roofing', name: 'Roofing' },
      { id: 'general-contracting', name: 'General Contracting' },
      { id: 'foundation-concrete', name: 'Foundation & Concrete' },
      { id: 'framing-carpentry', name: 'Framing & Carpentry' },
      { id: 'masonry-brickwork', name: 'Masonry & Brickwork' },
      { id: 'demolition', name: 'Demolition' },
    ]
  },
  {
    category: 'Plumbing & HVAC',
    industries: [
      { id: 'plumbing', name: 'Plumbing' },
      { id: 'hvac', name: 'HVAC' },
      { id: 'water-heater', name: 'Water Heater' },
      { id: 'septic-sewer', name: 'Septic & Sewer' },
    ]
  },
  {
    category: 'Electrical',
    industries: [
      { id: 'electrical', name: 'Electrical Services' },
      { id: 'solar', name: 'Solar Installation' },
      { id: 'generator', name: 'Generator Services' },
    ]
  },
  {
    category: 'Interior Remodeling',
    industries: [
      { id: 'flooring', name: 'Flooring' },
      { id: 'painting', name: 'Painting' },
      { id: 'drywall', name: 'Drywall' },
      { id: 'tile-countertop', name: 'Tile & Countertop' },
      { id: 'kitchen-remodeling', name: 'Kitchen Remodeling' },
      { id: 'bathroom-remodeling', name: 'Bathroom Remodeling' },
      { id: 'cabinetry', name: 'Cabinetry' },
    ]
  },
  {
    category: 'Doors & Windows',
    industries: [
      { id: 'window-installation', name: 'Window Installation' },
      { id: 'door-installation', name: 'Door Installation' },
      { id: 'garage-door', name: 'Garage Door' },
    ]
  },
  {
    category: 'Exterior & Outdoor',
    industries: [
      { id: 'landscaping', name: 'Landscaping' },
      { id: 'hardscaping', name: 'Hardscaping' },
      { id: 'fencing', name: 'Fencing' },
      { id: 'deck-patio', name: 'Deck & Patio' },
      { id: 'pool', name: 'Pool Installation' },
      { id: 'irrigation', name: 'Irrigation' },
      { id: 'tree-service', name: 'Tree Service' },
    ]
  },
  {
    category: 'Cleaning & Maintenance',
    industries: [
      { id: 'home-cleaning', name: 'Home Cleaning' },
      { id: 'carpet-cleaning', name: 'Carpet Cleaning' },
      { id: 'window-cleaning', name: 'Window Cleaning' },
      { id: 'pressure-washing', name: 'Pressure Washing' },
      { id: 'gutter-cleaning', name: 'Gutter Cleaning' },
      { id: 'chimney-sweep', name: 'Chimney Sweep' },
    ]
  },
  {
    category: 'Pest Control & Security',
    industries: [
      { id: 'pest-control', name: 'Pest Control' },
      { id: 'termite', name: 'Termite Treatment' },
      { id: 'wildlife-removal', name: 'Wildlife Removal' },
      { id: 'security', name: 'Security Systems' },
    ]
  },
  {
    category: 'Automotive',
    industries: [
      { id: 'auto-repair', name: 'Auto Repair' },
      { id: 'auto-body', name: 'Auto Body Shop' },
      { id: 'oil-change', name: 'Oil Change' },
      { id: 'tire-service', name: 'Tire Service' },
    ]
  },
  {
    category: 'Moving & Storage',
    industries: [
      { id: 'moving', name: 'Moving Services' },
      { id: 'storage', name: 'Storage' },
      { id: 'junk-removal', name: 'Junk Removal' },
    ]
  },
  {
    category: 'Professional Services',
    industries: [
      { id: 'home-inspection', name: 'Home Inspection' },
      { id: 'locksmith', name: 'Locksmith' },
      { id: 'handyman', name: 'Handyman' },
      { id: 'interior-design', name: 'Interior Design' },
      { id: 'architect', name: 'Architect Services' },
    ]
  },
  {
    category: 'Appliance Repair',
    industries: [
      { id: 'appliance-repair', name: 'Appliance Repair' },
      { id: 'computer-repair', name: 'Computer Repair' },
      { id: 'phone-repair', name: 'Phone Repair' },
    ]
  },
  {
    category: 'Lifestyle Services',
    industries: [
      { id: 'pet-grooming', name: 'Pet Grooming' },
      { id: 'pet-sitting', name: 'Pet Sitting' },
      { id: 'photography', name: 'Photography' },
      { id: 'event-planning', name: 'Event Planning' },
      { id: 'catering', name: 'Catering' },
    ]
  },
];

// State regions
const STATE_REGIONS = [
  {
    region: 'Northeast',
    states: [
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NY', name: 'New York' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'VT', name: 'Vermont' },
      { code: 'DC', name: 'Washington D.C.' },
    ]
  },
  {
    region: 'Southeast',
    states: [
      { code: 'AL', name: 'Alabama' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WV', name: 'West Virginia' },
    ]
  },
  {
    region: 'Midwest',
    states: [
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MO', name: 'Missouri' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'WI', name: 'Wisconsin' },
    ]
  },
  {
    region: 'Southwest',
    states: [
      { code: 'AZ', name: 'Arizona' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'TX', name: 'Texas' },
    ]
  },
  {
    region: 'Mountain',
    states: [
      { code: 'CO', name: 'Colorado' },
      { code: 'ID', name: 'Idaho' },
      { code: 'MT', name: 'Montana' },
      { code: 'NV', name: 'Nevada' },
      { code: 'UT', name: 'Utah' },
      { code: 'WY', name: 'Wyoming' },
    ]
  },
  {
    region: 'Pacific',
    states: [
      { code: 'AK', name: 'Alaska' },
      { code: 'CA', name: 'California' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'OR', name: 'Oregon' },
      { code: 'WA', name: 'Washington' },
    ]
  },
  {
    region: 'U.S. Territories',
    states: [
      { code: 'PR', name: 'Puerto Rico' },
      { code: 'VI', name: 'U.S. Virgin Islands' },
      { code: 'GU', name: 'Guam' },
      { code: 'AS', name: 'American Samoa' },
      { code: 'MP', name: 'Northern Mariana Islands' },
    ]
  },
];

// Featured industries
const FEATURED_INDUSTRIES = [
  { id: 'roofing', name: 'Roofing', name_zh: 'Roofing', company_count: 15420 },
  { id: 'plumbing', name: 'Plumbing', name_zh: 'Plumbing', company_count: 22350 },
  { id: 'electrical', name: 'Electrical', name_zh: 'Electrical', company_count: 18760 },
  { id: 'hvac', name: 'HVAC', name_zh: 'HVAC', company_count: 12890 },
  { id: 'painting', name: 'Painting', name_zh: 'Painting', company_count: 9870 },
  { id: 'landscaping', name: 'Landscaping', name_zh: 'Landscaping', company_count: 11240 },
  { id: 'cleaning', name: 'Cleaning', name_zh: 'Cleaning', company_count: 28500 },
  { id: 'moving', name: 'Moving', name_zh: 'Moving', company_count: 8920 },
  { id: 'auto-repair', name: 'Auto Repair', name_zh: 'Auto Repair', company_count: 35680 },
  { id: 'pest-control', name: 'Pest Control', name_zh: 'Pest Control', company_count: 6540 },
  { id: 'locksmith', name: 'Locksmith', name_zh: 'Locksmith', company_count: 4320 },
  { id: 'appliance-repair', name: 'Appliance Repair', name_zh: 'Appliance Repair', company_count: 7650 },
];

// Top states
const TOP_STATES = [
  { code: 'CA', name: 'California', companies: 52340, updates: '2024-01' },
  { code: 'TX', name: 'Texas', companies: 48920, updates: '2024-01' },
  { code: 'FL', name: 'Florida', companies: 38750, updates: '2024-01' },
  { code: 'NY', name: 'New York', companies: 35680, updates: '2024-01' },
  { code: 'PA', name: 'Pennsylvania', companies: 24890, updates: '2024-01' },
  { code: 'IL', name: 'Illinois', companies: 22340, updates: '2024-01' },
  { code: 'OH', name: 'Ohio', companies: 19870, updates: '2024-01' },
  { code: 'GA', name: 'Georgia', companies: 18560, updates: '2024-01' },
  { code: 'NC', name: 'North Carolina', companies: 17240, updates: '2024-01' },
  { code: 'MI', name: 'Michigan', companies: 16890, updates: '2024-01' },
  { code: 'NJ', name: 'New Jersey', companies: 15670, updates: '2024-01' },
  { code: 'WA', name: 'Washington', companies: 14320, updates: '2024-01' },
];

// Calculate total industries
const totalIndustries = INDUSTRY_CATEGORIES.reduce((sum, cat) => sum + cat.industries.length, 0);

const FEATURED_COMPANIES = [
  {
    id: 1,
    name: 'Premium Roofing Co.',
    industry: 'Roofing',
    state: 'California',
    avgPrice: '$8,500 - $15,000',
    rating: 4.8,
    reviews: 342,
    verified: true,
    recentProjects: 45,
  },
  {
    id: 2,
    name: 'Pro HVAC Services',
    industry: 'HVAC',
    state: 'Texas',
    avgPrice: '$2,000 - $5,000',
    rating: 4.7,
    reviews: 287,
    verified: true,
    recentProjects: 38,
  },
  {
    id: 3,
    name: 'Reliable Plumbing',
    industry: 'Plumbing',
    state: 'New York',
    avgPrice: '$1,500 - $4,200',
    rating: 4.9,
    reviews: 521,
    verified: true,
    recentProjects: 62,
  },
  {
    id: 4,
    name: 'Expert Electrical',
    industry: 'Electrical',
    state: 'California',
    avgPrice: '$3,000 - $8,000',
    rating: 4.6,
    reviews: 198,
    verified: true,
    recentProjects: 29,
  },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('CA');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedState) params.append('state', selectedState);
    if (selectedIndustry) params.append('industry', selectedIndustry);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Real
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {' '}Business Pricing
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Compare real service prices across 50+ states, 20+ industries, and 10,000+ verified businesses.
              Data sourced from government permit records for accuracy and reliability.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-12">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-blue-400">50+</div>
                <div className="text-sm text-slate-400">States</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-cyan-400">10K+</div>
                <div className="text-sm text-slate-400">Businesses</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-purple-400">100K+</div>
                <div className="text-sm text-slate-400">Price Records</div>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Search Business or Service
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Enter business name or service type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Industry Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="">All Industries</option>
                    {INDUSTRY_CATEGORIES.map((cat) => (
                      <optgroup key={cat.category} label={cat.category}>
                        {cat.industries.map((ind) => (
                          <option key={ind.id} value={ind.id}>
                            {ind.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* State Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="">All States</option>
                    {STATE_REGIONS.map((region) => (
                      <optgroup key={region.region} label={region.region}>
                        {region.states.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-slate-600">
              Building the most reliable business price comparison and transparency platform in America
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 size={32} />,
                title: 'Verified Data',
                desc: 'Based on government permit records and actual project data, updated daily',
              },
              {
                icon: <Shield size={32} />,
                title: 'Business Transparency',
                desc: 'Company background, licenses, litigation records - all in one place',
              },
              {
                icon: <TrendingUp size={32} />,
                title: 'Price Trend Analysis',
                desc: 'Track price changes over time to find the best deals',
              },
              {
                icon: <Users size={32} />,
                title: 'Real Reviews',
                desc: 'Authentic ratings and reviews from real customers',
              },
              {
                icon: <Zap size={32} />,
                title: 'Quick Comparison',
                desc: 'Compare multiple businesses at once, save time',
              },
              {
                icon: <Crown size={32} />,
                title: 'Premium Features',
                desc: 'Unlock detailed pricing, data export, API access and more',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Browse Industries
            </h2>
            <p className="text-xl text-slate-600 mb-6">
              60+ industries covering construction, home services, automotive, professional services and more
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {FEATURED_INDUSTRIES.map((industry) => (
              <Link
                key={industry.id}
                href={`/industries/${industry.id}`}
                className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-md transition group cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                  <Building2 className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{industry.name_zh || industry.name}</h3>
                <p className="text-xs text-slate-500">{industry.company_count?.toLocaleString() ?? 0} companies</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/industries"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all {totalIndustries} industries
              <TrendingUp size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Top States */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Popular States
            </h2>
            <p className="text-xl text-slate-600">
              Latest data updated, browse business pricing by state
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TOP_STATES.map((state) => (
              <Link
                key={state.code}
                href={`/states/${state.code.toLowerCase()}`}
                className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={24} className="text-blue-600" />
                  <div>
                    <h3 className="font-bold text-slate-900">{state.name}</h3>
                    <p className="text-sm text-slate-500">{state.code}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{state.companies.toLocaleString()} businesses</p>
                <p className="text-xs text-green-600 mt-2">Updated: {state.updates}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Featured Companies
            </h2>
            <p className="text-xl text-slate-600">
              Check out the highest-rated businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_COMPANIES.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-lg">{company.name}</h3>
                    {company.verified && <Shield size={20} className="text-green-600" />}
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{company.industry}</p>

                  <div className="mb-4">
                    <p className="text-sm text-slate-500">Average Price</p>
                    <p className="text-lg font-bold text-blue-600">{company.avgPrice}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(company.rating) ? '⭐' : '☆'} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{company.rating}</span>
                  </div>

                  <p className="text-sm text-slate-500 mb-3">
                    {company.reviews} reviews • {company.recentProjects} projects
                  </p>

                  <div className="text-sm text-slate-500">{company.state}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              View All Companies
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Upgrade to Unlock All Features
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Get detailed pricing data, company background checks, price trend analysis, and make smarter business decisions
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-50 transition text-lg"
          >
            View Pricing Plans
            <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
