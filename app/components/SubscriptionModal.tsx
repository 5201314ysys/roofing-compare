'use client';

import React from 'react';
import { Lock, CheckCircle2, X, Crown, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscriptionPlans } from '../lib/utils';
import Link from 'next/link';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export function SubscriptionModal({ isOpen, onClose, feature }: SubscriptionModalProps) {
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const benefits = [
    { icon: Lock, text: 'Unlock real contractor pricing data' },
    { icon: Zap, text: 'Real-time price alerts & notifications' },
    { icon: Shield, text: 'Verified and trusted data sources' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={20} />
        </button>

        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Crown size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Unlock Premium Features
          </h2>
          <p className="text-slate-500">
            {feature 
              ? `Access ${feature} and more with a premium subscription.`
              : 'Join thousands of professionals saving money with verified pricing data.'
            }
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-4 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Pricing Preview */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-900">Pro Plan</span>
            <span className="text-sm text-slate-500 line-through">$99/mo</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">$79</span>
            <span className="text-slate-500">/month</span>
          </div>
          <p className="text-xs text-green-600 mt-1">Save 20% - Limited time offer</p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {isAuthenticated ? (
            <Link
              href="/pricing"
              className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 text-center"
              onClick={onClose}
            >
              View All Plans
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 text-center"
                onClick={onClose}
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="block w-full text-slate-600 text-sm hover:text-slate-800 font-medium text-center py-2"
                onClick={onClose}
              >
                Already have an account? Sign in
              </Link>
            </>
          )}
        </div>

        <p className="text-xs text-center text-slate-400 mt-4">
          No credit card required for free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

// Price blur display component
interface BlurredPriceProps {
  price: string;
  onUnlock: () => void;
}

export function BlurredPrice({ price, onUnlock }: BlurredPriceProps) {
  return (
    <button
      onClick={onUnlock}
      className="group relative inline-flex items-center gap-2"
    >
      <span className="blur-sm select-none text-slate-400 group-hover:blur-md transition">
        {price}
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg group-hover:scale-105 transition">
          <Lock size={12} />
          Unlock
        </span>
      </span>
    </button>
  );
}

// Locked content card
interface LockedContentCardProps {
  title: string;
  description: string;
  onUnlock: () => void;
}

export function LockedContentCard({ title, description, onUnlock }: LockedContentCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center">
            <Lock size={20} className="text-slate-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <button
          onClick={onUnlock}
          className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
        >
          <Crown size={16} />
          Upgrade to Access
        </button>
      </div>
    </div>
  );
}
