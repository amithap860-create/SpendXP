import React, { useState } from 'react';
import { Category, User } from '../types';
import { CURRENCIES } from '../constants';
import AddCategoryModal from './AddCategoryModal';
import { PlusCircleIcon } from './shared/Icons';

interface TransactionLoggerProps {
  user: User;
  onClose: () => void;
  onAddTransaction: (amount: number, categoryId: string, description: string) => void;
  categories: Category[];
  onAddCategory: (name: string, emoji: string, color: string) => void;
}

const TransactionLogger: React.FC<TransactionLoggerProps> = ({ user, onClose, onAddTransaction, categories, onAddCategory }) => {
  const currencySymbol = CURRENCIES[user.currency].symbol;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!selectedCategoryId) {
      setError('Please select a category.');
      return;
    }
    if (!description.trim()) {
      setError('Please add a description.');
      return;
    }
    try {
        onAddTransaction(numAmount, selectedCategoryId, description.trim());
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    }
  };

  return (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-brand-background rounded-2xl p-6 w-full max-w-sm m-4 relative shadow-2xl border border-brand-blue-light">
            <button onClick={onClose} className="absolute top-3 right-3 text-brand-text-secondary hover:text-white">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-center">Log Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-brand-text-secondary mb-1">Amount ({currencySymbol})</label>
                <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-brand-blue-light text-2xl font-bold p-2 rounded-md border-2 border-transparent focus:border-brand-green focus:ring-0 text-center"
                autoFocus
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary mb-1">What was it for?</label>
                <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Lunch with friends"
                className="w-full bg-brand-blue-light p-2 rounded-md border-2 border-transparent focus:border-brand-green focus:ring-0"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Category</label>
                <div className="grid grid-cols-4 gap-3">
                {categories.map(cat => (
                    <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${selectedCategoryId === cat.id ? 'border-brand-green bg-brand-green bg-opacity-20' : 'border-transparent bg-brand-blue-light hover:bg-opacity-80'}`}
                    >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-xs mt-1 truncate">{cat.name}</span>
                    </button>
                ))}
                 <button
                    type="button"
                    onClick={() => setShowAddCategory(true)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-dashed border-brand-blue-light text-brand-text-secondary hover:bg-brand-blue-light transition-colors"
                 >
                     <PlusCircleIcon />
                     <span className="text-xs mt-1">New</span>
                 </button>
                </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-colors">
                Log It!
            </button>
            </form>
        </div>
        </div>
        {showAddCategory && (
            <AddCategoryModal 
                onClose={() => setShowAddCategory(false)}
                onAddCategory={(name, emoji, color) => {
                    onAddCategory(name, emoji, color);
                    setShowAddCategory(false);
                }}
            />
        )}
    </>
  );
};

export default TransactionLogger;
