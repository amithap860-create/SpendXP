
export interface User {
  name: string;
  email: string; // Added email for account identification
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  currency: Currency;
  security: {
      pinHash?: string;
      parentPinHash?: string; // Separate PIN for parental controls
      twoFactorEnabled: boolean;
  };
  parentalControls: {
    spendingLimitEnabled: boolean;
    spendingLimitAmount?: number;
    spendingLimitPeriod?: 'daily' | 'weekly' | 'monthly';
    notificationsEnabled?: boolean;
    notificationThreshold?: number;
  };
  preferences?: {
    notifications: boolean;
  };
  linkedAccounts?: LinkedAccount[];
}

export interface LinkedAccount {
    id: string;
    provider: string; // e.g., "Chase", "Bank of America"
    type: 'Bank' | 'Card';
    mask: string; // e.g., "Checking ...1234"
    balance?: number;
    connectedAt: string;
}

export type Currency = 'USD' | 'CAD' | 'INR' | 'AUD' | 'SAR' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'NZD' | 'BRL' | 'AED' | 'SGD' | 'ZAR' | 'MXN' | 'HKD' | 'KRW' | 'PHP' | 'IDR' | 'THB' | 'VND' | 'MYR' | 'TRY' | 'NGN' | 'RUB';

export interface Category {
    id: string;
    name: string;
    emoji: string;
    color: string; // e.g., 'bg-brand-yellow'
    budget?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  source?: 'manual' | 'linked'; // Source of transaction
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  videoUrl?: string;
}

export interface Investment {
  id: string;
  accountName: string; // or Company Name
  ticker?: string; // e.g., AAPL, GOOGL
  type: 'Stocks' | 'Crypto' | 'Savings' | 'Other';
  currentValue: number;
  projectedGrowth: number; // Annual percentage
}

export type View = 'dashboard' | 'goals' | 'quests' | 'coach' | 'profile' | 'onboarding' | 'investments' | 'parent-dashboard';

export type QuestType = 'dailyLogin' | 'logTransactions' | 'saveToGoal' | 'quiz' | 'stayUnderBudget';

export interface Quest {
    id:string;
    type: QuestType;
    category: 'daily' | 'weekly' | 'special';
    title: string;
    description: string;
    xpReward: number;
    // For 'logTransactions', this is the target number
    // For 'saveToGoal', this is the target amount
    // For 'stayUnderBudget', this is the categoryId (string)
    target: number | string; 
    videoSearchQuery?: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // index
}

export interface InvestmentModule {
    id: string;
    title: string;
    emoji: string;
    description: string;
    content: string[]; // Paragraphs
    quiz: QuizQuestion;
    xpReward: number;
}