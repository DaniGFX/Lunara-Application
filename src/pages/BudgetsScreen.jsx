import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, 
  AlertTriangle, 
  CheckCircle2, 
  Settings2, 
  Plus, 
  X, 
  Check,
  ShoppingBag, 
  Coffee, 
  Car, 
  Home, 
  Receipt, 
  Film, 
  HeartPulse, 
  Package, 
  TrendingDown, 
  Tag 
} from 'lucide-react';
import { formatPHP, parsePhilippinePesoInput } from '../utils/currency';
import { roundCurrency } from '../utils/calculations';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { getBudgetForMonth, saveBudget } from '../services/budgetService';
import { getCurrentMonthKey } from '../utils/dateUtils';

const ICON_MAP = {
  Food: Coffee,
  Home: Home,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Lifestyle: Film,
  Health: HeartPulse,
  Other: Package,
};

const DEFAULT_CATEGORY_LIMITS = {
  Home: 15000,
  Food: 8000,
  Transport: 4000,
  Shopping: 3500,
  Lifestyle: 2500,
  Bills: 5000,
  Health: 2000,
};

export default function BudgetsScreen({ transactions = [], user }) {
  const isDemo = Boolean(user?.isDemo);
  const currentMonthKey = getCurrentMonthKey();
  const [totalLimit, setTotalLimit] = useState(35000);
  const [categoryLimits, setCategoryLimits] = useState(DEFAULT_CATEGORY_LIMITS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempTotalLimit, setTempTotalLimit] = useState('35000');
  const [tempCategoryLimits, setTempCategoryLimits] = useState(DEFAULT_CATEGORY_LIMITS);

  // Lock background scroll when adjust budget modal is open
  useBodyScrollLock(isEditModalOpen);

  // Load real user's budget from Supabase
  useEffect(() => {
    if (!user || user.isDemo) return;

    getBudgetForMonth(user.id, currentMonthKey).then((res) => {
      if (res.data) {
        if (res.data.total_limit) setTotalLimit(parseFloat(res.data.total_limit));
        if (res.data.budget_categories && res.data.budget_categories.length > 0) {
          const map = {};
          res.data.budget_categories.forEach((bc) => {
            map[bc.category_name] = parseFloat(bc.limit_amount);
          });
          setCategoryLimits((prev) => ({ ...prev, ...map }));
        }
      }
    });
  }, [user, currentMonthKey]);

  // Baseline expenses offset for Sofia's demo; real users start strictly with actual logged transactions
  const baselineCategorySpent = isDemo ? {
    Home: 12000,
    Food: 3700,
    Transport: 2450,
    Shopping: 950,
    Lifestyle: 1600,
    Bills: 1850,
    Health: 0,
  } : {};

  // Calculate actual spending per category from transactions
  const categorySpending = useMemo(() => {
    const spending = { ...baselineCategorySpent };

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category;
        const amt = parseFloat(t.amount) || 0;
        spending[cat] = (spending[cat] || 0) + amt;
      });

    return spending;
  }, [transactions]);

  // Total spent across all categories
  const totalSpent = useMemo(() => {
    return roundCurrency(
      Object.values(categorySpending).reduce((sum, amt) => sum + amt, 0)
    );
  }, [categorySpending]);

  const remainingBudget = roundCurrency(totalLimit - totalSpent);
  const isOverBudget = remainingBudget < 0;
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 100;

  // Days remaining in November (30 days total)
  const daysInMonth = 30;
  const currentDay = 9;
  const daysRemaining = daysInMonth - currentDay;
  const dailyAllowance = daysRemaining > 0 && remainingBudget > 0 
    ? Math.round(remainingBudget / daysRemaining) 
    : 0;

  const handleOpenEdit = () => {
    setTempTotalLimit(totalLimit.toString());
    setTempCategoryLimits({ ...categoryLimits });
    setIsEditModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const parsedTotal = parsePhilippinePesoInput(tempTotalLimit) || totalLimit;
    if (parsedTotal > 0) {
      setTotalLimit(parsedTotal);
    }
    setCategoryLimits(tempCategoryLimits);
    setIsEditModalOpen(false);

    // Sync to Supabase
    if (user && !user.isDemo) {
      await saveBudget(user.id, currentMonthKey, parsedTotal, tempCategoryLimits);
    }
  };

  return (
    <div className="px-5 pt-4 pb-28 space-y-5">
      {/* Top Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <span className="text-[11px] font-bold text-[#7A7289] tracking-widest uppercase block">
            MONTHLY BUDGETS
          </span>
          <h1 className="text-3xl font-black text-[#2C1E4A] tracking-tight mt-0.5">
            November 2026
          </h1>
        </div>
        <button
          type="button"
          onClick={handleOpenEdit}
          className="h-10 px-3.5 bg-white hover:bg-[#EAE3FA] border border-[#EAE3FA] text-[#574477] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
        >
          <Settings2 className="w-4 h-4" />
          <span>Adjust</span>
        </button>
      </div>

      {/* Master Budget Overview Card */}
      <div className={`rounded-3xl p-6 shadow-xs border transition-all ${
        isOverBudget 
          ? 'bg-rose-50/70 border-rose-200' 
          : overallPercentage >= 85 
            ? 'bg-amber-50/70 border-amber-200' 
            : 'bg-[#EAE3FA] border-transparent'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#574477]">
              Total Monthly Budget
            </span>
            {isOverBudget && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Exceeded</span>
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-[#574477]">
            {overallPercentage}% spent
          </span>
        </div>

        {/* Big Remaining / Overspent Display */}
        <div className="my-3">
          <span className="text-xs font-medium text-[#7A7289] block">
            {isOverBudget ? 'Exceeded by' : 'Remaining budget'}
          </span>
          <div className={`text-4xl font-black tracking-tight ${
            isOverBudget ? 'text-rose-600' : 'text-[#2C1E4A]'
          }`}>
            {formatPHP(Math.abs(remainingBudget))}
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="h-3 bg-white/70 rounded-full overflow-hidden my-3 p-0.5 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget 
                ? 'bg-rose-500' 
                : overallPercentage >= 85 
                  ? 'bg-amber-500' 
                  : 'bg-[#9B87D4]'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>

        {/* Lower Row: Spent, Limit, Daily Pace */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-center">
          <div>
            <span className="text-[11px] text-[#7A7289] block">Spent</span>
            <span className="text-sm font-bold text-[#2C1E4A]">{formatPHP(totalSpent)}</span>
          </div>
          <div className="border-x border-black/5">
            <span className="text-[11px] text-[#7A7289] block">Limit</span>
            <span className="text-sm font-bold text-[#2C1E4A]">{formatPHP(totalLimit)}</span>
          </div>
          <div>
            <span className="text-[11px] text-[#7A7289] block">Daily Pace</span>
            <span className="text-sm font-bold text-emerald-700">
              {dailyAllowance > 0 ? `₱${dailyAllowance}/d` : '₱0/d'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Header */}
      <div className="flex justify-between items-center pt-1">
        <h2 className="text-lg font-extrabold text-[#2C1E4A]">
          Category Limits
        </h2>
        <span className="text-xs font-semibold text-[#9E97A9]">
          {Object.keys(categoryLimits).length} categories
        </span>
      </div>

      {/* Category Budget Cards */}
      <div className="space-y-3">
        {Object.entries(categoryLimits).map(([categoryName, limit]) => {
          const spent = categorySpending[categoryName] || 0;
          const remaining = limit - spent;
          const isCategoryOver = remaining < 0;
          const percent = limit > 0 ? Math.round((spent / limit) * 100) : 100;
          const CategoryIcon = ICON_MAP[categoryName] || Tag;

          return (
            <div
              key={categoryName}
              className="bg-white rounded-2xl p-4 border border-[#F0EBF8] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F3EEFB] flex items-center justify-center shrink-0">
                    <CategoryIcon className="w-5 h-5 text-[#574477]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2C1E4A]">{categoryName}</h3>
                    <p className="text-xs text-[#9E97A9]">
                      {formatPHP(spent)} of {formatPHP(limit)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-bold ${
                    isCategoryOver ? 'text-rose-600' : 'text-[#574477]'
                  }`}>
                    {isCategoryOver ? `Exceeded ${formatPHP(Math.abs(remaining))}` : `${formatPHP(remaining)} left`}
                  </div>
                  <span className="text-[11px] font-semibold text-[#9E97A9]">
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-[#F0EBF8] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCategoryOver
                      ? 'bg-rose-500'
                      : percent >= 85
                        ? 'bg-amber-500'
                        : 'bg-[#9B87D4]'
                  }`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Budget Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsEditModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 max-h-[88vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#2C1E4A]">
                Adjust Monthly Budget
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F8F6FC] hover:bg-[#EAE3FA] text-[#574477] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {/* Total Monthly Limit */}
              <div>
                <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
                  Overall Monthly Spending Cap
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xl font-black text-[#574477]">
                    ₱
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={tempTotalLimit}
                    onChange={(e) => setTempTotalLimit(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-[#F8F6FC] focus:bg-white rounded-2xl border border-[#F0EBF8] focus:border-[#9B87D4] text-xl font-black text-[#2C1E4A] outline-none transition"
                  />
                </div>
              </div>

              {/* Individual Category Limits */}
              <div>
                <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-2">
                  Category Limits
                </label>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {Object.entries(tempCategoryLimits).map(([catName, limit]) => (
                    <div key={catName} className="flex items-center justify-between gap-3 bg-[#F8F6FC] p-2.5 rounded-2xl border border-[#F0EBF8]">
                      <span className="text-xs font-bold text-[#2C1E4A] w-24 truncate">
                        {catName}
                      </span>
                      <div className="relative flex items-center flex-1 max-w-[140px]">
                        <span className="absolute left-3 text-xs font-black text-[#574477]">
                          ₱
                        </span>
                        <input
                          type="number"
                          value={limit}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTempCategoryLimits((prev) => ({
                              ...prev,
                              [catName]: val,
                            }));
                          }}
                          className="w-full pl-6 pr-2 py-1.5 bg-white rounded-xl border border-[#F0EBF8] focus:border-[#9B87D4] text-xs font-bold text-[#2C1E4A] outline-none text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-13 bg-[#9B87D4] hover:bg-[#8B75C7] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
