import React, { useState } from 'react';
import { Goal, User, Category, Transaction } from '../types';
import { CURRENCIES, CURRENCY_DATA, formatCurrency } from '../constants';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Button from './shared/Button';
import { PlusIcon, CheckIcon, StarIcon, WarningIcon, PlayIcon } from './shared/Icons';
import Modal from './shared/Modal';

interface GoalsAndBudgetsProps {
  user: User;
  goals: Goal[];
  addGoal: (name: string, targetAmount: number, videoUrl?: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  categories: Category[];
  transactions: Transaction[];
  onUpdateCategory: (category: Category) => void;
}

const SpendingBudgets: React.FC<{
    user: User, 
    categories: Category[], 
    transactions: Transaction[], 
    onUpdateCategory: (category: Category) => void 
}> = ({ user, categories, transactions, onUpdateCategory }) => {
    const expenseCategories = categories.filter(c => c.name !== 'Income');
    const [editingBudgets, setEditingBudgets] = useState<Record<string, string>>({});

    const handleBudgetChange = (categoryId: string, value: string) => {
        setEditingBudgets(prev => ({ ...prev, [categoryId]: value }));
    };

    const handleSaveBudget = (category: Category) => {
        const newBudgetStr = editingBudgets[category.id];
        let updatedCategory: Category;
        let newBudgetValue: number | undefined;

        if (newBudgetStr === '' || newBudgetStr === null || newBudgetStr === undefined) {
            const { budget, ...rest } = category;
            updatedCategory = rest;
            newBudgetValue = undefined;
        } else {
            const newBudget = parseFloat(newBudgetStr);
            if (!isNaN(newBudget) && newBudget >= 0) {
                updatedCategory = { ...category, budget: newBudget };
                newBudgetValue = newBudget;
            } else {
                // Invalid input, just revert
                setEditingBudgets(prev => {
                    const newEditing = { ...prev };
                    delete newEditing[category.id];
                    return newEditing;
                });
                return;
            }
        }
        
        const originalBudget = category.budget;
        onUpdateCategory(updatedCategory);
        
        // Parental alert on budget change
        if (user.parentalControls.notificationsEnabled) {
            const budgetChanged = newBudgetValue !== originalBudget;
            if (budgetChanged) {
                 setTimeout(() => {
                    let message = '';
                    if (originalBudget === undefined && newBudgetValue !== undefined) {
                        // Budget CREATED
                        message = `Parent Notification:\nA new budget for "${category.name}" was set to ${formatCurrency(newBudgetValue, user.currency)}.`;
                    } else if (originalBudget !== undefined && newBudgetValue !== undefined) {
                        // Budget UPDATED
                        message = `Parent Notification:\nThe budget for "${category.name}" was changed from ${formatCurrency(originalBudget, user.currency)} to ${formatCurrency(newBudgetValue, user.currency)}.`;
                    } else if (originalBudget !== undefined && newBudgetValue === undefined) {
                        // Budget REMOVED
                        message = `Parent Notification:\nThe budget for "${category.name}" (${formatCurrency(originalBudget, user.currency)}) was removed.`;
                    }
                    
                    if (message) {
                        alert(message);
                    }
                }, 500);
            }
        }


        setEditingBudgets(prev => {
            const newEditing = { ...prev };
            delete newEditing[category.id];
            return newEditing;
        });
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlySpending = expenseCategories.reduce((acc, cat) => {
        const spending = transactions
            .filter(t => t.categoryId === cat.id && new Date(t.date) >= startOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);
        acc[cat.id] = spending;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-4">
            {expenseCategories.map(cat => {
                const spending = monthlySpending[cat.id] ?? 0;
                const budget = cat.budget;
                const isOverBudget = budget !== undefined && budget > 0 && spending > budget;

                return (
                    <Card key={cat.id}>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-lg font-bold truncate">{cat.emoji} {cat.name}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <input
                                    type="number"
                                    placeholder="No Budget"
                                    value={editingBudgets[cat.id] ?? cat.budget?.toString() ?? ''}
                                    onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                                    className="w-28 bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-2 py-1 text-right"
                                />
                                {editingBudgets[cat.id] !== undefined && (
                                    <Button onClick={() => handleSaveBudget(cat)} size="sm">Save</Button>
                                )}
                            </div>
                        </div>
                        {(cat.budget !== undefined && cat.budget > 0) && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-semibold text-brand-text-secondary">Spent: {formatCurrency(spending, user.currency)}</span>
                                    <span className="font-semibold">Budget: {formatCurrency(cat.budget, user.currency)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <ProgressBar 
                                        value={spending} 
                                        max={cat.budget} 
                                        color={isOverBudget ? 'bg-red-500' : 'bg-brand-green'}
                                        className={isOverBudget ? 'animate-pulse' : ''}
                                    />
                                    {isOverBudget && <div className="text-red-500"><WarningIcon /></div>}
                                </div>
                            </div>
                        )}
                    </Card>
                )
            })}
        </div>
    );
};


const GoalsAndBudgets: React.FC<GoalsAndBudgetsProps> = ({ user, goals, addGoal, contributeToGoal, categories, transactions, onUpdateCategory }) => {
  const currencySymbol = CURRENCIES[user.currency].symbol;
  const sampleContribution = CURRENCY_DATA[user.currency].sampleContribution;
  const sampleGoal = CURRENCY_DATA[user.currency].sampleGoal;
  const [activeTab, setActiveTab] = useState<'goals' | 'budgets'>('goals');
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalVideoUrl, setGoalVideoUrl] = useState('');
  const [viewingVideoUrl, setViewingVideoUrl] = useState<string | null>(null);
  
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalName.trim() && parseFloat(goalAmount) > 0) {
      addGoal(goalName.trim(), parseFloat(goalAmount), goalVideoUrl.trim());
      setGoalName('');
      setGoalAmount('');
      setGoalVideoUrl('');
      setShowAddForm(false);
    }
  };

