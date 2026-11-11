import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight, 
  X, 
  Check, 
  ShieldCheck, 
  Plane, 
  Laptop, 
  Home, 
  Car, 
  HeartHandshake, 
  Coins, 
  TrendingUp, 
  Tag,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { formatPHP, parsePhilippinePesoInput } from '../utils/currency';
import { roundCurrency } from '../utils/calculations';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { 
  getSavingsGoals, 
  createSavingsGoal, 
  addSavingsContribution, 
  deleteSavingsGoal 
} from '../services/savingsService';

const GOAL_ICONS = [
  { id: 'ShieldCheck', label: 'Safety', Icon: ShieldCheck },
  { id: 'Plane', label: 'Travel', Icon: Plane },
  { id: 'Laptop', label: 'Tech', Icon: Laptop },
  { id: 'Home', label: 'House', Icon: Home },
  { id: 'Car', label: 'Vehicle', Icon: Car },
  { id: 'Sprout', label: 'Growth', Icon: Sprout },
  { id: 'Coins', label: 'Wealth', Icon: Coins },
  { id: 'Sparkles', label: 'Dream', Icon: Sparkles },
];

const INITIAL_GOALS = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    targetAmount: 50000,
    currentAmount: 32500,
    targetDate: 'Dec 2026',
    iconId: 'ShieldCheck',
    color: '#9B87D4',
  },
  {
    id: 'g2',
    name: 'Japan Autumn Trip',
    targetAmount: 60000,
    currentAmount: 24000,
    targetDate: 'Oct 2027',
    iconId: 'Plane',
    color: '#BFA8F2',
  },
  {
    id: 'g3',
    name: 'New Work Laptop',
    targetAmount: 45000,
    currentAmount: 45000,
    targetDate: 'Nov 2026',
    iconId: 'Laptop',
    color: '#10B981',
  },
];

