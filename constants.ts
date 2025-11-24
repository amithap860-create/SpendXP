
import { Category, Goal, Transaction, Currency, Quest, Investment, InvestmentModule } from './types';

export const CURRENCIES: Record<Currency, { symbol: string; name: string }> = {
    USD: { symbol: '$', name: 'US Dollar' },
    CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
    INR: { symbol: '₹', name: 'Indian Rupee' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    SAR: { symbol: 'SR', name: 'Saudi Riyal' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
    BRL: { symbol: 'R$', name: 'Brazilian Real' },
    AED: { symbol: 'AED', name: 'UAE Dirham' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar' },
    ZAR: { symbol: 'R', name: 'South African Rand' },
    MXN: { symbol: 'Mex$', name: 'Mexican Peso' },
    HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
    KRW: { symbol: '₩', name: 'South Korean Won' },
    PHP: { symbol: '₱', name: 'Philippine Peso' },
    IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
    THB: { symbol: '฿', name: 'Thai Baht' },
    VND: { symbol: '₫', name: 'Vietnamese Dong' },
    MYR: { symbol: 'RM', name: 'Malaysian Ringgit' },
    TRY: { symbol: '₺', name: 'Turkish Lira' },
    NGN: { symbol: '₦', name: 'Nigerian Naira' },
    RUB: { symbol: '₽', name: 'Russian Ruble' },
};

// Base values (approximating USD for conversion)
const BASE_VALUES = {
    foodBudget: 150,
    gamingBudget: 50,
    bobaTransaction: 7.50,
    allowanceIncome: 50.00,
    skinTransaction: 25.00,
    hoodieTransaction: 45.99,
    movieTransaction: 15.00,
    dogWalkingIncome: 20.00,
    laptopGoal: 1200,
    concertGoal: 200,
    tripGoal: 500,
    goalContributionQuestTarget: 20,
    sampleInvestmentValue: 500,
};

export const CURRENCY_DATA: Record<Currency, { multiplier: number; precision: number; sampleContribution: number; sampleGoal: number }> = {
    USD: { multiplier: 1, precision: 2, sampleContribution: 10, sampleGoal: 250 },
    CAD: { multiplier: 1.35, precision: 2, sampleContribution: 15, sampleGoal: 300 },
    INR: { multiplier: 83, precision: 0, sampleContribution: 500, sampleGoal: 20000 },
    AUD: { multiplier: 1.5, precision: 2, sampleContribution: 15, sampleGoal: 350 },
    SAR: { multiplier: 3.75, precision: 2, sampleContribution: 40, sampleGoal: 1000 },
    EUR: { multiplier: 0.92, precision: 2, sampleContribution: 10, sampleGoal: 250 },
    GBP: { multiplier: 0.79, precision: 2, sampleContribution: 10, sampleGoal: 200 },
    JPY: { multiplier: 150, precision: 0, sampleContribution: 1500, sampleGoal: 40000 },
    CNY: { multiplier: 7.2, precision: 2, sampleContribution: 70, sampleGoal: 1800 },
    NZD: { multiplier: 1.6, precision: 2, sampleContribution: 15, sampleGoal: 400 },
    BRL: { multiplier: 5, precision: 2, sampleContribution: 50, sampleGoal: 1200 },
    AED: { multiplier: 3.67, precision: 2, sampleContribution: 40, sampleGoal: 1000 },
    SGD: { multiplier: 1.35, precision: 2, sampleContribution: 15, sampleGoal: 350 },
    ZAR: { multiplier: 19, precision: 2, sampleContribution: 200, sampleGoal: 4500 },
    MXN: { multiplier: 17, precision: 2, sampleContribution: 150, sampleGoal: 4000 },
    HKD: { multiplier: 7.8, precision: 2, sampleContribution: 80, sampleGoal: 2000 },
    KRW: { multiplier: 1300, precision: 0, sampleContribution: 13000, sampleGoal: 300000 },
    PHP: { multiplier: 56, precision: 2, sampleContribution: 500, sampleGoal: 14000 },
    IDR: { multiplier: 15500, precision: 0, sampleContribution: 150000, sampleGoal: 3500000 },
    THB: { multiplier: 36, precision: 2, sampleContribution: 350, sampleGoal: 9000 },
    VND: { multiplier: 24500, precision: 0, sampleContribution: 250000, sampleGoal: 6000000 },
    MYR: { multiplier: 4.7, precision: 2, sampleContribution: 50, sampleGoal: 1200 },
    TRY: { multiplier: 31, precision: 2, sampleContribution: 300, sampleGoal: 7500 },
    NGN: { multiplier: 1500, precision: 2, sampleContribution: 15000, sampleGoal: 350000 },
    RUB: { multiplier: 92, precision: 2, sampleContribution: 1000, sampleGoal: 25000 },
};

export const formatCurrency = (amount: number, currency: Currency): string => {
    const symbol = CURRENCIES[currency].symbol;
    const precision = CURRENCY_DATA[currency].precision;
    // Intl.NumberFormat is great for localization but to keep it simple and consistent with precision rules:
    const value = amount.toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    });
    return `${symbol}${value}`;
};


export const getInitialDataForCurrency = (currency: Currency) => {
    const { multiplier, precision } = CURRENCY_DATA[currency];
    const round = (val: number) => {
        const result = val * multiplier;
        // For currencies with 0 precision, round to nearest whole number
        return precision === 0 ? Math.round(result) : parseFloat(result.toFixed(precision));
    }

    const categories: Category[] = [
      { id: 'cat-income', name: 'Income', emoji: '💰', color: 'bg-brand-green' },
      { id: 'cat-food', name: 'Food', emoji: '🍔', color: 'bg-brand-yellow', budget: round(BASE_VALUES.foodBudget) },
      { id: 'cat-gaming', name: 'Gaming', emoji: '🎮', color: 'bg-brand-purple', budget: round(BASE_VALUES.gamingBudget) },
      { id: 'cat-shopping', name: 'Shopping', emoji: '🛍️', color: 'bg-brand-pink' },
      { id: 'cat-transport', name: 'Transport', emoji: '🚌', color: 'bg-gray-500' },
      { id: 'cat-entertainment', name: 'Entertainment', emoji: '🎬', color: 'bg-brand-teal' },
      { id: 'cat-savings', name: 'Savings', emoji: '🏦', color: 'bg-blue-500' },
      { id: 'cat-other', name: 'Other', emoji: '💸', color: 'bg-gray-500' },
    ];

    const transactions: Transaction[] = [
        { id: '1', amount: round(BASE_VALUES.bobaTransaction), categoryId: 'cat-food', description: 'Snacks with friends', date: new Date(Date.now() - 86400000).toISOString() },
        { id: '5', amount: round(BASE_VALUES.allowanceIncome), categoryId: 'cat-income', description: 'Weekly allowance', date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: '2', amount: round(BASE_VALUES.skinTransaction), categoryId: 'cat-gaming', description: 'In-game purchase', date: new Date(Date.now() - 172800000).toISOString() },
        { id: '3', amount: round(BASE_VALUES.hoodieTransaction), categoryId: 'cat-shopping', description: 'New clothes', date: new Date(Date.now() - 259200000).toISOString() },
        { id: '4', amount: round(BASE_VALUES.movieTransaction), categoryId: 'cat-entertainment', description: 'Cinema ticket', date: new Date(Date.now() - 345600000).toISOString() },
        { id: '6', amount: round(BASE_VALUES.dogWalkingIncome), categoryId: 'cat-income', description: 'Side hustle / Chores', date: new Date(Date.now() - 345600000 * 2).toISOString() },
    ];

    const goals: Goal[] = [
        { id: 'g1', name: 'New Tech Gadget', emoji: '💻', targetAmount: round(BASE_VALUES.laptopGoal), currentAmount: round(BASE_VALUES.laptopGoal / 3.4) },
        { id: 'g2', name: 'Concert Tickets', emoji: '🎤', targetAmount: round(BASE_VALUES.concertGoal), currentAmount: round(BASE_VALUES.concertGoal / 2) },
        { id: 'g3', name: 'Holiday Trip', emoji: '✈️', targetAmount: round(BASE_VALUES.tripGoal), currentAmount: round(BASE_VALUES.tripGoal / 4.1) },
    ];

    const investments: Investment[] = [
        { 
            id: 'inv1', 
            accountName: 'Tech Growth ETF', 
            ticker: 'VGT',
            type: 'Stocks', 
            currentValue: round(BASE_VALUES.sampleInvestmentValue), 
            projectedGrowth: 8 
        },
    ];
    
    return { categories, transactions, goals, investments };
};


export const CATEGORY_COLORS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
    'bg-rose-500'
];

