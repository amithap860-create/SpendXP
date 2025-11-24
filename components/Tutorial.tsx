import React, { useState } from 'react';
import Button from './shared/Button';
import { HomeIcon, PlusIcon, GoalIcon, ProfileIcon } from './shared/Icons';

interface TutorialProps {
    onFinish: () => void;
}

const tutorialSteps = [
    {
        title: "Welcome to SpendXP! 🚀",
        content: "Ready to level up your money skills? Let's take a quick tour of how SpendXP helps you become a financial master.",
        icon: <span className="text-5xl">👋</span>,
    },
    {
        title: "Your Dashboard 📊",
        content: "This is your home base. Here you can see your level, XP, income vs. expenses, and recent activity at a glance. It's your personal 'Money Map'!",
        icon: <HomeIcon />,
    },
    {
        title: "Log Everything! 💸",
        content: "Tap the big green '+' button to quickly log any money you spend or earn. Keeping track helps you gain XP and level up!",
        icon: <PlusIcon />,
    },
    {
        title: "Set Your Goals 🎯",
        content: "What are you saving for? Go to the Goals tab to create savings goals and track your progress towards them. Watching the bar fill up is super motivating!",
        icon: <GoalIcon />,
    },
    {
        title: "Profile & Settings ⚙️",
        content: "Check out your profile to see your stats. This is also where you can find settings, like re-watching this tutorial.",
        icon: <ProfileIcon />,
    },
    {
        title: "You're All Set! ✅",
        content: "That's the basics! Start exploring, log your first transaction, and begin your journey to financial freedom. You've got this!",
        icon: <span className="text-5xl">🎉</span>,
    }
];


const Tutorial: React.FC<TutorialProps> = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const currentStep = tutorialSteps[step];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-brand-background rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl border border-brand-blue-light">
                <div className="text-6xl mb-4 flex justify-center text-brand-green">
                    {currentStep.icon}
                </div>
                <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
                <p className="text-brand-text-secondary mb-6 min-h-[72px]">{currentStep.content}</p>
                
                <div className="flex justify-center items-center gap-2 mb-6">
                    {tutorialSteps.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === step ? 'bg-brand-green' : 'bg-brand-blue-light'}`}></div>
                    ))}
                </div>

                <div className="flex gap-4">
                    {step > 0 && (
                         <Button onClick={() => setStep(s => s - 1)} variant="secondary">Back</Button>
                    )}
                    {step < tutorialSteps.length - 1 ? (
                        <Button onClick={() => setStep(s => s + 1)} variant="primary" className="flex-grow">Next</Button>
                    ) : (
                        <Button onClick={onFinish} variant="primary" className="flex-grow">Let's Go!</Button>
                    )}
                </div>
                 {step < tutorialSteps.length - 1 && (
                     <button onClick={onFinish} className="text-xs text-brand-text-secondary hover:text-white mt-4">Skip Tutorial</button>
                )}
            </div>
        </div>
    );
};

export default Tutorial;