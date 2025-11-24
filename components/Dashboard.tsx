
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User, Transaction, Goal, Category } from '../types';
import { formatCurrency } from '../constants';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import { FireIcon } from './shared/Icons';

interface DashboardProps {
  user: User;
  transactions: Transaction[];
  goals: Goal[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, transactions, goals, categories }) => {
    const incomeCategory = categories.find(c => c.name === 'Income');
    const savingsCategory = categories.find(c => c.name === 'Savings');

    const incomeTransactions = transactions.filter(t => t.categoryId === incomeCategory?.id);
    const savingsTransactions = transactions.filter(t => t.categoryId === savingsCategory?.id);
    const expenseTransactions = transactions.filter(t => t.categoryId !== incomeCategory?.id && t.categoryId !== savingsCategory?.id);

    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalSavings = savingsTransactions.reduce((sum, t) => sum + t.amount, 0);


    const spendingData = categories.map(cat => {
        if (!cat) return null;
        if (cat.name === 'Income') return null;
        if (cat.name === 'Savings') return null; // Exclude savings from spending chart
        const total = expenseTransactions
            .filter(t => t.categoryId === cat.id)
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Safety check for color to prevent crashes
        const safeColor = cat.color || 'bg-gray-500';
        const chartColor = safeColor.replace('bg-','').replace('-500','').replace('-400','').replace('-600','');

        return { name: cat.emoji, value: total, color: chartColor };
    }).filter((d): d is { name: string; value: number; color: string; } => d !== null && d.value > 0);
    
    const colorMap: { [key: string]: string } = {
        'brand-yellow': '#f59e0b',
        'brand-purple': '#8b5cf6',
        'brand-pink': '#ec4899',
        'brand-teal': '#14b8a6',
        'brand-green': '#10b981',
        'gray': '#6b7280',
        'red': '#ef4444', 'orange': '#f97316', 'amber': '#f59e0b', 'yellow': '#eab308',
        'lime': '#84cc16', 'green': '#22c55e', 'emerald': '#10b981', 'teal': '#14b8a6',
        'cyan': '#06b6d4', 'sky': '#0ea5e9', 'blue': '#3b82f6', 'indigo': '#6366f1',
        'violet': '#8b5cf6', 'purple': '#a855f7', 'fuchsia': '#d946ef', 'pink': '#ec4899',
        'rose': '#f43f5e'
    };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand-text">Hey, {user.name}!</h1>
        <p className="text-brand-text-secondary">Here's your Money Map for today.</p>
      </div>

      <Card>
        <div className="flex justify-around items-center text-center">
          <div>
            <p className="text-sm text-brand-text-secondary">Level</p>
            <p className="text-2xl font-bold text-brand-yellow">{user.level}</p>
          </div>
          <div className="w-px h-12 bg-brand-blue-light"></div>
          <div>
            <p className="text-sm text-brand-text-secondary">XP</p>
            <p className="text-2xl font-bold">{user.xp} / {user.xpToNextLevel}</p>
          </div>
           <div className="w-px h-12 bg-brand-blue-light"></div>
          <div>
             <p className="text-sm text-brand-text-secondary flex items-center justify-center gap-1">Streak <FireIcon /></p>
            <p className="text-2xl font-bold text-brand-pink">{user.streak} days</p>
          </div>
        </div>
        <ProgressBar value={user.xp} max={user.xpToNextLevel} color="bg-brand-yellow" />
      </Card>

       <Card>
        <h2 className="text-xl font-bold mb-4">Flow Summary</h2>
        <div className="flex justify-around text-center">
            <div>
                <p className="text-sm text-brand-text-secondary">Income</p>
                <p className="text-xl font-bold text-brand-green">+{formatCurrency(totalIncome, user.currency)}</p>
            </div>
            <div className="w-px h-12 bg-brand-blue-light"></div>
            <div>
                <p className="text-sm text-brand-text-secondary">Expenses</p>
                <p className="text-xl font-bold text-red-500">-{formatCurrency(totalExpenses, user.currency)}</p>
            </div>
             <div className="w-px h-12 bg-brand-blue-light"></div>
            <div>
                <p className="text-sm text-brand-text-secondary">Saved</p>
                <p className="text-xl font-bold text-blue-400">+{formatCurrency(totalSavings, user.currency)}</p>
            </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Weekly Spend</h2>
        {expenseTransactions.length > 0 ? (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={spendingData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#a0d6f4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0d6f4' }} axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(value as number, user.currency)} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ backgroundColor: '#00426A', border: 'none', borderRadius: '0.5rem' }} formatter={(value: number) => formatCurrency(value, user.currency)} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.color] || '#ffffff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-brand-text-secondary text-center py-8">Log your first expense to see your spending habits!</p>
        )}
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold mb-4">Active Goals</h2>
        <div className="space-y-4">
          {goals.slice(0, 2).map(goal => (
            <div key={goal.id}>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{goal.emoji} {goal.name}</span>
                    <span className="text-sm text-brand-text-secondary">{formatCurrency(goal.currentAmount, user.currency)} / {formatCurrency(goal.targetAmount, user.currency)}</span>
                </div>
              <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
            </div>
          ))}
          {goals.length === 0 && <p className="text-brand-text-secondary text-center">No goals yet. Let's set one up!</p>}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Budget Watch</h2>
        <div className="space-y-4">
        {(() => {
            const budgetedCategories = categories
                .filter(c => c.budget !== undefined && c.budget > 0 && c.name !== 'Income')
                .sort((a,b) => (b.budget || 0) - (a.budget || 0));

            if (budgetedCategories.length === 0) {
                return <p className="text-brand-text-secondary text-center">Set some budgets in the Goals tab to watch them here!</p>;
            }
            
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            return budgetedCategories.slice(0, 3).map(cat => {
                const spending = transactions
                    .filter(t => t.categoryId === cat.id && new Date(t.date) >= startOfMonth)
                    .reduce((sum, t) => sum + t.amount, 0);
                return (
                    <div key={cat.id}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">{cat.emoji} {cat.name}</span>
                            <span className="text-sm text-brand-text-secondary">{formatCurrency(spending, user.currency)} / {formatCurrency(cat.budget || 0, user.currency)}</span>
                        </div>
                        <ProgressBar value={spending} max={cat.budget || 0} color={spending > (cat.budget || 0) ? 'bg-red-500' : 'bg-brand-green'} />
                    </div>
                )
            })
        })()}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(t => {
            const category = categories.find(c => c.id === t.categoryId);
            const isIncome = category?.name === 'Income';
            return (
                <div key={t.id} className="flex items-center justify-between p-3 bg-brand-blue-light rounded-lg">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${category?.color || 'bg-gray-500'}`}>
                    {category?.emoji || '💸'}
                    </div>
                    <div>
                    <p className="font-bold">{t.description}</p>
                    <p className="text-sm text-brand-text-secondary">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <p className={`font-bold text-lg ${isIncome ? 'text-brand-green' : 'text-white'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount, user.currency)}
                </p>
                </div>
            )
          })}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