export const QUESTS: Quest[] = [
    { 
        id: 'q1', 
        type: 'quiz',
        category: 'special',
        title: 'Finance 101 Quiz',
        description: "What's the best way to grow your money over time?",
        xpReward: 30,
        target: 1, // 1 correct answer needed
        videoSearchQuery: 'what is compound interest for teens',
    },
    {
        id: 'q2',
        type: 'logTransactions',
        category: 'daily',
        title: 'Tracker Titan',
        description: 'Log 3 expenses in a single day to build a habit.',
        xpReward: 40,
        target: 3, // log 3 transactions
        videoSearchQuery: 'why is it important to track spending',
    },
    {
        id: 'q3',
        type: 'saveToGoal',
        category: 'weekly',
        title: 'Goal Getter',
        description: 'Contribute at least {amount} to any goal this week.', // Placeholder
        xpReward: 50,
        target: BASE_VALUES.goalContributionQuestTarget, // Base USD target
        videoSearchQuery: 'how to set and reach savings goals',
    },
    {
        id: 'q4',
        type: 'stayUnderBudget',
        category: 'weekly',
        title: 'Budget Boss',
        description: 'Keep your Gaming spending under budget for the month.',
        xpReward: 75,
        target: 'cat-gaming', // categoryId
        videoSearchQuery: 'how to create a budget for teens',
    }
];

