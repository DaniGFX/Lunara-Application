import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  ShieldCheck, 
  Database, 
  LogOut, 
  Trash2, 
  ChevronRight, 
  Check, 
  Globe, 
  Sparkles, 
  Download, 
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';
import { checkSupabaseConnection } from '../services/supabaseClient';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function ProfileScreen({ user, onSignOut, onResetDemoData, onReplaySplash }) {
  const [currency] = useState('PHP (₱)');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [savingsReminders, setSavingsReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  // Modals
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Lock background scroll when any confirmation dialog is open
  useBodyScrollLock(showSignOutConfirm || showDeleteAccountConfirm || showResetConfirm);

  const handleTestDatabase = async () => {
    setIsCheckingDb(true);
    const res = await checkSupabaseConnection();
    setDbStatus(res);
    setIsCheckingDb(false);
  };

  return (
    <div className="px-5 pt-4 pb-28 space-y-5">
      {/* Top Header */}
      <div className="pt-2">
        <span className="text-[11px] font-bold text-[#7A7289] tracking-widest uppercase block">
          ACCOUNT & PREFERENCES
        </span>
        <h1 className="text-3xl font-black text-[#2C1E4A] tracking-tight mt-0.5">
          Profile & Settings
        </h1>
      </div>

      {/* User Info Card */}
      <div className="bg-[#EAE3FA] rounded-3xl p-6 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#574477] text-2xl font-black shadow-xs shrink-0 border border-purple-100 uppercase">
          {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'SR'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#2C1E4A] truncate">
              {user?.name || 'Sofia Rodriguez'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#9B87D4] text-white text-[10px] font-bold shrink-0">
              {user?.isDemo ? 'Demo Mode' : 'Personal'}
            </span>
          </div>
          <p className="text-xs text-[#574477] font-medium truncate mt-0.5">
            {user?.email || 'sofia.rodriguez@example.com'}
          </p>
          <p className="text-[11px] text-[#7A7289] font-medium mt-1">
            LUNARA Member • PHP Active
          </p>
        </div>
      </div>

      {/* Currency & Financial Preferences */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0EBF8] shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#2C1E4A] uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#9B87D4]" />
          <span>Financial Standards</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-sm font-bold text-[#2C1E4A] block">Primary Currency</span>
              <span className="text-xs text-[#7A7289]">Philippine Peso default (PRD §9.5)</span>
            </div>
            <span className="px-3 py-1 bg-[#F8F6FC] rounded-xl text-xs font-bold text-[#574477] border border-[#F0EBF8]">
              {currency}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-[#F0EBF8] pt-3">
            <div>
              <span className="text-sm font-bold text-[#2C1E4A] block">Accounting Model</span>
              <span className="text-xs text-[#7A7289]">Net Balance = Income − Expenses</span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0EBF8] shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#2C1E4A] uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#9B87D4]" />
          <span>Notifications & Alerts</span>
        </h3>

        <div className="space-y-3">
          {/* Budget Alerts */}
          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <span className="text-sm font-bold text-[#2C1E4A] block">Budget Warning Alerts</span>
              <span className="text-xs text-[#7A7289]">Notify when category spending reaches 85% or 100%</span>
            </div>
            <button
              type="button"
              onClick={() => setBudgetAlerts(!budgetAlerts)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                budgetAlerts ? 'bg-[#9B87D4]' : 'bg-[#EAE3FA]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                budgetAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Savings Reminders */}
          <div className="flex items-center justify-between py-1 border-t border-[#F0EBF8] pt-3">
            <div className="pr-4">
              <span className="text-sm font-bold text-[#2C1E4A] block">Goal Contribution Reminders</span>
              <span className="text-xs text-[#7A7289]">Gentle alerts to keep savings on target</span>
            </div>
            <button
              type="button"
              onClick={() => setSavingsReminders(!savingsReminders)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                savingsReminders ? 'bg-[#9B87D4]' : 'bg-[#EAE3FA]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                savingsReminders ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Weekly Digest */}
          <div className="flex items-center justify-between py-1 border-t border-[#F0EBF8] pt-3">
            <div className="pr-4">
              <span className="text-sm font-bold text-[#2C1E4A] block">Weekly Summary Digest</span>
              <span className="text-xs text-[#7A7289]">Review total cash flow at week end</span>
            </div>
            <button
              type="button"
              onClick={() => setWeeklyDigest(!weeklyDigest)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                weeklyDigest ? 'bg-[#9B87D4]' : 'bg-[#EAE3FA]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                weeklyDigest ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Cloud & Supabase Backend Diagnostics */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0EBF8] shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#2C1E4A] uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#9B87D4]" />
          <span>Cloud & Backend Storage</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#2C1E4A]">Backend Provider</span>
            <span className="font-bold text-[#574477]">Supabase PostgreSQL</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#2C1E4A]">Row Level Security (RLS)</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Enforced</span>
            </span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestDatabase}
              disabled={isCheckingDb}
              className="w-full py-2.5 bg-[#F8F6FC] hover:bg-[#EAE3FA] border border-[#F0EBF8] text-[#574477] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
              <span>{isCheckingDb ? 'Checking Connection...' : 'Test Supabase Connection'}</span>
            </button>

            {dbStatus && (
              <p className={`mt-2 p-2 rounded-xl text-center font-semibold ${
                dbStatus.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
              }`}>
                {dbStatus.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Data Management & Danger Zone */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0EBF8] shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-[#2C1E4A] uppercase tracking-wider">
          App & Data Management
        </h3>

        {/* Preview Splash Screen */}
        {onReplaySplash && (
          <button
            type="button"
            onClick={onReplaySplash}
            className="w-full py-3 px-3 rounded-2xl bg-[#F8F6FC] hover:bg-[#F3EEFB] text-[#574477] font-bold text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#9B87D4]" />
              <span>Preview Splash Screen</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9E97A9]" />
          </button>
        )}

        {/* Reset Demo Data */}
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3 px-3 rounded-2xl bg-[#F8F6FC] hover:bg-[#F3EEFB] text-[#574477] font-bold text-xs flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#9B87D4]" />
            <span>Reset Demo Transactions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9E97A9]" />
        </button>

        {/* Sign Out */}
        <button
          type="button"
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full py-3 px-3 rounded-2xl bg-[#F8F6FC] hover:bg-[#F3EEFB] text-[#574477] font-bold text-xs flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-[#9B87D4]" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9E97A9]" />
        </button>

        {/* Delete Account */}
        <button
          type="button"
          onClick={() => setShowDeleteAccountConfirm(true)}
          className="w-full py-3 px-3 rounded-2xl border border-rose-100 hover:bg-rose-50/60 text-rose-600 font-bold text-xs flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete Account & Records</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>

      {/* App Version Info */}
      <div className="text-center pt-2 text-[#9E97A9] text-xs space-y-1">
        <p className="font-bold text-[#574477]">LUNARA — Version 2.0</p>
        <p>Your Money, Your Universe</p>
      </div>

      {/* Sign Out Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-[#2C1E4A] text-center">
              Sign Out?
            </h3>
            <p className="text-xs text-[#7A7289] text-center">
              Are you sure you want to sign out from Sofia's account on this device?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F8F6FC] font-bold text-xs text-[#574477]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutConfirm(false);
                  onSignOut?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#9B87D4] text-white font-bold text-xs shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-rose-600 text-center">
              Delete Account & Records?
            </h3>
            <p className="text-xs text-[#7A7289] text-center">
              According to LUNARA PRD §10, deleting your account will permanently purge all your income, expenses, budgets, and savings goals from our database. This action cannot be reversed.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F8F6FC] font-bold text-xs text-[#574477]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountConfirm(false);
                  onSignOut?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-xs"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-[#2C1E4A] text-center">
              Reset Demo Transactions?
            </h3>
            <p className="text-xs text-[#7A7289] text-center">
              This will restore Sofia's default demo transactions and recalculate all balance figures.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F8F6FC] font-bold text-xs text-[#574477]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetDemoData) onResetDemoData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#9B87D4] text-white font-bold text-xs shadow-xs"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
