import React, { useState } from 'react';
import HomeScreen from './pages/HomeScreen';
import TransactionsScreen from './pages/TransactionsScreen';
import BudgetsScreen from './pages/BudgetsScreen';
import SavingsScreen from './pages/SavingsScreen';
import ProfileScreen from './pages/ProfileScreen';
import AuthScreen from './pages/AuthScreen';
import AddTransactionModal from './components/AddTransactionModal';
import SplashScreen from './components/SplashScreen';
import { getSavedSession, signOut as authSignOut } from './services/authService';
import { 
  Home, 
  ArrowLeftRight, 
  PieChart, 
  Sprout, 
  User 
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  // November 2026 Transactions
  {
    id: '1',
    title: 'Weekly groceries',
    category: 'Food',
    amount: 1850,
    type: 'expense',
    date: 'Nov 9',
    rawDate: '2026-11-09',
    iconName: 'ShoppingBag',
  },
  {
    id: '2',
    title: 'Coffee with Mia',
    category: 'Food',
    amount: 250,
    type: 'expense',
    date: 'Nov 8',
    rawDate: '2026-11-08',
    iconName: 'Coffee',
  },
  {
    id: '3',
    title: 'Monthly Salary',
    category: 'Salary',
    amount: 50000,
    type: 'income',
    date: 'Nov 1',
    rawDate: '2026-11-01',
    iconName: 'Briefcase',
  },

  // October 2026 Transactions
  {
    id: '4',
    title: 'Electricity & Water Bill',
    category: 'Bills',
    amount: 3850,
    type: 'expense',
    date: 'Oct 28',
    rawDate: '2026-10-28',
    iconName: 'Receipt',
  },
  {
    id: '5',
    title: 'Weekend Dining & Treats',
    category: 'Food',
    amount: 1600,
    type: 'expense',
    date: 'Oct 20',
    rawDate: '2026-10-20',
    iconName: 'Coffee',
  },
  {
    id: '6',
    title: 'Freelance Design Project',
    category: 'Freelance',
    amount: 15000,
    type: 'income',
    date: 'Oct 15',
    rawDate: '2026-10-15',
    iconName: 'Laptop',
  },
  {
    id: '7',
    title: 'October Salary',
    category: 'Salary',
    amount: 50000,
    type: 'income',
    date: 'Oct 1',
    rawDate: '2026-10-01',
    iconName: 'Briefcase',
  },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => getSavedSession());
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState(() => {
    const session = getSavedSession();
    return session?.isDemo ? INITIAL_TRANSACTIONS : [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user?.isDemo) {
      setTransactions(INITIAL_TRANSACTIONS);
    } else {
      setTransactions([]);
    }
  };

  const handleSignOut = async () => {
    await authSignOut();
    setCurrentUser(null);
  };

  const navItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'transactions', label: 'Transactions', Icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', Icon: PieChart },
    { id: 'savings', label: 'Savings', Icon: Sprout },
    { id: 'profile', label: 'Profile', Icon: User },
  ];

  const handleAddTransaction = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (txId) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  const handleResetDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
  };

  return (
    <div className="min-h-screen bg-[#F0EBF8] flex justify-center items-start">
      {/* Mobile Screen Container Frame */}
      <div className="w-full max-w-md min-h-screen bg-[#F8F6FC] shadow-xl relative flex flex-col overflow-x-hidden">
        {/* If user is not authenticated, render Login / Sign Up */}
        {!currentUser ? (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            {/* Main Content Area */}
            <main className="flex-1">
              {activeTab === 'home' && (
                <HomeScreen 
                  user={currentUser}
                  transactions={transactions}
                  onOpenAddTransaction={() => setIsAddModalOpen(true)}
                  onNavigateToTransactions={() => setActiveTab('transactions')}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsScreen 
                  transactions={transactions}
                  onDeleteTransaction={handleDeleteTransaction}
                  onOpenAddTransaction={() => setIsAddModalOpen(true)}
                />
              )}

              {activeTab === 'budgets' && (
                <BudgetsScreen 
                  user={currentUser}
                  transactions={transactions}
                />
              )}

              {activeTab === 'savings' && (
                <SavingsScreen user={currentUser} />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen 
                  user={currentUser}
                  onSignOut={handleSignOut}
                  onResetDemoData={handleResetDemoData}
                  onReplaySplash={() => setShowSplash(true)}
                />
              )}
            </main>

            {/* Global Add Transaction Bottom Sheet / Modal */}
            <AddTransactionModal 
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAddTransaction={handleAddTransaction}
            />

            {/* Bottom Tab Bar (Fixed at Bottom of Mobile Container) */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#F0EBF8] px-4 py-2 z-40 flex justify-around items-center">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const ItemIcon = item.Icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className="flex flex-col items-center py-1 group focus:outline-none"
                  >
                    {/* Active Pill Container for Icon */}
                    <div
                      className={`w-14 h-8 rounded-full flex items-center justify-center transition-all ${
                        isActive ? 'bg-[#EAE3FA]' : 'bg-transparent'
                      }`}
                    >
                      <ItemIcon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-[#2C1E4A] stroke-[2.4]' : 'text-[#9E97A9] stroke-[1.8]'
                        }`}
                      />
                    </div>
                    {/* Label */}
                    <span
                      className={`text-[11px] font-semibold mt-0.5 tracking-tight ${
                        isActive ? 'text-[#2C1E4A]' : 'text-[#9E97A9]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </>
        )}

        {/* Splash Screen */}
        {showSplash && (
          <SplashScreen 
            duration={2400} 
            onFinish={() => setShowSplash(false)} 
          />
        )}
      </div>
    </div>
  );
}
