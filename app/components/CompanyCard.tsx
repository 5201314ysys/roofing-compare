'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  MapPin,
  Phone,
  ExternalLink,
  Shield,
  Clock,
  Briefcase,
  Lock
} from 'lucide-react';
import { Company } from '../types';
import { useAuth } from '../context/AuthContext';
import { BlurredPrice } from './SubscriptionModal';
import { calculateSavings, cn } from '../lib/utils';
import Link from 'next/link';

interface CompanyCardProps {
  company: Company;
  onUnlockClick: () => void;
  showDetails?: boolean;
}

export function CompanyCard({ company, onUnlockClick, showDetails = false }: CompanyCardProps) {
  const { canUnlockPrices } = useAuth();
  const savings = calculateSavings(company.avgQuote, company.contractorPrice);
  const isUnlocked = canUnlockPrices();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all group">
      <div className="flex items-start gap-4">
        {/* Company Initial/Avatar */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl",
          "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600",
          "group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600 transition-all"
        )}>
          {company.initial}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link 
                href={`/company/${company.id}`}
                className="font-semibold text-slate-900 hover:text-blue-600 transition line-clamp-1"
              >
                {company.name}
              </Link>
              {showDetails && company.city && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin size={12} />
                  {company.city}, {company.state || 'IL'}
                </div>
              )}
            </div>
            
            {/* Verification Badge */}
            {company.isVerified !== false && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Shield size={12} />
                Verified
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-slate-500">
              <Clock size={14} />
              <span>{company.verified}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Briefcase size={14} />
              <span>{company.jobCount} jobs</span>
            </div>
            {company.rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="font-medium">{company.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Average Quote</p>
              <p className="text-lg font-semibold text-slate-900">{company.avgQuote}</p>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Contractor Price</p>
              {isUnlocked ? (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-green-600">{company.contractorPrice}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Save {savings}%
                  </span>
                </div>
              ) : (
                <BlurredPrice price={company.contractorPrice} onUnlock={onUnlockClick} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple table row version
interface CompanyTableRowProps {
  company: Company;
  onUnlockClick: () => void;
  rank?: number;
}

export function CompanyTableRow({ company, onUnlockClick, rank }: CompanyTableRowProps) {
  const { canUnlockPrices } = useAuth();
  const isUnlocked = canUnlockPrices();
  const savings = calculateSavings(company.avgQuote, company.contractorPrice);

  return (
    <tr className="hover:bg-slate-50 transition group">
      {/* Rank */}
      {rank !== undefined && (
        <td className="px-4 py-4 text-sm text-slate-400 font-medium">
          #{rank}
        </td>
      )}
      
      {/* Company */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
            {company.initial}
          </div>
          <div>
            <Link 
              href={`/company/${company.id}`}
              className="font-medium text-slate-900 hover:text-blue-600 transition"
            >
              {company.name}
            </Link>
            {company.city && (
              <p className="text-xs text-slate-500">{company.city}, {company.state || 'IL'}</p>
            )}
          </div>
        </div>
      </td>

      {/* Jobs */}
      <td className="px-4 py-4 text-sm text-slate-600">
        {company.jobCount}
      </td>

      {/* Verified */}
      <td className="px-4 py-4 text-sm text-slate-500">
        {company.verified}
      </td>

      {/* Average Quote */}
      <td className="px-4 py-4 text-sm font-medium text-slate-900 text-right">
        {company.avgQuote}
      </td>

      {/* Contractor Price */}
      <td className="px-4 py-4 text-right">
        {isUnlocked ? (
          <div className="flex items-center justify-end gap-2">
            <span className="font-semibold text-green-600">{company.contractorPrice}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              -{savings}%
            </span>
          </div>
        ) : (
          <button
            onClick={onUnlockClick}
            className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
          >
            <Lock size={12} />
            Unlock
          </button>
        )}
      </td>
    </tr>
  );
}

// Price trend indicator
interface PriceTrendProps {
  trend: number; // Positive means up, negative means down
}

export function PriceTrend({ trend }: PriceTrendProps) {
  if (trend > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm">
        <TrendingUp size={14} />
        +{trend}%
      </span>
    );
  } else if (trend < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
        <TrendingDown size={14} />
        {trend}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-slate-400 text-sm">
      <Minus size={14} />
      0%
    </span>
  );
}
