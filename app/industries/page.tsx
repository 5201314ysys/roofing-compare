'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Building2, ChevronRight } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';
import { AuthProvider } from '../context/AuthContext';
import { industries } from '../lib/utils';

function IndustriesContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Browse by Industry</h1>
            <p className="text-xl text-slate-300">
              Explore pricing data across 12 industries. Find the best rates for your projects.
            </p>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map(industry => (
            <Link
              key={industry.id}
              href={`/industries/${industry.id}`}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{industry.icon}</div>
                <ChevronRight 
                  size={20} 
                  className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" 
                />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition">
                {industry.name}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {industry.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-slate-400">Companies</p>
                  <p className="font-semibold text-slate-900">
                    {industry.company_count?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Pricing Unit</p>
                  <p className="font-medium text-slate-600 text-sm">
                    {industry.default_price_unit}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">12</p>
              <p className="text-sm text-slate-500 mt-1">Industries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">10,284</p>
              <p className="text-sm text-slate-500 mt-1">Companies</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">542</p>
              <p className="text-sm text-slate-500 mt-1">Cities</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">15%</p>
              <p className="text-sm text-slate-500 mt-1">Avg. Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can't find your industry?
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            We're constantly adding new industries and data sources. Let us know what you need.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Request an Industry
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function IndustriesPage() {
  return (
    <AuthProvider>
      <IndustriesContent />
    </AuthProvider>
  );
}
