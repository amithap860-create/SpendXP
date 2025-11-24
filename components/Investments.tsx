
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, Investment, InvestmentModule } from '../types';
import { CURRENCIES, formatCurrency, INVESTMENT_MODULES } from '../constants';
import Card from './shared/Card';
import Button from './shared/Button';
import { TrendingUpIcon, BookOpenIcon, PlusIcon, TrashIcon, CheckIcon, SparklesIcon, LockIcon } from './shared/Icons';
import Modal from './shared/Modal';
import InvestmentModal from './InvestmentModal';
import ProgressBar from './shared/ProgressBar';

interface InvestmentsProps {
    user: User;
    investments: Investment[];
    onAddInvestment: (investment: Omit<Investment, 'id'>) => void;
    onUpdateInvestment: (investment: Investment) => void;
    onDeleteInvestment: (investmentId: string) => void;
    onCompleteModule: (moduleId: string, xp: number) => void;
    completedModules: Set<string>;
}

const Investments: React.FC<InvestmentsProps> = ({ user, investments, onAddInvestment, onUpdateInvestment, onDeleteInvestment, onCompleteModule, completedModules }) => {
    // Level 2 required to access portfolio tracking
    const MIN_LEVEL_FOR_PORTFOLIO = 2;
    const isPortfolioLocked = user.level < MIN_LEVEL_FOR_PORTFOLIO;

    const [activeTab, setActiveTab] = useState<'portfolio' | 'learn'>(isPortfolioLocked ? 'learn' : 'portfolio');
    const [isInvestmentModalOpen, setInvestmentModalOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    
    // Analysis State
    const [analyzingStock, setAnalyzingStock] = useState<Investment | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Security: Rate Limit for Analysis
    const lastAnalysisTime = useRef<number>(0);
    
    // Securely retrieve API Key: Support both Vite (import.meta.env) and Legacy/Node (process.env)
    const getApiKey = () => {
        try {
            // @ts-ignore
            if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
                // @ts-ignore
                return import.meta.env.VITE_API_KEY;
            }
        } catch (e) {
            // Ignore
        }
        return process.env.API_KEY;
    };

    useEffect(() => {
        if (isPortfolioLocked && activeTab === 'portfolio') {
            setActiveTab('learn');
        }
    }, [isPortfolioLocked]);

    // -- Portfolio Logic --

    const handleOpenInvestmentModal = (investment: Investment | null) => {
        setEditingInvestment(investment);
        setInvestmentModalOpen(true);
    };

    const handleSaveInvestment = (investmentData: Omit<Investment, 'id'> | Investment) => {
        if ('id' in investmentData) {
            onUpdateInvestment(investmentData);
        } else {
            onAddInvestment(investmentData);
        }
        setInvestmentModalOpen(false);
    };

    const handleAnalyzeStock = async (investment: Investment) => {
        if (!investment.ticker && !investment.accountName) return;
        
        // Security: Rate Limiting
        const now = Date.now();
        if (now - lastAnalysisTime.current < 5000) {
            alert("Please wait a few seconds before requesting another analysis.");
            return;
        }
        
        const apiKey = getApiKey();
        if (!apiKey) {
            setAnalyzingStock(investment); // Open modal to show error
            setAnalysisResult("System Error: API Key not found. Please check your configuration.");
            return;
        }

        setAnalyzingStock(investment);
        setAnalysisResult(null);
        setIsAnalyzing(true);
        lastAnalysisTime.current = now;

        try {
             const ai = new GoogleGenAI({ apiKey: apiKey });
             const target = investment.ticker ? `$${investment.ticker}` : investment.accountName;
             
             const prompt = `Act as a savvy financial analyst for a teenager. 
             Analyze the company or asset: "${target}".
             Please provide the following in a fun, engaging, and easy-to-understand format:
             1. 🏢 **What is it?**: Explain what they do in 1 simple sentence.
             2. 📰 **The Latest**: Summarize recent news or quarterly report highlights simply (Are they winning or losing right now?).
             3. 🐂 **Bull Case**: 1 strong reason why the price might go UP.
             4. 🐻 **Bear Case**: 1 strong reason why the price might go DOWN.
             
             Use emojis and keep it short!`;

             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
             });
             
             setAnalysisResult(response.text);

        } catch (error) {
            console.error(error);
            setAnalysisResult("Oops! Couldn't fetch the market data right now. My brain circuits are a bit fried 🔌");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // -- Learning Logic --

    const handleStartModule = (module: InvestmentModule) => {
        if (completedModules.has(module.id)) return;
        setActiveModule(module);
        setQuizStatus('reading');
    };

    const handleQuizAnswer = (optionIndex: number) => {
        if (!activeModule) return;
        if (optionIndex === activeModule.quiz.correctAnswer) {
            setQuizStatus('success');
            onCompleteModule(activeModule.id, activeModule.xpReward);
        } else {
            alert("Not quite! Re-read the section and try again. 📉");
        }
    };

    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);

    // Module State
    const [activeModule, setActiveModule] = useState<InvestmentModule | null>(null);
    const [quizStatus, setQuizStatus] = useState<'reading' | 'quiz' | 'success'>('reading');

    return (
        <div className="animate-fade-in space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Investments</h1>
                <div className="flex bg-brand-blue-light rounded-lg p-1">
                    <button 
                        onClick={() => !isPortfolioLocked && setActiveTab('portfolio')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors relative ${activeTab === 'portfolio' ? 'bg-brand-green text-white shadow-sm' : 'text-brand-text-secondary hover:text-white'} ${isPortfolioLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <span className="flex items-center gap-2">
                            {isPortfolioLocked ? <LockIcon /> : <TrendingUpIcon />} 
                            Portfolio
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('learn')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'learn' ? 'bg-brand-green text-white shadow-sm' : 'text-brand-text-secondary hover:text-white'}`}
                    >
                         <span className="flex items-center gap-2"><BookOpenIcon /> Learn</span>
                    </button>
                </div>
            </div>

            {activeTab === 'portfolio' && !isPortfolioLocked && (
                <div className="space-y-6 animate-fade-in">
                     <Card className="text-center bg-gradient-to-b from-brand-blue to-brand-blue-light border border-brand-border">
                        <p className="text-brand-text-secondary text-sm mb-1">Virtual Portfolio Value</p>
                        <p className="text-4xl font-bold text-brand-green">{formatCurrency(totalValue, user.currency)}</p>
                        <p className="text-xs text-brand-text-secondary mt-2 opacity-75">Simulate your gains before you invest real money.</p>
                    </Card>

                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Watchlist & Portfolio</h2>
                        <Button onClick={() => handleOpenInvestmentModal(null)} size="sm" className="flex items-center gap-1">
                            <PlusIcon /> Track Asset
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {investments.length > 0 ? investments.map(inv => (
                            <Card key={inv.id} className="relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-brand-blue-light">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-lg text-brand-text">{inv.accountName}</span>
                                            {inv.ticker && (
                                                <span className="text-xs font-mono font-bold bg-brand-blue-light text-brand-text-secondary px-2 py-0.5 rounded border border-brand-blue-light/50">
                                                    {inv.ticker}
                                                </span>
                                            )}
                                        </div>
                                        <span className="self-start text-[10px] uppercase tracking-wider font-bold bg-brand-purple bg-opacity-10 text-brand-purple px-2 py-0.5 rounded-full border border-brand-purple border-opacity-20">
                                            {inv.type}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-brand-green">{formatCurrency(inv.currentValue, user.currency)}</p>
                                        <p className="text-xs font-medium text-brand-text-secondary mt-0.5">
                                            Est. <span className="text-brand-green">+{inv.projectedGrowth}%</span> / yr
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pt-3 border-t border-brand-blue-light border-opacity-50">
                                    <Button 
                                        onClick={() => handleAnalyzeStock(inv)} 
                                        size="sm" 
                                        variant="secondary" 
                                        className="flex-1 flex items-center justify-center gap-1.5 !bg-brand-blue-light hover:!bg-brand-teal hover:!text-white transition-all text-xs font-bold group-hover:shadow-sm"
                                    >
                                        <SparklesIcon /> <span>AI Analysis</span>
                                    </Button>
                                    <Button 
                                        onClick={() => handleOpenInvestmentModal(inv)} 
                                        size="sm" 
                                        variant="secondary"
                                        className="!bg-brand-blue-light bg-opacity-50 hover:!bg-brand-blue-light text-xs"
                                    >
                                        Edit
                                    </Button>
                                    <button 
                                        onClick={() => onDeleteInvestment(inv.id)} 
                                        className="p-2 rounded-lg text-brand-text-secondary hover:text-white hover:bg-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon/>
                                    </button>
                                </div>
                            </Card>
                        )) : (
                            <Card className="text-center py-8 opacity-75 border-dashed border-2 border-brand-blue-light bg-transparent">
                                <p className="text-brand-text-secondary">Your watchlist is empty.</p>
                                <p className="text-sm mt-2">Add stocks or funds you are interested in to simulate how they perform!</p>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {isPortfolioLocked && activeTab === 'portfolio' && (
                 <Card className="text-center py-12 border-2 border-brand-blue-light bg-brand-blue-light bg-opacity-10">
                    <div className="flex justify-center mb-4">
                         <div className="bg-brand-blue-light p-4 rounded-full text-brand-text-secondary">
                            <LockIcon />
                         </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Locked: Investor Mode</h2>
                    <p className="text-brand-text-secondary max-w-xs mx-auto mb-6">
                        You need to understand the basics before you start tracking stocks! Reach <strong>Level {MIN_LEVEL_FOR_PORTFOLIO}</strong> to unlock this feature.
                    </p>
                    <div className="max-w-xs mx-auto mb-6">
                        <div className="flex justify-between text-xs text-brand-text-secondary mb-1">
                            <span>Current Level: {user.level}</span>
                            <span>Goal: Level {MIN_LEVEL_FOR_PORTFOLIO}</span>
                        </div>
                        <ProgressBar value={user.xp} max={user.xpToNextLevel} color="bg-brand-yellow" />
                    </div>
                    <Button onClick={() => setActiveTab('learn')} variant="primary">Go to Learn Tab</Button>
                </Card>
            )}

            {activeTab === 'learn' && (
                <div className="space-y-4 animate-fade-in">
                     <div className="bg-brand-blue-light p-4 rounded-xl mb-4 border-l-4 border-brand-yellow">
                         <h2 className="font-bold text-lg mb-1">Investment Academy 🎓</h2>
                         <p className="text-sm text-brand-text-secondary">
                            {isPortfolioLocked 
                                ? "Complete these modules and other quests to unlock the Portfolio tracker!"
                                : "Keep learning to sharpen your investor skills!"}
                         </p>
                     </div>

                    {INVESTMENT_MODULES.map(module => {
                        const isCompleted = completedModules.has(module.id);
                        return (
                            <button 
                                key={module.id} 
                                onClick={() => !isCompleted && handleStartModule(module)}
                                disabled={isCompleted}
                                className={`w-full text-left transition-all ${isCompleted ? 'opacity-70 cursor-default' : 'hover:transform hover:scale-[1.02] cursor-pointer'}`}
                            >
                                <Card className={`flex items-center gap-4 ${isCompleted ? 'border border-brand-green bg-brand-blue-light bg-opacity-20' : ''}`}>
                                    <div className="text-4xl">{module.emoji}</div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {module.title}
                                            {isCompleted && <div className="text-brand-green"><CheckIcon /></div>}
                                        </h3>
                                        <p className="text-sm text-brand-text-secondary">{module.description}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                                         {isCompleted ? (
                                             <span className="text-brand-green font-bold text-sm">Done</span>
                                         ) : (
                                             <>
                                                <span className="text-brand-yellow font-bold text-sm flex items-center gap-1">+{module.xpReward} XP</span>
                                                <span className="text-xs text-brand-text-secondary bg-brand-blue-light px-2 py-1 rounded-full mt-1">Start</span>
                                             </>
                                         )}
                                    </div>
                                </Card>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* --- MODALS --- */}

            {isInvestmentModalOpen && (
                <InvestmentModal
                    onClose={() => setInvestmentModalOpen(false)}
                    onSave={handleSaveInvestment}
                    investmentToEdit={editingInvestment}
                    currency={user.currency}
                />
            )}

            {analyzingStock && (
                <Modal title={`Analyst Report: ${analyzingStock.ticker || analyzingStock.accountName}`} onClose={() => !isAnalyzing && setAnalyzingStock(null)}>
                    {isAnalyzing ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="animate-bounce text-4xl">🔮</div>
                            <p className="text-brand-text-secondary">Crunching the numbers...</p>
                            <div className="h-2 bg-brand-blue-light rounded-full w-3/4 mx-auto overflow-hidden">
                                <div className="h-full bg-brand-purple animate-pulse w-full"></div>
                            </div>
                        </div>
                    ) : (
                         <div className="prose prose-invert prose-p:text-brand-text prose-strong:text-brand-yellow prose-li:text-sm">
                            {analysisResult ? (
                                analysisResult.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)
                            ) : (
                                <p className="text-red-400 text-center">Could not generate report.</p>
                            )}
                         </div>
                    )}
                </Modal>
            )}

            {activeModule && (
                <Modal title={activeModule.title} onClose={() => setActiveModule(null)}>
                    {quizStatus === 'reading' && (
                        <div className="space-y-4 animate-fade-in">
                             {activeModule.content.map((para, i) => (
                                 <p key={i} className="text-brand-text-secondary leading-relaxed text-base">{para}</p>
                             ))}
                             <div className="pt-6">
                                 <Button onClick={() => setQuizStatus('quiz')} className="w-full text-lg py-3">Take Quiz 🧠</Button>
                             </div>
                        </div>
                    )}
                    {quizStatus === 'quiz' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-brand-blue-light p-4 rounded-lg">
                                <p className="font-bold text-lg">{activeModule.quiz.question}</p>
                            </div>
                            <div className="space-y-3">
                                {activeModule.quiz.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuizAnswer(idx)}
                                        className="w-full text-left p-4 rounded-lg bg-brand-blue hover:bg-brand-purple hover:text-white transition-colors font-medium border border-brand-blue-light"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {quizStatus === 'success' && (
                        <div className="text-center py-6 animate-fade-in">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-2xl font-bold text-brand-green mb-2">Module Complete!</h3>
                            <p className="text-brand-text-secondary mb-6">You earned <span className="text-brand-yellow font-bold">{activeModule.xpReward} XP</span>. Great job!</p>
                            <Button onClick={() => setActiveModule(null)} variant="primary" className="w-full">Awesome</Button>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default Investments;