export default function SavingsScreen({ user }) {
  const isDemo = Boolean(user?.isDemo);
  const [goals, setGoals] = useState(() => (isDemo ? INITIAL_GOALS : []));
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null); // For deposit modal
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [depositError, setDepositError] = useState('');
  const [goalToDelete, setGoalToDelete] = useState(null); // For delete confirmation modal

  // Lock background scroll when any modal is active
  useBodyScrollLock(isNewGoalModalOpen || Boolean(depositGoal) || Boolean(goalToDelete));

  // Load real user's savings goals from Supabase
  useEffect(() => {
    if (!user || user.isDemo) return;

    getSavingsGoals(user.id).then((res) => {
      if (res.data) {
        setGoals(res.data);
      }
    });
  }, [user]);

  // New goal form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTargetStr, setNewGoalTargetStr] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('Sprout');
  const [newGoalError, setNewGoalError] = useState('');

  // Overall calculations
  const totalSaved = roundCurrency(goals.reduce((sum, g) => sum + g.currentAmount, 0));
  const totalTarget = roundCurrency(goals.reduce((sum, g) => sum + g.targetAmount, 0));
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const completedGoalsCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  // Add Contribution to a goal
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amount = parsePhilippinePesoInput(depositAmountStr);

    if (!amount || amount <= 0) {
      setDepositError('Please enter a valid contribution amount greater than ₱0');
      return;
    }

    const targetGoal = depositGoal;
    const newAmount = roundCurrency(targetGoal.currentAmount + amount);

    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === targetGoal.id) {
          return { ...g, currentAmount: newAmount };
        }
        return g;
      })
    );

    setDepositGoal(null);
    setDepositAmountStr('');
    setDepositError('');

    // Cloud sync to Supabase
    if (user && !user.isDemo) {
      await addSavingsContribution(user.id, targetGoal.id, amount, targetGoal.currentAmount);
    }
  };

  // Create New Goal
  const handleCreateGoalSubmit = async (e) => {
    e.preventDefault();
    const target = parsePhilippinePesoInput(newGoalTargetStr);

    if (!newGoalName.trim()) {
      setNewGoalError('Please enter a goal name');
      return;
    }

    if (!target || target <= 0) {
      setNewGoalError('Please enter a target amount greater than ₱0');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      name: newGoalName.trim(),
      targetAmount: target,
      currentAmount: 0,
      targetDate: newGoalDate.trim() || 'Flexible',
      iconId: selectedIconId,
      color: '#9B87D4',
    };

    // Optimistic update
    setGoals((prev) => [newGoal, ...prev]);
    setIsNewGoalModalOpen(false);
    setNewGoalName('');
    setNewGoalTargetStr('');
    setNewGoalDate('');
    setNewGoalError('');

    // Cloud sync to Supabase
    if (user && !user.isDemo) {
      const res = await createSavingsGoal(user.id, newGoal);
      if (res.data) {
        setGoals((prev) =>
          prev.map((g) => (g.id === newGoal.id ? { ...g, id: res.data.id } : g))
        );
      }
    }
  };

  // Confirm and delete goal
  const handleDeleteGoal = async () => {
    if (goalToDelete) {
      const idToDelete = goalToDelete.id;
      setGoals((prev) => prev.filter((g) => g.id !== idToDelete));
      setGoalToDelete(null);

      // Cloud deletion from Supabase
      if (user && !user.isDemo) {
        await deleteSavingsGoal(user.id, idToDelete);
      }
    }
  };

  return (
    <div className="px-5 sm:px-8 pt-4 sm:pt-6 pb-28 sm:pb-32 space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <span className="text-[11px] font-bold text-[#7A7289] tracking-widest uppercase block">
            SAVINGS & TARGETS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2C1E4A] tracking-tight mt-0.5">
            Savings Goals
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsNewGoalModalOpen(true)}
          className="h-10 sm:h-11 px-3.5 sm:px-5 bg-[#9B87D4] hover:bg-[#8B75C7] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Master Savings Summary Card */}
      <div className="bg-[#EAE3FA] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#574477]">
            Total Saved Across Goals
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-[#574477] text-xs font-bold">
            {completedGoalsCount} of {goals.length} Completed
          </span>
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-black text-[#2C1E4A] tracking-tight">
            {formatPHP(totalSaved)}
          </div>
          <p className="text-xs font-semibold text-[#7A7289] mt-1">
            of {formatPHP(totalTarget)} total milestone target
          </p>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-[#574477]">
            <span>Milestone Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-3 bg-white/70 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-[#9B87D4] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>

        {/* Accounting Rule Tip Banner */}
        <div className="bg-white/60 rounded-2xl p-3 border border-purple-100 flex items-center gap-2.5 text-xs text-[#574477]">
          <Sparkles className="w-4 h-4 text-[#9B87D4] shrink-0" />
          <span>
            Savings contributions are allocations of your balance toward milestones, not expenses!
          </span>
        </div>
      </div>

      {/* Active Goals Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pt-1">
          <h2 className="text-lg font-extrabold text-[#2C1E4A]">
            Your Goals
          </h2>
          <span className="text-xs font-semibold text-[#9E97A9]">
            {goals.length} targets
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-[#F0EBF8] text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#EAE3FA] flex items-center justify-center text-[#574477] mx-auto">
              <Sprout className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#2C1E4A]">No savings goals yet</h3>
            <p className="text-xs text-[#7A7289] max-w-xs mx-auto">
              Set your first savings goal, like an Emergency Fund or Travel Target, to start tracking progress.
            </p>
            <button
              type="button"
              onClick={() => setIsNewGoalModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#9B87D4] text-white text-xs font-bold shadow-xs hover:bg-[#8B75C7] transition"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {goals.map((goal) => {
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 100;
            const IconDef = GOAL_ICONS.find(i => i.id === goal.iconId) || GOAL_ICONS[0];
            const GoalIcon = IconDef.Icon;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                  isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#F0EBF8]'
                }`}
              >
                {/* Top row: Icon, Name, Target Date, Progress % and Delete Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F3EEFB] text-[#574477]'
                    }`}>
                      <GoalIcon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#2C1E4A] truncate">{goal.name}</h3>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase flex items-center gap-0.5 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Reached</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#9E97A9] mt-0.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Target: {goal.targetDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress % and Delete Button */}
                  <div className="flex items-center gap-2.5 shrink-0 pl-2">
                    <span className={`text-base font-black ${
                      isCompleted ? 'text-emerald-600' : 'text-[#2C1E4A]'
                    }`}>
                      {percent}%
                    </span>
                    <button
                      type="button"
                      title="Delete Goal"
                      onClick={() => setGoalToDelete(goal)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#9E97A9] hover:text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-[#F0EBF8] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-[#9B87D4]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#2C1E4A]">{formatPHP(goal.currentAmount)}</span>
                    <span className="text-[#7A7289]">Goal: {formatPHP(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Action Button: Add Contribution */}
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDepositGoal(goal);
                      setDepositAmountStr('');
                      setDepositError('');
                    }}
                    className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      isCompleted 
                        ? 'bg-[#F8F6FC] hover:bg-[#EAE3FA] text-[#574477] border border-[#F0EBF8]'
                        : 'bg-[#9B87D4] hover:bg-[#8B75C7] text-white shadow-xs'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isCompleted ? 'Add More Savings' : 'Add Contribution'}</span>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Delete Goal Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setGoalToDelete(null)} />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 border border-rose-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-[#2C1E4A]">
                Delete Savings Goal?
              </h3>
              <p className="text-xs text-[#7A7289]">
                Are you sure you want to remove <strong className="text-[#2C1E4A]">"{goalToDelete.name}"</strong>?
              </p>
              {goalToDelete.currentAmount > 0 && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl mt-2">
                  You currently have {formatPHP(goalToDelete.currentAmount)} saved towards this goal.
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGoalToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#F8F6FC] hover:bg-[#EAE3FA] font-bold text-xs text-[#574477] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGoal}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contribution Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setDepositGoal(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#7A7289] uppercase tracking-wider block">
                  Add Contribution
                </span>
                <h2 className="text-xl font-extrabold text-[#2C1E4A] mt-0.5">
                  {depositGoal.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDepositGoal(null)}
                className="w-9 h-9 rounded-full bg-[#F8F6FC] hover:bg-[#EAE3FA] text-[#574477] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current saved info */}
            <div className="bg-[#EAE3FA]/60 rounded-2xl p-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-[#7A7289] block">Current Saved</span>
                <span className="font-bold text-[#2C1E4A] text-sm">{formatPHP(depositGoal.currentAmount)}</span>
              </div>
              <div className="text-right">
                <span className="text-[#7A7289] block">Goal Target</span>
                <span className="font-bold text-[#2C1E4A] text-sm">{formatPHP(depositGoal.targetAmount)}</span>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
                  Contribution Amount
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-black text-[#574477]">
                    ₱
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={depositAmountStr}
                    onChange={(e) => {
                      setDepositAmountStr(e.target.value);
                      if (depositError) setDepositError('');
                    }}
                    autoFocus
                    className="w-full pl-10 pr-4 py-3.5 bg-[#F8F6FC] focus:bg-white rounded-2xl border-2 border-transparent focus:border-[#9B87D4] text-3xl font-black text-[#2C1E4A] outline-none transition"
                  />
                </div>
                {depositError && (
                  <p className="text-xs font-semibold text-rose-500 mt-1.5 pl-1">
                    {depositError}
                  </p>
                )}
              </div>

              {/* Quick shortcut chips */}
              <div className="flex gap-2">
                {[500, 1000, 2500, 5000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => {
                      setDepositAmountStr(quickAmt.toString());
                      setDepositError('');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-[#F8F6FC] hover:bg-[#EAE3FA] border border-[#F0EBF8] text-xs font-bold text-[#574477] transition"
                  >
                    +₱{quickAmt}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-14 bg-[#9B87D4] hover:bg-[#8B75C7] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>Confirm Contribution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsNewGoalModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#2C1E4A]">
                Create Savings Goal
              </h2>
              <button
                type="button"
                onClick={() => setIsNewGoalModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F8F6FC] hover:bg-[#EAE3FA] text-[#574477] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dream Vacation, New Phone"
                  value={newGoalName}
                  onChange={(e) => {
                    setNewGoalName(e.target.value);
                    if (newGoalError) setNewGoalError('');
                  }}
                  className="w-full px-4 py-3 bg-[#F8F6FC] focus:bg-white rounded-2xl border border-[#F0EBF8] focus:border-[#9B87D4] text-sm font-semibold text-[#2C1E4A] outline-none transition"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
                  Target Amount
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xl font-black text-[#574477]">
                    ₱
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="50,000"
                    value={newGoalTargetStr}
                    onChange={(e) => {
                      setNewGoalTargetStr(e.target.value);
                      if (newGoalError) setNewGoalError('');
                    }}
                    className="w-full pl-9 pr-4 py-3 bg-[#F8F6FC] focus:bg-white rounded-2xl border border-[#F0EBF8] focus:border-[#9B87D4] text-xl font-black text-[#2C1E4A] outline-none transition"
                  />
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-1.5">
                  Target Date (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dec 2026, Summer 2027"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F6FC] focus:bg-white rounded-2xl border border-[#F0EBF8] focus:border-[#9B87D4] text-sm font-semibold text-[#2C1E4A] outline-none transition"
                />
              </div>

              {/* Icon Choice */}
              <div>
                <label className="block text-xs font-bold text-[#7A7289] uppercase tracking-wider mb-2">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {GOAL_ICONS.map((item) => {
                    const isSelected = selectedIconId === item.id;
                    const ItemIcon = item.Icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIconId(item.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-[#EAE3FA] border-[#9B87D4] shadow-xs'
                            : 'bg-[#F8F6FC] border-[#F0EBF8] hover:bg-[#F3EEFB]'
                        }`}
                      >
                        <ItemIcon className="w-5 h-5 text-[#574477] mb-1" />
                        <span className="text-[10px] font-semibold text-[#574477]">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {newGoalError && (
                <p className="text-xs font-semibold text-rose-500 pl-1">
                  {newGoalError}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-14 bg-[#9B87D4] hover:bg-[#8B75C7] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>Create Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
