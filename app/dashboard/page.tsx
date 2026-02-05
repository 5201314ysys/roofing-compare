'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, CreditCard, History, Bookmark, Bell, Settings, 
  LogOut, Crown, Search, Building2, TrendingUp, Calendar,
  ChevronRight, Shield, AlertCircle
} from 'lucide-react';
import { Navbar, Footer } from '@/app/components/Navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

const MOCK_USER = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  subscription: 'pro',
  subscriptionExpiry: '2026-03-15',
  searchesThisMonth: 45,
  searchLimit: 1000,
  savedCompanies: 12,
  priceAlerts: 5,
};

const MOCK_SEARCH_HISTORY = [
  { id: 1, query: 'Roofing Services', state: 'CA', date: '2026-02-04', results: 342 },
  { id: 2, query: 'Premium Roofing Co', state: 'CA', date: '2026-02-03', results: 1 },
  { id: 3, query: 'HVAC Services', state: 'TX', date: '2026-02-02', results: 287 },
  { id: 4, query: 'Plumbing Services', state: 'NY', date: '2026-02-01', results: 156 },
];

const MOCK_SAVED_COMPANIES = [
  { id: 1, name: 'Premium Roofing Co.', industry: 'Roofing', state: 'CA', avgPrice: 8500, savedAt: '2026-02-03' },
  { id: 2, name: 'Pro HVAC Services', industry: 'HVAC', state: 'TX', avgPrice: 3500, savedAt: '2026-02-02' },
  { id: 3, name: 'Reliable Plumbing', industry: 'Plumbing', state: 'NY', avgPrice: 2800, savedAt: '2026-02-01' },
];