  const handleOpenContribute = (goal: Goal) => {
      setContributeGoal(goal);
      setContributionAmount(sampleContribution.toString());
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (contributeGoal && contributionAmount) {
          const amount = parseFloat(contributionAmount);
          if (amount > 0) {
              contributeToGoal(contributeGoal.id, amount);
              setContributeGoal(null);
              setContributionAmount('');
          }
      }
  }

  const getYouTubeEmbedUrl = (url: string): string | null => {
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.substring(1);
        }
    } catch (error) {
        console.error("Invalid URL for video goal", error);
        return null;
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Goals & Budgets</h1>
        <button onClick={() => activeTab === 'goals' && setShowAddForm(!showAddForm)} className={`p-2 rounded-full transition-colors ${activeTab === 'goals' ? 'bg-brand-green hover:bg-emerald-600' : 'bg-gray-500 cursor-not-allowed'}`} disabled={activeTab !== 'goals'}>
            <PlusIcon />
        </button>
      </div>

       <div className="flex border-b border-brand-blue-light mb-6">
            <button onClick={() => setActiveTab('goals')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'goals' ? 'border-b-2 border-brand-green text-brand-text' : 'text-brand-text-secondary hover:text-white'}`}>
                Savings Goals
            </button>
            <button onClick={() => setActiveTab('budgets')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'budgets' ? 'border-b-2 border-brand-green text-brand-text' : 'text-brand-text-secondary hover:text-white'}`}>
                Spending Budgets
            </button>
        </div>

      {activeTab === 'goals' && (
          <>
            {showAddForm && (
                <Card className="mb-6">
                <form onSubmit={handleAddGoal} className="space-y-4">
                    <h2 className="text-xl font-bold">Add a New Goal</h2>
                    <div>
                    <label htmlFor="goalName" className="block text-sm font-medium text-brand-text-secondary mb-1">Goal Name</label>
                    <input
                        id="goalName"
                        type="text"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        placeholder="e.g., New Skateboard"
                        className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                        required
                    />
                    </div>
                    <div>
                    <label htmlFor="goalAmount" className="block text-sm font-medium text-brand-text-secondary mb-1">Target Amount ({currencySymbol})</label>
                    <input
                        id="goalAmount"
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        placeholder={`e.g., ${sampleGoal}`}
                        className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                        required
                    />
                    </div>
                    <div>
                        <label htmlFor="goalVideoUrl" className="block text-sm font-medium text-brand-text-secondary mb-1">Motivational Video URL (Optional)</label>
                        <input
                            id="goalVideoUrl"
                            type="url"
                            value={goalVideoUrl}
                            onChange={(e) => setGoalVideoUrl(e.target.value)}
                            placeholder="e.g., YouTube link"
                            className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-4">
                    <Button type="button" onClick={() => setShowAddForm(false)} variant="secondary">Cancel</Button>
                    <Button type="submit" variant="primary">Save Goal</Button>
                    </div>
                </form>
                </Card>
            )}

            <div className="space-y-4">
                {goals.length > 0 ? goals.map(goal => {
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                return (
                    <Card key={goal.id}>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-lg font-bold">{goal.emoji} {goal.name}</span>
                            <p className="font-semibold text-brand-text-secondary text-sm">{formatCurrency(goal.currentAmount, user.currency)} / <span className="text-brand-text">{formatCurrency(goal.targetAmount, user.currency)}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            {goal.videoUrl && (
                                <Button onClick={() => setViewingVideoUrl(goal.videoUrl || null)} variant="secondary" size="sm" className="!p-2" aria-label="Watch motivational video">
                                    <PlayIcon />
                                </Button>
                            )}
                            {isCompleted ? (
                                <div className="flex items-center gap-2 text-brand-yellow font-bold bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full text-sm">
                                    <CheckIcon />
                                    <span>Completed!</span>
                                    <div className="flex items-center gap-1">
                                        <StarIcon /> +50 XP
                                    </div>
                                </div>
                            ) : (
                                <Button onClick={() => handleOpenContribute(goal)} variant="secondary" size="sm">+ {formatCurrency(sampleContribution, user.currency)}</Button>
                            )}
                        </div>
                    </div>
                    <ProgressBar value={goal.currentAmount} max={goal.targetAmount} color={isCompleted ? 'bg-brand-yellow' : 'bg-brand-green'} />
                    </Card>
                )
                }) : (
                <Card className="text-center py-10">
                    <p className="text-brand-text-secondary">You haven't set any goals yet.</p>
                    <p>What are you saving for?</p>
                </Card>
                )}
            </div>
          </>
      )}

      {activeTab === 'budgets' && (
          <SpendingBudgets 
            user={user}
            categories={categories}
            transactions={transactions}
            onUpdateCategory={onUpdateCategory}
          />
      )}

      {viewingVideoUrl && (
        <Modal title="Goal Motivation" onClose={() => setViewingVideoUrl(null)}>
            {(() => {
                const embedUrl = getYouTubeEmbedUrl(viewingVideoUrl);
                if (embedUrl) {
                    return (
                        <div className="w-full" style={{ aspectRatio: '16 / 9' }}>
                            <iframe 
                                src={embedUrl}
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="w-full h-full rounded-lg"
                            ></iframe>
                        </div>
                    );
                }
                return (
                    <div>
                        <p className="text-brand-text-secondary mb-4">
                            This video can't be embedded. You can watch it here:
                        </p>
                        <a 
                            href={viewingVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-green hover:underline break-all"
                        >
                            {viewingVideoUrl}
                        </a>
                    </div>
                );
            })()}
        </Modal>
    )}

    {contributeGoal && (
        <Modal title={`Contribute to ${contributeGoal.name}`} onClose={() => setContributeGoal(null)}>
            <form onSubmit={handleContributeSubmit} className="space-y-4">
                <p className="text-brand-text-secondary">How much do you want to add to this goal?</p>
                <div>
                    <label htmlFor="contributeAmount" className="block text-sm font-medium text-brand-text-secondary mb-1">Amount ({currencySymbol})</label>
                    <input 
                        id="contributeAmount"
                        type="number"
                        step="0.01"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="w-full bg-brand-blue-light text-2xl font-bold p-2 rounded-md border-2 border-transparent focus:border-brand-green focus:ring-0 text-center"
                        autoFocus
                    />
                </div>
                <div className="flex gap-4 mt-6">
                    <Button type="button" onClick={() => setContributeGoal(null)} variant="secondary">Cancel</Button>
                    <Button type="submit" variant="primary">Contribute</Button>
                </div>
            </form>
        </Modal>
    )}
    </div>
  );
};

export default GoalsAndBudgets;