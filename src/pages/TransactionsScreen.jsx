import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  X, 
  Calendar, 
  Tag, 
  FileText, 
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
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { formatPHP } from '../utils/currency';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { generateMonthOptions, getCurrentMonthKey, formatMonthLabel } from '../utils/dateUtils';

// Map icon names to vector icons
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

export default function TransactionsScreen({ 
  transactions = [], 
  onDeleteTransaction, 
  onOpenAddTransaction 
}) {
  // Dynamically generate month list (current month, past months, future months, and any transaction months)
  const monthOptions = useMemo(() => generateMonthOptions(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthKey()); // Default: dynamic current month
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null); // For detail/delete modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Lock background scroll when detail modal or month picker is open
  useBodyScrollLock(Boolean(selectedTx) || isMonthPickerOpen);

  // Month navigation: previous (older) / next (newer)
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(getCurrentMonthKey());
      return;
    }
    const idx = monthOptions.findIndex(m => m.key === selectedMonth);
    // idx + 1 moves to the previous month in descending list (excluding 'all' at end)
    if (idx !== -1 && idx < monthOptions.length - 2) {
      setSelectedMonth(monthOptions[idx + 1].key);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(getCurrentMonthKey());
      return;
    }
    const idx = monthOptions.findIndex(m => m.key === selectedMonth);
    // idx - 1 moves to the next newer month
    if (idx > 0) {
      setSelectedMonth(monthOptions[idx - 1].key);
    }
  };

  // Filtered transactions by Month, Type, Category, and Search
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Month Filter
      if (selectedMonth !== 'all') {
        const txMonth = tx.rawDate ? tx.rawDate.slice(0, 7) : '2026-11';
        if (txMonth !== selectedMonth) return false;
      }

      // 2. Type Filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      
      // 3. Category Filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

      // 4. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = tx.title?.toLowerCase().includes(query);
        const catMatch = tx.category?.toLowerCase().includes(query);
        return titleMatch || catMatch;
      }

      return true;
    });
  }, [transactions, selectedMonth, typeFilter, selectedCategory, searchQuery]);

  // Extract unique categories available in the selected month
  const availableCategories = useMemo(() => {
    const relevant = selectedMonth === 'all' 
      ? transactions 
      : transactions.filter(t => (t.rawDate ? t.rawDate.slice(0, 7) : '2026-11') === selectedMonth);
    const cats = new Set(relevant.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [transactions, selectedMonth]);

  // Totals for the current filtered month/view
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const filteredExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const netCashFlow = filteredIncome - filteredExpenses;

  const currentMonthLabel = monthOptions.find(m => m.key === selectedMonth)?.label || formatMonthLabel(selectedMonth);

  const handleDelete = () => {
    if (selectedTx) {
      onDeleteTransaction(selectedTx.id);
      setSelectedTx(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="px-5 pt-4 pb-28 space-y-4">
      {/* Top Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <span className="text-[11px] font-bold text-[#7A7289] tracking-widest uppercase block">
            HISTORY & RECORDS
          </span>
          <h1 className="text-3xl font-black text-[#2C1E4A] tracking-tight mt-0.5">
            Transactions
          </h1>
        </div>
        <button
          type="button"
          onClick={onOpenAddTransaction}
          className="h-10 px-3.5 bg-[#9B87D4] hover:bg-[#8B75C7] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white rounded-2xl p-2 border border-[#F0EBF8] shadow-xs flex items-center justify-between">
        <button
          type="button"
          title="Previous Month"
          onClick={handlePrevMonth}
          className="w-9 h-9 rounded-xl hover:bg-[#F3EEFB] text-[#574477] flex items-center justify-center transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsMonthPickerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F8F6FC] transition"
        >
          <Calendar className="w-4 h-4 text-[#9B87D4]" />
          <span className="text-sm font-extrabold text-[#2C1E4A]">
            {currentMonthLabel}
          </span>
          <span className="text-[10px] bg-[#EAE3FA] text-[#574477] font-bold px-2 py-0.5 rounded-full">
            Change
          </span>
        </button>

        <button
          type="button"
          title="Next Month"
          onClick={handleNextMonth}
          className="w-9 h-9 rounded-xl hover:bg-[#F3EEFB] text-[#574477] flex items-center justify-center transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Card for Selected Month */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0EBF8] shadow-xs flex justify-between items-center">
        <div>
          <span className="text-[11px] font-semibold text-[#7A7289] block">Total In</span>
          <span className="text-sm font-black text-emerald-600">+{formatPHP(filteredIncome)}</span>
        </div>
        <div className="h-8 w-px bg-[#F0EBF8]" />
        <div>
          <span className="text-[11px] font-semibold text-[#7A7289] block">Total Out</span>
          <span className="text-sm font-black text-rose-500">-{formatPHP(filteredExpenses)}</span>
        </div>
        <div className="h-8 w-px bg-[#F0EBF8]" />
        <div>
          <span className="text-[11px] font-semibold text-[#7A7289] block">Net Flow</span>
          <span className={`text-sm font-black ${
            netCashFlow >= 0 ? 'text-[#2C1E4A]' : 'text-rose-500'
          }`}>
            {formatPHP(netCashFlow)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[#7A7289]" />
        <input
          type="text"
          placeholder={`Search ${currentMonthLabel} records...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white rounded-2xl border border-[#F0EBF8] focus:border-[#9B87D4] text-sm font-medium text-[#2C1E4A] outline-none transition placeholder:text-[#9E97A9] shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-[#7A7289] hover:text-[#2C1E4A]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs: All | Expenses | Income */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            typeFilter === 'all'
              ? 'bg-[#2C1E4A] text-white shadow-xs'
              : 'bg-white border border-[#F0EBF8] text-[#574477] hover:bg-[#F3EEFB]'
          }`}
        >
          All ({filteredTransactions.length})
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('expense')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            typeFilter === 'expense'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white border border-[#F0EBF8] text-rose-500 hover:bg-rose-50'
          }`}
        >
          Expenses
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('income')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            typeFilter === 'income'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-[#F0EBF8] text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          Income
        </button>
      </div>

      {/* Category Horizontal Filter Pills */}
      {availableCategories.length > 2 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-5 px-5">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#9B87D4] text-white'
                  : 'bg-white border border-[#F0EBF8] text-[#7A7289] hover:text-[#2C1E4A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-3xl p-4 border border-[#F0EBF8] shadow-xs space-y-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#EAE3FA] flex items-center justify-center text-[#574477] mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#2C1E4A]">No transactions in {currentMonthLabel}</p>
            <p className="text-xs text-[#7A7289]">
              {searchQuery || typeFilter !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search filters'
                : 'Tap + Add to record income or expenses for this month'}
            </p>
            {(searchQuery || typeFilter !== 'all' || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs font-bold text-[#9B87D4] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const TxIcon = ICON_MAP[tx.iconName] || Tag;

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="flex items-center justify-between py-3 border-b border-[#F0EBF8] last:border-b-0 cursor-pointer active:bg-[#F8F6FC] rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
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
          })
        )}
      </div>

      {/* Month Selection Modal */}
      {isMonthPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsMonthPickerOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-[#2C1E4A]">
                Select Reporting Month
              </h3>
              <button
                type="button"
                onClick={() => setIsMonthPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F6FC] hover:bg-[#EAE3FA] text-[#574477] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
              {monthOptions.map((opt) => {
                const isSelected = selectedMonth === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(opt.key);
                      setIsMonthPickerOpen(false);
                    }}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#EAE3FA] text-[#2C1E4A] border border-[#9B87D4]'
                        : 'bg-[#F8F6FC] hover:bg-[#F3EEFB] text-[#574477] border border-transparent'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#9B87D4]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail & Delete Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setSelectedTx(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#2C1E4A]">
                Transaction Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-9 h-9 rounded-full bg-[#F8F6FC] hover:bg-[#EAE3FA] text-[#574477] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="bg-[#EAE3FA]/60 rounded-2xl p-5 text-center">
              <span className="text-xs font-bold text-[#574477] uppercase tracking-wider block">
                {selectedTx.type === 'income' ? 'Income Amount' : 'Expense Amount'}
              </span>
              <div className={`text-3xl font-black mt-1 ${
                selectedTx.type === 'income' ? 'text-emerald-600' : 'text-[#2C1E4A]'
              }`}>
                {selectedTx.type === 'income' ? '+' : '-'}{formatPHP(selectedTx.amount)}
              </div>
            </div>

            {/* Info Items */}
            <div className="space-y-3 bg-[#F8F6FC] rounded-2xl p-4 border border-[#F0EBF8] text-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[#7A7289]">Description</span>
                <span className="font-bold text-[#2C1E4A]">{selectedTx.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[#7A7289]">Category</span>
                <span className="font-bold text-[#2C1E4A]">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[#7A7289]">Date</span>
                <span className="font-bold text-[#2C1E4A]">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[#7A7289]">Type</span>
                <span className="font-bold text-[#2C1E4A] capitalize">{selectedTx.type}</span>
              </div>
            </div>

            {/* Delete Confirmation prompt or button */}
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full h-12 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Transaction</span>
              </button>
            ) : (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
                <p className="text-xs font-bold text-rose-700 text-center">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-rose-200 text-[#574477] font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
