
import React, { useState } from 'react';
import { User, Transaction, Currency, Category } from '../types';
import { CURRENCIES, formatCurrency } from '../constants';
import Card from './shared/Card';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { UserGroupIcon, LockIcon, BellIcon, ChartLineIcon } from './shared/Icons';

interface ParentDashboardProps {
  user: User;
  transactions: Transaction[];
  categories: Category[];
  onUpdateUser: (user: User) => void;
  onExit: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, transactions, categories, onUpdateUser, onExit }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'controls'>('overview');

  const handleParentalControlChange = (updates: Partial<User['parentalControls']>) => {
      onUpdateUser({
          ...user,
          parentalControls: {
              ...user.parentalControls,
              ...updates,
          }
      });
  };

  const totalSpent = transactions
    .filter(t => {
         const cat = categories.find(c => c.id === t.categoryId);
         return cat?.name !== 'Income' && cat?.name !== 'Savings';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="bg-brand-blue-light/20 border-b-2 border-brand-blue-light pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold flex items-center gap-2 text-brand-text">
                  <UserGroupIcon /> Parent Mode
              </h1>
              <Button onClick={onExit} variant="secondary" size="sm">Exit Parent Mode</Button>
          </div>
          <p className="text-brand-text-secondary text-sm">Monitoring account: <span className="font-bold text-brand-text">{user.name}</span></p>
      </div>

      <div className="flex bg-brand-blue rounded-lg p-1 mb-6">
        <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-md font-bold transition-colors ${activeTab === 'overview' ? 'bg-brand-purple text-white' : 'text-brand-text-secondary hover:text-white'}`}
        >
            Overview
        </button>
        <button 
            onClick={() => setActiveTab('controls')}
            className={`flex-1 py-2 rounded-md font-bold transition-colors ${activeTab === 'controls' ? 'bg-brand-purple text-white' : 'text-brand-text-secondary hover:text-white'}`}
        >
            Controls & Limits
        </button>
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-4">
              <Card>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ChartLineIcon /> Spending Summary</h2>
                  <div className="flex justify-between items-end mb-2">
                      <span className="text-brand-text-secondary">Total Spent (All Time)</span>
                      <span className="text-2xl font-bold">{formatCurrency(totalSpent, user.currency)}</span>
                  </div>
                  <div className="mt-4">
                      <h3 className="font-bold text-sm mb-2 text-brand-text-secondary">Recent Transactions</h3>
                      <div className="space-y-2">
                          {transactions.slice(0, 5).map(t => {
                               const cat = categories.find(c => c.id === t.categoryId);
                               return (
                                  <div key={t.id} className="flex justify-between text-sm p-2 bg-brand-blue-light rounded">
                                      <span>{t.description}</span>
                                      <span className={cat?.name === 'Income' ? 'text-brand-green' : ''}>
                                          {cat?.name === 'Income' ? '+' : '-'}{formatCurrency(t.amount, user.currency)}
                                      </span>
                                  </div>
                               )
                          })}
                      </div>
                  </div>
              </Card>
          </div>
      )}

      {activeTab === 'controls' && (
          <div className="space-y-4">
              <Card>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><LockIcon /> Spending Restrictions</h2>
                <div className="space-y-4">
                    {/* Spending Limit */}
                    <div className="p-4 bg-brand-blue-light rounded-lg">
                        <div className="flex items-center justify-between">
                            <label htmlFor="enableLimit" className="font-bold cursor-pointer">Enable Spending Limit</label>
                            <input
                                type="checkbox"
                                id="enableLimit"
                                checked={user.parentalControls.spendingLimitEnabled}
                                onChange={e => handleParentalControlChange({ spendingLimitEnabled: e.target.checked })}
                                className="h-6 w-6 rounded text-brand-purple bg-brand-background border-brand-blue-light focus:ring-brand-purple focus:ring-offset-brand-blue-light"
                            />
                        </div>
                        {user.parentalControls.spendingLimitEnabled && (
                            <div className="space-y-4 pt-4 mt-4 border-t border-brand-blue animate-fade-in">
                                <div>
                                    <label htmlFor="limitAmount" className="block text-sm font-medium text-brand-text-secondary mb-1">Max Amount ({CURRENCIES[user.currency].symbol})</label>
                                    <input
                                        id="limitAmount"
                                        type="number"
                                        value={user.parentalControls.spendingLimitAmount || ''}
                                        onChange={e => handleParentalControlChange({ spendingLimitAmount: parseFloat(e.target.value) || undefined })}
                                        className="w-full bg-brand-blue border-2 border-transparent focus:border-brand-purple focus:ring-0 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="limitPeriod" className="block text-sm font-medium text-brand-text-secondary mb-1">Period</label>
                                    <select
                                        id="limitPeriod"
                                        value={user.parentalControls.spendingLimitPeriod || 'monthly'}
                                        onChange={e => handleParentalControlChange({ spendingLimitPeriod: e.target.value as any })}
                                        className="w-full bg-brand-blue border-2 border-transparent focus:border-brand-purple focus:ring-0 rounded-md px-3 py-2"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                     <div className="p-4 bg-brand-blue-light rounded-lg">
                        <div className="flex items-center justify-between">
                             <label htmlFor="enableNotifications" className="font-bold cursor-pointer flex items-center gap-2"><BellIcon /> Receive Alerts</label>
                             <input
                                type="checkbox"
                                id="enableNotifications"
                                checked={!!user.parentalControls.notificationsEnabled}
                                onChange={e => handleParentalControlChange({ notificationsEnabled: e.target.checked })}
                                className="h-6 w-6 rounded text-brand-purple bg-brand-background border-brand-blue-light focus:ring-brand-purple focus:ring-offset-brand-blue-light"
                            />
                        </div>
                        {user.parentalControls.notificationsEnabled && (
                            <div className="pt-4 mt-4 border-t border-brand-blue animate-fade-in">
                                <label htmlFor="notificationThreshold" className="block text-sm font-medium text-brand-text-secondary mb-1">Alert for purchases over ({CURRENCIES[user.currency].symbol})</label>
                                <input
                                    id="notificationThreshold"
                                    type="number"
                                    value={user.parentalControls.notificationThreshold || ''}
                                    onChange={e => handleParentalControlChange({ notificationThreshold: parseFloat(e.target.value) || undefined })}
                                    placeholder="0 for all transactions"
                                    className="w-full bg-brand-blue border-2 border-transparent focus:border-brand-purple focus:ring-0 rounded-md px-3 py-2"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
          </div>
      )}
    </div>
  );
};

export default ParentDashboard;
