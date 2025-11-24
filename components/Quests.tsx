
import React, { useState, useMemo } from 'react';
import { Quest, User, Transaction, Goal, Category } from '../types';
import { QUESTS, CURRENCY_DATA, formatCurrency } from '../constants';
import Card from './shared/Card';
import Button from './shared/Button';
import { StarIcon, CheckIcon, PlayIcon } from './shared/Icons';
import ProgressBar from './shared/ProgressBar';
import VideoGuideModal from './VideoGuideModal';

interface QuestsProps {
  user: User;
  transactions: Transaction[];
  goals: Goal[];
  claimedQuests: Set<string>;
  onClaimQuest: (questId: string, xp: number) => void;
  categories: Category[];
}

const QuizQuest: React.FC<{ quest: Quest; onComplete: () => void }> = ({ quest, onComplete }) => {
    const [status, setStatus] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
    const [selected, setSelected] = useState<string | null>(null);

    const options = ["Hiding it under a mattress", "A high-yield savings account", "Spending it all immediately"];
    const correctAnswer = "A high-yield savings account";

    const handleAnswer = (answer: string) => {
        if (status !== 'unanswered') return;
        setSelected(answer);
        if (answer === correctAnswer) {
            setStatus('correct');
            onComplete();
        } else {
            setStatus('incorrect');
        }
    };

    const getButtonClass = (option: string) => {
        if (status === 'unanswered') return 'bg-brand-blue-light hover:bg-blue-900';
        if (option === selected) return option === correctAnswer ? 'bg-brand-green' : 'bg-red-500';
        if (option === correctAnswer) return 'bg-brand-green';
        return 'bg-brand-blue-light opacity-50';
    }

    return (
        <>
            <p className="text-brand-text-secondary mb-4">{quest.description}</p>
            <div className="space-y-3">
                {options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={status !== 'unanswered'}
                        className={`w-full text-left p-3 rounded-lg font-semibold transition-all duration-300 ${getButtonClass(option)}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
             {status === 'correct' && <p className="mt-4 text-brand-green font-bold text-center">Correct! Quest complete.</p>}
             {status === 'incorrect' && <p className="mt-4 text-red-500 font-bold text-center">Not quite! The correct answer is marked in green.</p>}
        </>
    );
};

type QuestCategory = 'daily' | 'weekly' | 'special';

const Quests: React.FC<QuestsProps> = ({ user, transactions, claimedQuests, onClaimQuest, categories }) => {
  const [activeTab, setActiveTab] = useState<QuestCategory>('daily');
  const [completedQuiz, setCompletedQuiz] = useState(false);
  const [viewingGuideFor, setViewingGuideFor] = useState<Quest | null>(null);
  
  const questProgress = useMemo(() => {
    const todayLocal = new Date().toLocaleDateString();
    
    const loggedToday = transactions.filter(t => {
        const category = categories.find(c => c.id === t.categoryId);
        const txDateLocal = new Date(t.date).toLocaleDateString();
        return category?.name !== 'Income' && txDateLocal === todayLocal;
    }).length;

    const savingsCategory = categories.find(c => c.name === 'Savings');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const savedThisWeek = transactions
        .filter(t => t.categoryId === savingsCategory?.id && new Date(t.date) >= oneWeekAgo)
        .reduce((sum, t) => sum + t.amount, 0);

    const budgetSpending: Record<string, number> = {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    QUESTS.forEach(quest => {
        if (quest.type === 'stayUnderBudget') {
            const categoryId = quest.target as string;
            const spending = transactions
                .filter(t => t.categoryId === categoryId && new Date(t.date) >= startOfMonth)
                .reduce((sum, t) => sum + t.amount, 0);
            budgetSpending[quest.id] = spending;
        }
    });

    return {
        logTransactions: loggedToday,
        saveToGoal: savedThisWeek,
        quiz: claimedQuests.has('q1') ? 1 : 0, // Simplified for prototype
        budgetSpending,
    };
  }, [transactions, claimedQuests, categories]);


  const isQuestComplete = (quest: Quest): boolean => {
      switch(quest.type) {
          case 'logTransactions':
              return questProgress.logTransactions >= (quest.target as number);
          case 'saveToGoal':
              const { multiplier, precision } = CURRENCY_DATA[user.currency];
              const baseTarget = quest.target as number;
              const currencyTarget = precision === 0 ? Math.round(baseTarget * multiplier) : parseFloat((baseTarget * multiplier).toFixed(precision));
              return questProgress.saveToGoal >= currencyTarget;
          case 'stayUnderBudget':
              const category = categories.find(c => c.id === quest.target);
              if (!category || category.budget === undefined) return false;
              const currentSpending = questProgress.budgetSpending[quest.id] ?? 0;
              return currentSpending <= category.budget;
          case 'quiz':
              return false;
          default:
              return false;
      }
  }
  
  const filteredQuests = useMemo(() => {
      return QUESTS.filter(q => q.category === activeTab);
  }, [activeTab]);


  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Quests</h1>
      
       <div className="flex border-b border-brand-blue-light mb-6">
            <button onClick={() => setActiveTab('daily')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'daily' ? 'border-b-2 border-brand-green text-brand-text' : 'text-brand-text-secondary hover:text-white'}`}>
                Daily
            </button>
            <button onClick={() => setActiveTab('weekly')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'weekly' ? 'border-b-2 border-brand-green text-brand-text' : 'text-brand-text-secondary hover:text-white'}`}>
                Weekly
            </button>
            <button onClick={() => setActiveTab('special')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'special' ? 'border-b-2 border-brand-green text-brand-text' : 'text-brand-text-secondary hover:text-white'}`}>
                Special Events
            </button>
        </div>

      <div className="space-y-4">
        {filteredQuests.length > 0 ? filteredQuests.map(quest => {
          const isClaimed = claimedQuests.has(quest.id);
          const isComplete = isClaimed || (quest.type === 'quiz' ? completedQuiz : isQuestComplete(quest));
          
          let progress = 0;
          let target = 0;
          let description = quest.description;
          
          const { multiplier, precision } = CURRENCY_DATA[user.currency];
          const baseTarget = quest.target as number;
          const currencyTarget = precision === 0 ? Math.round(baseTarget * multiplier) : parseFloat((baseTarget * multiplier).toFixed(precision));


          if (quest.type === 'logTransactions') {
              progress = questProgress.logTransactions;
              target = quest.target as number;
          } else if (quest.type === 'stayUnderBudget') {
              const category = categories.find(c => c.id === quest.target);
              progress = questProgress.budgetSpending[quest.id] ?? 0;
              target = category?.budget ?? 0;
          } else if (quest.type === 'saveToGoal') {
              description = quest.description.replace('{amount}', formatCurrency(currencyTarget, user.currency));
              progress = questProgress.saveToGoal;
              target = currencyTarget;
          }

          return (
            <Card key={quest.id} className={isClaimed ? 'opacity-50' : ''}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{quest.title}</h2>
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  <StarIcon /> {quest.xpReward} XP
                </div>
              </div>
              
              {quest.type === 'quiz' ? (
                <QuizQuest quest={quest} onComplete={() => setCompletedQuiz(true)} />
              ) : (
                <p className="text-brand-text-secondary mb-4">{description}</p>
              )}

               {quest.videoSearchQuery && (
                  <button 
                    onClick={() => setViewingGuideFor(quest)}
                    className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-blue-light hover:bg-blue-900 text-brand-text-secondary px-3 py-2 rounded-lg transition-colors mt-3"
                  >
                      <PlayIcon /> Watch a Guide
                  </button>
              )}

              {quest.type === 'logTransactions' && (
                <div className="mt-2">
                    <ProgressBar value={progress} max={target} />
                    <p className="text-xs text-right mt-1 text-brand-text-secondary">{progress} / {target}</p>
                </div>
              )}
               {quest.type === 'saveToGoal' && target > 0 && (
                <div className="mt-2">
                    <ProgressBar value={progress} max={target} />
                    <p className="text-xs text-right mt-1 text-brand-text-secondary">{formatCurrency(progress, user.currency)} / {formatCurrency(target, user.currency)}</p>
                </div>
              )}
              {quest.type === 'stayUnderBudget' && target > 0 && (
                <div className="mt-2">
                    <ProgressBar value={progress} max={target} color={progress > target ? 'bg-red-500' : 'bg-brand-green'} />
                    <p className="text-xs text-right mt-1 text-brand-text-secondary">{formatCurrency(progress, user.currency)} / {formatCurrency(target, user.currency)}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                {isClaimed ? (
                    <div className="flex items-center gap-2 font-bold text-brand-green">
                        <CheckIcon /> Claimed
                    </div>
                ) : (
                    <Button onClick={() => onClaimQuest(quest.id, quest.xpReward)} disabled={!isComplete}>
                        Claim Reward
                    </Button>
                )}
              </div>
            </Card>
          );
        }) : (
            <Card className="text-center py-10">
                <p className="text-brand-text-secondary">No quests in this category right now.</p>
                <p>Check back later!</p>
            </Card>
        )}
      </div>
       {viewingGuideFor && (
        <VideoGuideModal 
            quest={viewingGuideFor} 
            onClose={() => setViewingGuideFor(null)} 
        />
      )}
    </div>
  );
};

export default Quests;