const MOCK_PRICE_ALERTS = [
  { id: 1, company: 'Premium Roofing Co.', type: 'Price Drop', threshold: '$8,000', status: 'active' },
  { id: 2, company: 'Pro HVAC Services', type: 'Price Change', threshold: '5%', status: 'active' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, subscription } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const userData = MOCK_USER;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getSubscriptionBadge = () => {
    const badges: Record<string, { label: string; color: string }> = {
      free: { label: 'Free', color: 'bg-slate-100 text-slate-700' },
      basic: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
      pro: { label: 'Pro', color: 'bg-purple-100 text-purple-700' },
      enterprise: { label: 'Enterprise', color: 'bg-orange-100 text-orange-700' },
    };
    return badges[subscription] || badges.free;
  };

  const badge = getSubscriptionBadge();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            {/* User Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                  {userData.name[0]}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{userData.name}</h2>
                  <p className="text-sm text-slate-500">{userData.email}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Crown size={14} />
                {badge.label}
              </span>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
              {[
                { id: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
                { id: 'saved', label: 'Saved Companies', icon: <Bookmark size={18} /> },
                { id: 'history', label: 'Search History', icon: <History size={18} /> },
                { id: 'alerts', label: 'Price Alerts', icon: <Bell size={18} /> },
                { id: 'subscription', label: 'Subscription', icon: <CreditCard size={18} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left transition ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 text-left text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Overview</h1>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Search className="text-blue-600 mb-3" size={24} />
                    <p className="text-2xl font-bold text-slate-900">{userData.searchesThisMonth}</p>
                    <p className="text-sm text-slate-500">Searches / {userData.searchLimit}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Bookmark className="text-purple-600 mb-3" size={24} />
                    <p className="text-2xl font-bold text-slate-900">{userData.savedCompanies}</p>
                    <p className="text-sm text-slate-500">Saved Companies</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Bell className="text-orange-600 mb-3" size={24} />
                    <p className="text-2xl font-bold text-slate-900">{userData.priceAlerts}</p>
                    <p className="text-sm text-slate-500">Price Alerts</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Calendar className="text-green-600 mb-3" size={24} />
                    <p className="text-2xl font-bold text-slate-900">42</p>
                    <p className="text-sm text-slate-500">Days Until Expiry</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/search" className="p-4 bg-slate-50 rounded-lg text-center hover:bg-slate-100 transition">
                      <Search className="mx-auto mb-2 text-blue-600" size={24} />
                      <p className="font-medium">Search Companies</p>
                    </Link>
                    <Link href="/states" className="p-4 bg-slate-50 rounded-lg text-center hover:bg-slate-100 transition">
                      <Building2 className="mx-auto mb-2 text-purple-600" size={24} />
                      <p className="font-medium">Browse States</p>
                    </Link>
                    <Link href="/transparency" className="p-4 bg-slate-50 rounded-lg text-center hover:bg-slate-100 transition">
                      <Shield className="mx-auto mb-2 text-green-600" size={24} />
                      <p className="font-medium">Background Check</p>
                    </Link>
                    <Link href="/pricing" className="p-4 bg-slate-50 rounded-lg text-center hover:bg-slate-100 transition">
                      <Crown className="mx-auto mb-2 text-orange-600" size={24} />
                      <p className="font-medium">Upgrade Plan</p>
                    </Link>
                  </div>
                </div>

                {/* Recent Searches */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Recent Searches</h2>
                    <button onClick={() => setActiveTab('history')} className="text-blue-600 text-sm">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {MOCK_SEARCH_HISTORY.slice(0, 3).map((search) => (
                      <Link
                        key={search.id}
                        href={`/search?q=${encodeURIComponent(search.query)}&state=${search.state}`}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Search className="text-slate-400" size={18} />
                          <div>
                            <p className="font-medium text-slate-900">{search.query}</p>
                            <p className="text-sm text-slate-500">{search.state} · {search.date}</p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500">{search.results} results</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Saved Companies */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Saved Companies</h1>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {MOCK_SAVED_COMPANIES.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {MOCK_SAVED_COMPANIES.map((company) => (
                        <Link
                          key={company.id}
                          href={`/companies/${company.id}`}
                          className="flex justify-between items-center p-6 hover:bg-slate-50 transition"
                        >
                          <div>
                            <h3 className="font-semibold text-slate-900">{company.name}</h3>
                            <p className="text-sm text-slate-500">{company.industry} · {company.state}</p>
                            <p className="text-xs text-slate-400 mt-1">Saved on {company.savedAt}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">${company.avgPrice.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">Avg. Price</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bookmark className="mx-auto mb-4 text-slate-300" size={48} />
                      <p className="text-slate-600">No saved companies yet</p>
                      <Link href="/companies" className="text-blue-600 mt-2 inline-block">
                        Browse Companies
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search History */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Search History</h1>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-200">
                    {MOCK_SEARCH_HISTORY.map((search) => (
                      <Link
                        key={search.id}
                        href={`/search?q=${encodeURIComponent(search.query)}&state=${search.state}`}
                        className="flex justify-between items-center p-6 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-4">
                          <Search className="text-slate-400" size={20} />
                          <div>
                            <p className="font-semibold text-slate-900">{search.query}</p>
                            <p className="text-sm text-slate-500">{search.state} · {search.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-500">{search.results} results</span>
                          <ChevronRight className="text-slate-400" size={20} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Price Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-900">Price Alerts</h1>
                  <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                    New Alert
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {MOCK_PRICE_ALERTS.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {MOCK_PRICE_ALERTS.map((alert) => (
                        <div key={alert.id} className="flex justify-between items-center p-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              alert.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              <Bell size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{alert.company}</p>
                              <p className="text-sm text-slate-500">{alert.type} · Threshold: {alert.threshold}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              alert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {alert.status === 'active' ? 'Active' : 'Paused'}
                            </span>
                            <button className="text-slate-400 hover:text-slate-600">
                              <Settings size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="mx-auto mb-4 text-slate-300" size={48} />
                      <p className="text-slate-600">No price alerts yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subscription Management */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>

                {/* Current Plan */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={24} />
                    <span className="text-xl font-bold">{badge.label}</span>
                  </div>
                  <p className="text-blue-100 mb-4">Valid until: {userData.subscriptionExpiry}</p>
                  <div className="flex gap-3">
                    <Link href="/pricing" className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition">
                      Upgrade Plan
                    </Link>
                    <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition">
                      Manage Subscription
                    </button>
                  </div>
                </div>

                {/* Usage */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Usage</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">Searches</span>
                        <span className="text-slate-900 font-medium">{userData.searchesThisMonth} / {userData.searchLimit}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(userData.searchesThisMonth / userData.searchLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">Saved Companies</span>
                        <span className="text-slate-900 font-medium">{userData.savedCompanies} / 500</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(userData.savedCompanies / 500) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Billing History</h2>
                  <div className="space-y-3">
                    {[
                      { date: '2026-02-01', amount: '$29.00', status: 'Paid' },
                      { date: '2026-01-01', amount: '$29.00', status: 'Paid' },
                      { date: '2025-12-01', amount: '$29.00', status: 'Paid' },
                    ].map((bill, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Pro Subscription</p>
                          <p className="text-sm text-slate-500">{bill.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{bill.amount}</p>
                          <span className="text-sm text-green-600">{bill.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>

                {/* Profile */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Profile</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                      <input
                        type="text"
                        defaultValue={userData.name}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={userData.email}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Notification Settings</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Price Alert Notifications', desc: 'Get notified when your price alerts are triggered' },
                      { label: 'New Company Notifications', desc: 'Get notified when new companies join industries you follow' },
                      { label: 'Weekly Reports', desc: 'Receive weekly market trends and price change reports' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
                  <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
                  <p className="text-slate-600 mb-4">Deleting your account will permanently remove all data. This action cannot be undone.</p>
                  <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
