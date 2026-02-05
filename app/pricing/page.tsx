'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Crown, ArrowRight } from 'lucide-react';
import { Navbar, Footer } from '../components/Navigation';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { subscriptionPlans } from '../lib/utils';

function PricingContent() {
  const { isAuthenticated, subscription, updateSubscription } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (basePrice: number) => {
    if (billingPeriod === 'yearly') {
      return Math.round(basePrice * 12 * 0.8); // 20% discount for yearly
    }
    return basePrice;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-200 text-sm font-semibold px-5 py-2.5 rounded-full mb-8 border border-blue-400/30">
            <Crown size={16} className="text-blue-300" />
            Save 20% with annual billing
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Choose the plan that fits your needs. Start with a free trial, upgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-slate-700 rounded-xl p-2 border border-slate-500 shadow-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              style={{ color: billingPeriod === 'monthly' ? undefined : '#ffffff' }}
              className={`px-8 py-3 rounded-lg text-base font-bold transition-all ${
                billingPeriod === 'monthly' 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'hover:bg-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              style={{ color: billingPeriod === 'yearly' ? undefined : '#ffffff' }}
              className={`px-8 py-3 rounded-lg text-base font-bold transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly' 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'hover:bg-slate-600'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {subscriptionPlans.map((plan, index) => {
            const isPopular = plan.id === 'pro';
            const isCurrent = subscription === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col transition-all hover:shadow-2xl ${
                  isPopular 
                    ? 'border-blue-500 shadow-xl shadow-blue-500/20 scale-105' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-8 mt-2">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold text-slate-900">
                      ${getPrice(plan.price_monthly)}
                    </span>
                    <span className="text-slate-600 font-medium">
                      /{billingPeriod === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.price_monthly > 0 && (
                    <p className="text-sm text-green-600 font-semibold">
                      Save ${Math.round(plan.price_monthly * 12 * 0.2)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-4 px-6 rounded-xl bg-gray-100 text-gray-500 font-bold text-base cursor-not-allowed border-2 border-gray-200"
                  >
                    Current Plan
                  </button>
                ) : (
                  <Link
                    href={isAuthenticated ? '#' : '/signup'}
                    onClick={() => isAuthenticated && updateSubscription(plan.id)}
                    style={{ color: 'white' }}
                    className={`block w-full py-4 px-6 rounded-xl font-bold text-base text-center transition-all ${
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50'
                        : 'bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {plan.price_monthly === 0 ? 'Get Started Free' : 'Start Free Trial'}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-center mb-12">
            Everything you need to know about our pricing and plans
          </p>

          <div className="space-y-5">
            {[
              {
                q: 'Can I switch plans at any time?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate your billing.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all paid plans include a 7-day free trial. No credit card required to start.',
              },
              {
                q: 'Where does your pricing data come from?',
                a: 'Our data is sourced from verified permit records, government databases, and direct contractor submissions. We update our database daily.',
              },
              {
                q: 'Can I export my data?',
                a: 'Pro and Enterprise plans include data export capabilities. You can export to CSV, Excel, or access our API.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-7 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <h3 className="font-bold text-slate-900 mb-3 text-base">{faq.q}</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start saving?</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who trust PriceCompare Pro.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
          >
            Start Your Free Trial
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <AuthProvider>
      <PricingContent />
    </AuthProvider>
  );
}
