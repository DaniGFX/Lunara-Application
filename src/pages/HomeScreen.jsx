import React from 'react';
import { 
  Bell, 
  Sparkles, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  ShoppingBag, 
  Coffee,
  Car,
  Home,
  Receipt,
  Film,
  HeartPulse,
  Package,
  Briefcase,
  Coins,
  Laptop,
  TrendingUp,
  Gift,
  Tag
} from 'lucide-react';
import { formatPHP } from '../utils/currency';
import { roundCurrency } from '../utils/calculations';
import { getCurrentMonthKey, getCurrentMonthHeader, formatMonthLabel } from '../utils/dateUtils';

// Map icon names to clean vector icons (FontAwesome/Lucide style)
const ICON_MAP = {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Receipt,
  Film,
  HeartPulse,
  Package,
  Briefcase,
  Coins,
  Laptop,
  TrendingUp,
  Gift,
  Sparkles,
  Tag,
};

export default function HomeScreen({ 
  user,
  transactions = [], 
  onOpenAddTransaction, 
  onNavigateToTransactions 
}) {
  // Filter for active month transactions for the dashboard
  const currentMonthKey = getCurrentMonthKey();
  const currentMonthTransactions = transactions.filter(
    (t) => (t.rawDate ? t.rawDate.startsWith(currentMonthKey) : true)
  );

  const isDemo = Boolean(user?.isDemo);

  let totalIncome = 0;
  let totalExpense = 0;
  let categorySpending = [];

  if (isDemo) {
    // Baseline figures for Sofia's demo month to replicate PRD reference design
    const baseIncome = 50000;
    const baseExpenseOffset = 22550;

    const loggedIncome = currentMonthTransactions
      .filter((t) => t.type === 'income' && t.category !== 'Salary')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const loggedExpense = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    totalIncome = baseIncome + loggedIncome;
    totalExpense = baseExpenseOffset + loggedExpense;

    const categoryTotals = {
      Home: 12000,
      Food: 3700 + currentMonthTransactions.filter(t => t.category === 'Food' && t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0),
      Transport: 2450 + currentMonthTransactions.filter(t => t.category === 'Transport' && t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0),
      Shopping: 950 + currentMonthTransactions.filter(t => t.category === 'Shopping' && t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0),
      Lifestyle: 1600 + currentMonthTransactions.filter(t => t.category === 'Lifestyle' && t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0),
    };

    const maxExpenseBudget = 17000;
    categorySpending = Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount: formatPHP(amount),
      percentage: Math.min(100, Math.round((amount / maxExpenseBudget) * 100)),
    }));
  } else {
    // Real User: Dynamic calculation based solely on actual logged transactions
    totalIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    totalExpense = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const categoryMap = {};
    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + (parseFloat(t.amount) || 0);
      });

    categorySpending = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount: formatPHP(amount),
      percentage: totalExpense > 0 ? Math.min(100, Math.round((amount / totalExpense) * 100)) : 0,
    }));
  }

  const netBalance = roundCurrency(totalIncome - totalExpense);

  // Donut chart calculations
  const totalFlow = totalIncome + totalExpense;
  const incomePercent = totalFlow > 0 ? Math.round((totalIncome / totalFlow) * 100) : 0;
  const expensePercent = totalFlow > 0 ? 100 - incomePercent : 0;

  const recentTransactions = currentMonthTransactions.slice(0, 5);

  return (
    <div className="px-5 sm:px-8 pt-4 sm:pt-6 pb-28 sm:pb-32 space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <span className="text-[11px] font-bold text-[#7A7289] tracking-widest uppercase block">
            LUNARA / {getCurrentMonthHeader()}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2C1E4A] tracking-tight mt-0.5">
            Hello, {user?.name ? user.name.split(' ')[0] : 'Sofia'}
          </h1>
        </div>
        <button 
          type="button"
          aria-label="Notifications"
          onClick={() => alert('No new notifications')}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-[#EAE3FA] shadow-xs active:scale-95 transition"
        >
          <Bell className="w-5 h-5 text-[#2C1E4A]" />
        </button>
      </div>

      {/* Responsive Dashboard Grid: Stacked on Mobile, 2-Column on Tablet (Samsung Tab A9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* Left Column: Net Balance Card + Primary Action Button */}
        <div className="flex flex-col justify-between gap-5">
          {/* Net Balance Card */}
          <div className="bg-[#EAE3FA] rounded-3xl p-6 sm:p-7 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#574477]">
                Net balance this month
              </span>
              <Sparkles className="w-5 h-5 text-[#574477]" />
            </div>

            <div className="text-4xl sm:text-5xl font-black text-[#2C1E4A] my-3.5 tracking-tight">
              {formatPHP(netBalance)}
            </div>

            <div className="flex items-center gap-6 sm:gap-8 pt-1">
              {/* Income */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#9B87D4]/15 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-[#574477]" />
                </div>
                <div>
                  <span className="text-xs text-[#7A7289] block">Income</span>
                  <span className="text-base font-bold text-[#2C1E4A]">{formatPHP(totalIncome)}</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#574477]/15 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-[#574477]" />
                </div>
                <div>
                  <span className="text-xs text-[#7A7289] block">Expenses</span>
                  <span className="text-base font-bold text-[#2C1E4A]">{formatPHP(totalExpense)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button (Opens Modal) */}
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="w-full h-14 bg-[#9B87D4] hover:bg-[#8B75C7] active:scale-[0.98] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-[#9B87D4]/30 transition shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add transaction</span>
          </button>
        </div>

        {/* Right Column: Money in, Money out Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F0EBF8] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-[#2C1E4A]">
              Money in, money out
            </h2>
            <span className="text-xs font-semibold text-[#9E97A9]">
              {formatMonthLabel(currentMonthKey)}
            </span>
          </div>

          {/* Visual Donut Ring & Legend */}
          <div className="flex items-center gap-6 pb-2">
            {/* Donut Chart representation */}
            <div className="relative w-18 h-18 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background ring */}
                <path
                  className="text-[#EAE3FA]"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Income ring segment (lavender) */}
                <path
                  className="text-[#9B87D4]"
                  strokeDasharray={`${incomePercent}, 100`}
                  strokeWidth="5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Expenses ring segment (dark purple) */}
                <path
                  className="text-[#574477]"
                  strokeDasharray={`${expensePercent}, 100`}
                  strokeDashoffset={`-${incomePercent}`}
                  strokeWidth="5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9B87D4]" />
                  <span className="font-medium text-[#574477]">Income</span>
                </div>
                <span className="font-bold text-[#2C1E4A]">{formatPHP(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#574477]" />
                  <span className="font-medium text-[#574477]">Expenses</span>
                </div>
                <span className="font-bold text-[#2C1E4A]">{formatPHP(totalExpense)}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Progress Bars */}
          <div className="space-y-3 pt-1">
            {categorySpending.length === 0 ? (
              <div className="p-4 bg-[#F8F6FC] rounded-2xl text-center border border-[#F0EBF8]">
                <p className="text-xs font-semibold text-[#7A7289]">
                  No expenses logged for this month yet.
                </p>
              </div>
            ) : (
              categorySpending.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="w-18 font-medium text-[#574477] shrink-0">
                    {cat.name}
                  </span>
                  <div className="flex-1 h-2 bg-[#F0EBF8] rounded-full mx-3 overflow-hidden">
                    <div 
                      className="h-full bg-[#9B87D4] rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <span className="w-20 text-right font-bold text-[#2C1E4A] shrink-0">
                    {cat.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-[#2C1E4A]">
            Recent transactions
          </h2>
          <button 
            type="button" 
            onClick={onNavigateToTransactions}
            className="text-sm font-semibold text-[#574477] hover:text-[#9B87D4] transition"
          >
            View all
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-6 bg-white rounded-3xl border border-[#F0EBF8] text-center space-y-2">
            <p className="text-sm font-bold text-[#2C1E4A]">No transactions yet</p>
            <p className="text-xs text-[#7A7289]">
              Tap "Add transaction" above to record your first income or expense.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6 md:bg-white md:rounded-3xl md:p-5 md:border md:border-[#F0EBF8] md:shadow-xs space-y-3 md:space-y-0">
            {recentTransactions.map((tx) => {
              const TxIcon = ICON_MAP[tx.iconName] || Tag;

              return (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between py-2.5 border-b border-[#F0EBF8]/60 last:border-b-0"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#F3EEFB] flex items-center justify-center shrink-0">
                      <TxIcon className="w-5 h-5 text-[#574477] stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#2C1E4A] truncate">
                        {tx.title}
                      </h3>
                      <p className="text-xs text-[#9E97A9] mt-0.5 truncate">
                        {tx.category} · {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className={`text-sm font-black ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-[#2C1E4A]'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatPHP(tx.amount)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-[#7A7289] mt-0.5 capitalize">
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-[#7A7289]" />
                      )}
                      <span>{tx.type}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