export const INVESTMENT_MODULES: InvestmentModule[] = [
    {
        id: 'm1',
        title: 'Investing 101',
        emoji: '🌱',
        description: 'Why should you care about investing?',
        xpReward: 100,
        content: [
            "Imagine planting a seed. You water it, and over time, it grows into a huge tree. Investing is just like that, but with money!",
            "When you keep money in a piggy bank, it stays the same. $10 is always $10. But inflation (things getting more expensive) means that $10 buys less candy in the future.",
            "Investing puts your money to work. You buy things (assets) that you hope will become more valuable over time. It's the secret code to building wealth without working 24/7.",
            "Key Concept: Compound Interest. It's interest on top of interest. Einstein called it the 8th wonder of the world!"
        ],
        quiz: {
            question: "What happens to money kept in a piggy bank over a long time due to inflation?",
            options: ["It grows in value", "It loses buying power", "It doubles", "It turns into gold"],
            correctAnswer: 1
        }
    },
    {
        id: 'm2',
        title: 'Stocks vs. Bonds',
        emoji: '⚖️',
        description: 'Understanding the main building blocks.',
        xpReward: 100,
        content: [
            "Stocks (or Equities) mean you own a tiny slice of a company. If the company does well (like sells a ton of iPhones), the stock price goes up. If they fail, it goes down. High risk, high reward.",
            "Bonds are like loaning money to a company or government. They promise to pay you back with interest. It's safer than stocks, but usually earns you less money.",
            "Think of it like this: Stocks are like being a part-owner of a lemonade stand. Bonds are like lending the stand owner $10 for supplies and getting $11 back later."
        ],
        quiz: {
            question: "If you buy a stock, what are you actually buying?",
            options: ["A loan to the bank", "A guaranteed profit", "A tiny piece of ownership in a company", "Insurance"],
            correctAnswer: 2
        }
    },
    {
        id: 'm3',
        title: 'The Rollercoaster',
        emoji: '🎢',
        description: 'Why do markets go up and down?',
        xpReward: 150,
        content: [
            "The stock market is like a rollercoaster. It goes up and down every day. This is called 'Volatility'.",
            "Prices change because of Supply and Demand. If more people want to buy a stock, the price goes up. If more people sell, it goes down.",
            "News affects this! A good earnings report? Price up! A scandal? Price down!",
            "The Golden Rule: Don't panic. Over history, the market has generally gone up. Investing is a marathon, not a sprint."
        ],
        quiz: {
            question: "What should you do if the market drops one day?",
            options: ["Panic and sell everything", "Buy a boat", "Stay calm and think long-term", "Hide under the bed"],
            correctAnswer: 2
        }
    }
];