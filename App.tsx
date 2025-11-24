
import React, { useState, useCallback, useEffect } from 'react';
import { User, Transaction, Goal, View, Currency, Category, Investment, LinkedAccount } from './types';
import { getInitialDataForCurrency, formatCurrency, CURRENCIES } from './constants';
import Dashboard from './components/Dashboard';
import GoalsAndBudgets from './components/Goals';
import Quests from './components/Quests';
import BottomNav from './components/BottomNav';
import TransactionLogger from './components/TransactionLogger';
import Coach from './components/Coach';
import Profile from './components/Profile';
import Tutorial from './components/Tutorial';
import Onboarding from './components/Onboarding';
import Investments from './components/Investments';
import ParentDashboard from './components/ParentDashboard';
import ParentPinModal from './components/ParentPinModal';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // Auth State - Initialize directly from localStorage to persist session across reloads
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
      return localStorage.getItem('spendxp-current-email');
  });

  // App Data State
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isLogging, setIsLogging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(new Set());
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  
  // Parent Mode State
  const [showParentPinModal, setShowParentPinModal] = useState(false);
  const [parentPinMode, setParentPinMode] = useState<'create' | 'verify'>('verify');
  
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('spendxp-theme') as Theme) || 'dark';
  });

  // --- Theme Effect ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('spendxp-theme', theme);
  }, [theme]);

  // --- Data Loading Effect (Runs on mount and when email changes) ---
  useEffect(() => {
    if (!currentUserEmail) {
        setUser(null);
        return;
    }

    // Helper to get namespaced key
    const getKey = (key: string) => `spendxp-${currentUserEmail}-${key}`;

    const savedUser = localStorage.getItem(getKey('user'));
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // --- DATA MIGRATION & VALIDATION ---
        if (!parsedUser.preferences) parsedUser.preferences = { notifications: true };
        if (!parsedUser.security) parsedUser.security = { twoFactorEnabled: false };
        if (!parsedUser.linkedAccounts) parsedUser.linkedAccounts = [];
        if (!parsedUser.parentalControls) parsedUser.parentalControls = { spendingLimitEnabled: false };
        
        // Validate Currency (Fall back to USD if invalid to prevent crashes)
        if (!parsedUser.currency || !CURRENCIES[parsedUser.currency as Currency]) {
            parsedUser.currency = 'USD';
        }
        
        setUser(parsedUser);

        const savedCategories = localStorage.getItem(getKey('categories'));
        if (savedCategories) setCategories(JSON.parse(savedCategories));

        const savedTransactions = localStorage.getItem(getKey('transactions'));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

        const savedGoals = localStorage.getItem(getKey('goals'));
        if (savedGoals) setGoals(JSON.parse(savedGoals));

        const savedInvestments = localStorage.getItem(getKey('investments'));
        if (savedInvestments) setInvestments(JSON.parse(savedInvestments));

        const savedClaimedQuests = localStorage.getItem(getKey('claimed-quests'));
        if (savedClaimedQuests) setClaimedQuests(new Set(JSON.parse(savedClaimedQuests)));

        const savedCompletedModules = localStorage.getItem(getKey('completed-modules'));
        if (savedCompletedModules) setCompletedModules(new Set(JSON.parse(savedCompletedModules)));

      } catch (e) {
        console.error("Failed to load user data", e);
        // Fallback/Logout if data is corrupted
        setCurrentUserEmail(null);
        localStorage.removeItem('spendxp-current-email');
      }
    } else {
        // If email is in 'current-email' but no data exists, clear session
        setCurrentUserEmail(null);
        localStorage.removeItem('spendxp-current-email');
    }
  }, [currentUserEmail]);

  // --- Helper to save data with namespace ---
  const saveData = useCallback((key: string, data: any) => {
      if (!currentUserEmail) return;
      const storageKey = `spendxp-${currentUserEmail}-${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
  }, [currentUserEmail]);

  // --- Security Utils ---
  const hashPin = async (pin: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
  };

  // --- Auth Handlers ---
  
  const handleCreateAccount = async (name: string, email: string, currency: Currency, pin: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if account exists to ensure email uniqueness
    const existingUser = localStorage.getItem(`spendxp-${normalizedEmail}-user`);
    if (existingUser) {
        throw new Error("An account with this email already exists. Please log in.");
    }

    const pinHash = await hashPin(pin);

    const newUser: User = {
        name,
        email: normalizedEmail,
        currency,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        security: {
            pinHash: pinHash,
            twoFactorEnabled: true, // Default to true for "Unhackable" vibe
        },
        parentalControls: {
            spendingLimitEnabled: false,
            notificationsEnabled: false,
        },
        preferences: {
            notifications: true,
        },
        linkedAccounts: [],
    };
    
    const { 
        categories: initialCategories, 
        transactions: initialTransactions, 
        goals: initialGoals,
        investments: initialInvestments,
    } = getInitialDataForCurrency(currency);

    // Persist (Using the new email immediately)
    const prefix = `spendxp-${normalizedEmail}-`;
    localStorage.setItem(`${prefix}user`, JSON.stringify(newUser));
    localStorage.setItem(`${prefix}categories`, JSON.stringify(initialCategories));
    localStorage.setItem(`${prefix}transactions`, JSON.stringify(initialTransactions));
    localStorage.setItem(`${prefix}goals`, JSON.stringify(initialGoals));
    localStorage.setItem(`${prefix}investments`, JSON.stringify(initialInvestments));
    localStorage.setItem(`${prefix}claimed-quests`, JSON.stringify([]));
    localStorage.setItem(`${prefix}completed-modules`, JSON.stringify([]));
    
    // Set State (Optimistic update)
    setUser(newUser);
    setCategories(initialCategories);
    setTransactions(initialTransactions);
    setGoals(initialGoals);
    setInvestments(initialInvestments);
    setClaimedQuests(new Set());
    setCompletedModules(new Set());

    // Set persistent session
    localStorage.setItem('spendxp-current-email', normalizedEmail);
    setCurrentUserEmail(normalizedEmail);

    setShowTutorial(true); 
  };

  // Checks if user exists and if 2FA is enabled, without logging in
  const handleCheckUser = (email: string) => {
      const normalizedEmail = email.toLowerCase().trim();
      const userKey = `spendxp-${normalizedEmail}-user`;
      const userStr = localStorage.getItem(userKey);
      if (userStr) {
          try {
              const u: User = JSON.parse(userStr);
              return {
                  exists: true,
                  hasPin: !!u.security?.pinHash,
                  twoFactorEnabled: u.security?.twoFactorEnabled ?? false
              };
          } catch (e) {
              console.error("Corrupt user data found", e);
              return { exists: false, hasPin: false, twoFactorEnabled: false };
          }
      }
      return { exists: false, hasPin: false, twoFactorEnabled: false };
  };

  const handleLogin = async (email: string, pin?: string) => {
      const normalizedEmail = email.toLowerCase().trim();
      const userKey = `spendxp-${normalizedEmail}-user`;
      const userStr = localStorage.getItem(userKey);
      
      if (userStr) {
          try {
            const u: User = JSON.parse(userStr);
            
            // Security Check
            if (u.security?.twoFactorEnabled && u.security.pinHash) {
                if (!pin) {
                    throw new Error("PIN required");
                }
                const hashedInput = await hashPin(pin);
                if (hashedInput !== u.security.pinHash) {
                    throw new Error("Incorrect PIN");
                }
            }

            localStorage.setItem('spendxp-current-email', normalizedEmail);
            setCurrentUserEmail(normalizedEmail);
          } catch (e) {
              console.error(e);
              throw new Error("Account data is corrupt.");
          }
      } else {
          throw new Error("No account found with that email.");
      }
  };

  const handleResetPin = async (email: string, newPin: string) => {
      const normalizedEmail = email.toLowerCase().trim();
      const userKey = `spendxp-${normalizedEmail}-user`;
      const userStr = localStorage.getItem(userKey);
      
      if (userStr) {
          const u: User = JSON.parse(userStr);
          
          // Ensure security object exists before setting property
          if (!u.security) {
              u.security = { twoFactorEnabled: true };
          }
          
          u.security.pinHash = await hashPin(newPin);
          
          localStorage.setItem(userKey, JSON.stringify(u));
          
          // Apply Migrations locally before setting state to prevent crashes
          if (!u.preferences) u.preferences = { notifications: true };
          if (!u.linkedAccounts) u.linkedAccounts = [];
          if (!u.parentalControls) u.parentalControls = { spendingLimitEnabled: false };
          if (!u.currency || !CURRENCIES[u.currency]) u.currency = 'USD';

          // Auto login after reset
          localStorage.setItem('spendxp-current-email', normalizedEmail);
          setCurrentUserEmail(normalizedEmail);
          setUser(u);
      } else {
          throw new Error("No account found.");
      }
  };
  
  const handleLogout = () => {
      setCurrentUserEmail(null);
      setUser(null);
      setActiveView('dashboard');
      localStorage.removeItem('spendxp-current-email');
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
      saveData('user', updatedUser);
  };
  
  const handleUpdateSecurity = async (enabled: boolean, newPin?: string) => {
      if (!user) return;
      const updates: Partial<User['security']> = {
          twoFactorEnabled: enabled
      };
      if (newPin) {
          updates.pinHash = await hashPin(newPin);
      } else if (user.security?.pinHash) {
          // Keep existing pin
          updates.pinHash = user.security.pinHash;
      }

      const updatedUser: User = {
          ...user,
          security: {
              ...user.security,
              ...updates,
          } as User['security']
      };
      handleUpdateUser(updatedUser);
  };

  const handleEnterParentMode = () => {
      if (!user) return;
      
      // Check if parent PIN is set
      if (!user.security.parentPinHash) {
          setParentPinMode('create');
          setShowParentPinModal(true);
      } else {
          setParentPinMode('verify');
          setShowParentPinModal(true);
      }
  };

  const handleParentPinSubmit = async (pin: string) => {
      if (!user) return;
      
      const pinHash = await hashPin(pin);

      if (parentPinMode === 'create') {
          const updatedUser = {
              ...user,
              security: { ...user.security, parentPinHash: pinHash }
          };
          handleUpdateUser(updatedUser);
          setShowParentPinModal(false);
          setActiveView('parent-dashboard');
      } else {
          // Verify
          if (pinHash === user.security.parentPinHash) {
              setShowParentPinModal(false);
              setActiveView('parent-dashboard');
          } else {
              alert("Incorrect Parent PIN");
          }
      }
  };
  
  const handleLinkAccount = (provider: string, type: 'Bank' | 'Card') => {
      if (!user) return;

      const newAccount: LinkedAccount = {
          id: `acc-${Date.now()}`,
          provider,
          type,
          mask: `${type === 'Bank' ? 'Checking' : 'Credit'} ...${Math.floor(1000 + Math.random() * 9000)}`,
          connectedAt: new Date().toISOString(),
      };

      // Mock Transactions for the new account
      const mockTransactions: Transaction[] = [
          { id: `tx-link-${Date.now()}-1`, amount: 12.50, categoryId: 'cat-food', description: `${provider}: Lunch`, date: new Date().toISOString(), source: 'linked' },
          { id: `tx-link-${Date.now()}-2`, amount: 29.99, categoryId: 'cat-shopping', description: `${provider}: Online Store`, date: new Date(Date.now() - 86400000).toISOString(), source: 'linked' }
      ];

      const updatedUser = {
          ...user,
          linkedAccounts: [...(user.linkedAccounts || []), newAccount]
      };
      
      const updatedTransactions = [...mockTransactions, ...transactions];

      setUser(updatedUser);
      setTransactions(updatedTransactions);
      saveData('user', updatedUser);
      saveData('transactions', updatedTransactions);
  };

  const handleFinishTutorial = () => {
    setShowTutorial(false);
  };

  const addCategory = (name: string, emoji: string, color: string) => {
      const newCategory: Category = {
          id: `custom-${Date.now()}`,
          name,
          emoji,
          color,
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      saveData('categories', updatedCategories);
  };

  const updateCategory = (updatedCategory: Category) => {
    const updatedCategories = categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
    setCategories(updatedCategories);
    saveData('categories', updatedCategories);
  };

    const addXp = useCallback((amount: number) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      let newXp = prevUser.xp + amount;
      let newLevel = prevUser.level;
      let newXpToNextLevel = prevUser.xpToNextLevel;

      while (newXp >= newXpToNextLevel) {
        newXp -= newXpToNextLevel;
        newLevel += 1;
        newXpToNextLevel = Math.round(newXpToNextLevel * 1.5);
      }
      
      const updatedUser = {
        ...prevUser,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: newXpToNextLevel,
      };
      
      if (currentUserEmail) {
           localStorage.setItem(`spendxp-${currentUserEmail}-user`, JSON.stringify(updatedUser));
      }
      return updatedUser;
    });
  }, [currentUserEmail]);

  const addTransaction = useCallback((amount: number, categoryId: string, description: string) => {
    if (!user) return;

    const category = categories.find(c => c.id === categoryId);
    const isIncome = category?.name === 'Income';
    const isSaving = category?.name === 'Savings';
    const now = new Date();

    // Parental Controls
    if (!isIncome && !isSaving && user.parentalControls.spendingLimitEnabled && user.parentalControls.spendingLimitAmount) {
        let periodStart: Date;
        switch (user.parentalControls.spendingLimitPeriod) {
            case 'daily': periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
            case 'weekly':
                const dayOfWeek = now.getDay();
                const firstDayOfWeek = now.getDate() - dayOfWeek;
                periodStart = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
                periodStart.setHours(0,0,0,0);
                break;
            case 'monthly': default: periodStart = new Date(now.getFullYear(), now.getMonth(), 1); break;
        }

        const spendingThisPeriod = transactions
            .filter(t => {
                const txDate = new Date(t.date);
                const txCategory = categories.find(c => c.id === t.categoryId);
                return txDate >= periodStart && txCategory?.name !== 'Income' && txCategory?.name !== 'Savings';
            })
            .reduce((sum, t) => sum + t.amount, 0);

        if (spendingThisPeriod + amount > user.parentalControls.spendingLimitAmount) {
            throw new Error(`This transaction exceeds the ${user.parentalControls.spendingLimitPeriod || 'monthly'} spending limit.`);
        }
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount,
      categoryId,
      description,
      date: new Date().toISOString(),
      source: 'manual',
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveData('transactions', updatedTransactions);

    // Notifications
    if (!isIncome && !isSaving && user.parentalControls.notificationsEnabled) {
        const threshold = user.parentalControls.notificationThreshold || 0;
        if (amount >= threshold) {
             setTimeout(() => alert(`Parental Alert:\nA transaction of ${formatCurrency(amount, user.currency)} for "${description}" was just logged.`), 500);
        }
    }
    
    if (!isIncome && !isSaving && (user.preferences?.notifications ?? true)) {
        if (category?.budget) {
             const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
             const spentThisMonth = updatedTransactions
                .filter(t => t.categoryId === categoryId && new Date(t.date) >= startOfMonth)
                .reduce((sum, t) => sum + t.amount, 0);
             
             if (spentThisMonth > category.budget) {
                 setTimeout(() => alert(`Budget Alert ⚠️\nYou've exceeded your monthly budget for ${category.name}!`), 500);
             }
        }
    }

    const xpGained = isIncome ? Math.round(amount / 4) + 5 : Math.round(amount / 2) + 10;
    
    // Streak Logic
    let newStreak = user.streak;

    if (!isIncome) {
        // Find the most recent EXPENSE transaction from the history (before this new one)
        const lastExpense = transactions.find(t => {
            const c = categories.find(cat => cat.id === t.categoryId);
            return c?.name !== 'Income';
        });

        if (lastExpense) {
            const lastDate = new Date(lastExpense.date);
            const today = new Date();
            
            // Normalize to start of day for comparison
            lastDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);

            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

            if (diffDays === 0) {
                // Already active today, streak doesn't change
            } else if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
            } else {
                // Missed a day (or more)
                newStreak = 1;
            }
        } else {
            // First expense ever
            newStreak = 1;
        }
    }

    // Apply XP and Streak Update in one go
    setUser(prevUser => {
        if (!prevUser) return null;
        
        // Calculate Level/XP
        let newXp = prevUser.xp + xpGained;
        let newLevel = prevUser.level;
        let newXpToNextLevel = prevUser.xpToNextLevel;

        while (newXp >= newXpToNextLevel) {
            newXp -= newXpToNextLevel;
            newLevel += 1;
            newXpToNextLevel = Math.round(newXpToNextLevel * 1.5);
        }

        const updatedUser = {
            ...prevUser,
            level: newLevel,
            xp: newXp,
            xpToNextLevel: newXpToNextLevel,
            streak: newStreak
        };
        
        if(currentUserEmail) localStorage.setItem(`spendxp-${currentUserEmail}-user`, JSON.stringify(updatedUser));
        return updatedUser;
    });

    setIsLogging(false);
  }, [user, categories, transactions, saveData, currentUserEmail]);
  
  const addGoal = useCallback((name: string, targetAmount: number, videoUrl?: string) => {
    const newGoal: Goal = {
        id: Date.now().toString(),
        name,
        targetAmount,
        currentAmount: 0,
        emoji: '🎯',
        videoUrl: videoUrl && videoUrl.trim() ? videoUrl.trim() : undefined,
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveData('goals', updatedGoals);
  }, [goals, saveData]);

  const claimQuest = useCallback((questId: string, xp: number) => {
      if (claimedQuests.has(questId)) return;
      addXp(xp);
      const newClaimedQuests = new Set(claimedQuests);
      newClaimedQuests.add(questId);
      setClaimedQuests(newClaimedQuests);
      saveData('claimed-quests', Array.from(newClaimedQuests));
  }, [claimedQuests, addXp, saveData]);
  
  const handleCompleteModule = useCallback((moduleId: string, xp: number) => {
      if (completedModules.has(moduleId)) return;
      
      addXp(xp);
      
      const newCompleted = new Set(completedModules);
      newCompleted.add(moduleId);
      setCompletedModules(newCompleted);
      
      saveData('completed-modules', Array.from(newCompleted));
  }, [completedModules, addXp, saveData]);

  const contributeToGoal = useCallback((goalId: string, amount: number) => {
    if (!user) return;
    let goalCompleted = false;
    let goalName = '';

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId && goal.currentAmount < goal.targetAmount) {
        goalName = goal.name;
        const newAmount = goal.currentAmount + amount;
        if (!goalCompleted && newAmount >= goal.targetAmount) goalCompleted = true;
        return {
          ...goal,
          currentAmount: Math.min(newAmount, goal.targetAmount),
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
    saveData('goals', updatedGoals);

    const savingsCategory = categories.find(c => c.name === 'Savings');
    if (savingsCategory && goalName) {
        try {
            addTransaction(amount, savingsCategory.id, `Contribution to "${goalName}"`);
        } catch (error) {
            console.error("Could not log savings transaction:", error);
        }
    }

    if (goalCompleted) addXp(50);
  }, [user, goals, addXp, categories, addTransaction, saveData]);

    const addInvestment = (newInvestmentData: Omit<Investment, 'id'>) => {
        const newInvestment: Investment = {
            id: `inv-${Date.now()}`,
            ...newInvestmentData,
        };
        const updatedInvestments = [...investments, newInvestment];
        setInvestments(updatedInvestments);
        saveData('investments', updatedInvestments);
    };

    const updateInvestment = (updatedInvestment: Investment) => {
        const updatedInvestments = investments.map(inv =>
            inv.id === updatedInvestment.id ? updatedInvestment : inv
        );
        setInvestments(updatedInvestments);
        saveData('investments', updatedInvestments);
    };

    const deleteInvestment = (investmentId: string) => {
        const updatedInvestments = investments.filter(inv => inv.id !== investmentId);
        setInvestments(updatedInvestments);
        saveData('investments', updatedInvestments);
    };

    const handleToggleTheme = () => {
      setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

  const renderView = () => {
    if (!user || !currentUserEmail) {
        return <Onboarding 
                    onCreateAccount={handleCreateAccount} 
                    onLogin={handleLogin} 
                    checkUser={handleCheckUser}
                    onResetPin={handleResetPin}
               />;
    }
    
    if (activeView === 'parent-dashboard') {
        return <ParentDashboard 
                    user={user}
                    transactions={transactions}
                    categories={categories}
                    onUpdateUser={handleUpdateUser}
                    onExit={() => setActiveView('profile')}
               />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={user} transactions={transactions} goals={goals} categories={categories} />;
      case 'goals':
        return <GoalsAndBudgets user={user} goals={goals} addGoal={addGoal} contributeToGoal={contributeToGoal} categories={categories} transactions={transactions} onUpdateCategory={updateCategory} />;
      case 'quests':
        return <Quests user={user} transactions={transactions} goals={goals} claimedQuests={claimedQuests} onClaimQuest={claimQuest} categories={categories} />;
      case 'coach':
        return <Coach />;
      case 'investments':
        return <Investments 
            user={user} 
            investments={investments} 
            onAddInvestment={addInvestment} 
            onUpdateInvestment={updateInvestment} 
            onDeleteInvestment={deleteInvestment}
            onCompleteModule={handleCompleteModule}
            completedModules={completedModules}
        />;
      case 'profile':
        return <Profile 
                    user={user} 
                    onUpdateUser={handleUpdateUser} 
                    onViewTutorial={() => setShowTutorial(true)}
                    theme={theme}
                    onToggleTheme={handleToggleTheme}
                    onLogout={handleLogout}
                    onUpdateSecurity={handleUpdateSecurity}
                    onEnterParentMode={handleEnterParentMode}
                    onLinkAccount={handleLinkAccount}
                />;
      default:
        return <Dashboard user={user} transactions={transactions} goals={goals} categories={categories} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text font-sans flex flex-col">
      <main className="flex-grow container mx-auto p-4 pb-24 max-w-2xl">
        {renderView()}
      </main>
      {user && currentUserEmail && activeView !== 'parent-dashboard' && (
          <BottomNav activeView={activeView} setActiveView={setActiveView} onLogClick={() => setIsLogging(true)} />
      )}
      {isLogging && user && activeView !== 'parent-dashboard' && (
        <TransactionLogger
          user={user}
          onClose={() => setIsLogging(false)}
          onAddTransaction={addTransaction}
          categories={categories}
          onAddCategory={addCategory}
        />
      )}
      {showTutorial && <Tutorial onFinish={handleFinishTutorial} />}
      {showParentPinModal && (
          <ParentPinModal 
              mode={parentPinMode}
              onClose={() => setShowParentPinModal(false)}
              onSubmit={handleParentPinSubmit}
          />
      )}
    </div>
  );
};

export default App;
