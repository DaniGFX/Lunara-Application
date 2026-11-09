import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  Check, 
  ArrowDownLeft, 
  ArrowUpRight,
  Coffee, 
  Car, 
  Home, 
  ShoppingBag, 
  Receipt, 
  Film, 
  HeartPulse, 
  Package, 
  Briefcase, 
  Coins, 
  Laptop, 
  TrendingUp, 
  Gift, 
  Sparkles 
} from 'lucide-react';
import { parsePhilippinePesoInput } from '../utils/currency';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', iconName: 'Coffee', Icon: Coffee },
  { id: 'transport', name: 'Transport', iconName: 'Car', Icon: Car },
  { id: 'home', name: 'Home', iconName: 'Home', Icon: Home },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', Icon: ShoppingBag },
  { id: 'bills', name: 'Bills', iconName: 'Receipt', Icon: Receipt },
  { id: 'lifestyle', name: 'Lifestyle', iconName: 'Film', Icon: Film },
  { id: 'health', name: 'Health', iconName: 'HeartPulse', Icon: HeartPulse },
  { id: 'other', name: 'Other', iconName: 'Package', Icon: Package },
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', iconName: 'Briefcase', Icon: Briefcase },
  { id: 'allowance', name: 'Allowance', iconName: 'Coins', Icon: Coins },
  { id: 'freelance', name: 'Freelance', iconName: 'Laptop', Icon: Laptop },
  { id: 'investment', name: 'Investment', iconName: 'TrendingUp', Icon: TrendingUp },
  { id: 'gift', name: 'Gift', iconName: 'Gift', Icon: Gift },
  { id: 'other', name: 'Other', iconName: 'Sparkles', Icon: Sparkles },
];

export default function AddTransactionModal({ isOpen, onClose, onAddTransaction }) {
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Lock background scroll when modal is visible
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType) => {
    setType(newType);
    setSelectedCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parsePhilippinePesoInput(amountStr);

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount greater than ₱0');
      return;
    }

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      title: note.trim() || `${selectedCategory.name} ${type === 'income' ? 'Income' : 'Expense'}`,
      category: selectedCategory.name,
      amount: amount,
      type: type, // 'expense' | 'income'
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rawDate: date,
      iconName: selectedCategory.iconName,
    };

    onAddTransaction(newTransaction);
    handleClose();
  };

  const handleClose = () => {
    setAmountStr('');
    setNote('');
    setError('');
    setType('expense');
    setSelectedCategory(EXPENSE_CATEGORIES[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300">
        
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-[#EAE3FA] rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

        {/* Modal Header */}
        <div className="flex justify-between items-center pb-1">
          <h2 className="text-xl font-extrabold text-[#2C1E4A]">
            Add Transaction
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[#F8F6FC] hover:bg-[#EAE3FA] text-[#574477] flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense vs Income Toggle */}
        <div className="flex p-1 bg-[#F8F6FC] rounded-2xl border border-[#F0EBF8]">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
              type === 'expense'
                ? 'bg-white text-rose-500 shadow-xs'
                : 'text-[#7A7289] hover:text-[#2C1E4A]'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
              type === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-[#7A7289] hover:text-[#2C1E4A]'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
              Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-black text-[#574477]">
                ₱
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                className="w-full pl-10 pr-4 py-3.5 bg-[#F8F6FC] focus:bg-white rounded-2xl border-2 border-transparent focus:border-[#9B87D4] text-3xl font-black text-[#2C1E4A] outline-none transition"
              />
            </div>
            {error && (
              <p className="text-xs font-semibold text-rose-500 mt-1.5 pl-1">
                {error}
              </p>
            )}
          </div>

          {/* Category Selector Chips with Vector Icons */}
          <div>
            <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                const CategoryIcon = cat.Icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-[#EAE3FA] border-[#9B87D4] shadow-xs'
                        : 'bg-[#F8F6FC] border-[#F0EBF8] hover:bg-[#F3EEFB]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
                      isSelected ? 'bg-white text-[#9B87D4]' : 'bg-[#EAE3FA]/60 text-[#574477]'
                    }`}>
                      <CategoryIcon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className={`text-[11px] font-semibold truncate w-full text-center ${
                      isSelected ? 'text-[#2C1E4A]' : 'text-[#574477]'
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-4 w-4 h-4 text-[#7A7289]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8F6FC] focus:bg-white rounded-2xl border border-[#F0EBF8] focus:border-[#9B87D4] text-sm font-semibold text-[#2C1E4A] outline-none transition"
              />
            </div>
          </div>

          {/* Note / Description Input */}
          <div>
            <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <div className="relative flex items-center">
              <FileText className="absolute left-4 w-4 h-4 text-[#7A7289]" />
              <input
                type="text"
                placeholder="e.g. Weekly groceries, Coffee with Mia"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={60}
                className="w-full pl-11 pr-4 py-3 bg-[#F8F6FC] focus:bg-white rounded-2xl border border-[#F0EBF8] focus:border-[#9B87D4] text-sm font-medium text-[#2C1E4A] outline-none transition placeholder:text-[#9E97A9]"
              />
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-14 bg-[#9B87D4] hover:bg-[#8B75C7] active:scale-[0.98] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-[#9B87D4]/30 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Save Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
