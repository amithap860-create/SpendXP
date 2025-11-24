
import React from 'react';
import { View } from '../types';
import { HomeIcon, GoalIcon, QuestIcon, PlusIcon, ProfileIcon, TrendingUpIcon } from './shared/Icons';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogClick: () => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-brand-green' : 'text-brand-text-secondary hover:text-white'}`}>
    {icon}
    <span className="text-[10px] mt-1">{label}</span>
  </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, onLogClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-brand-blue-light border-t border-blue-900 z-40">
      <div className="flex justify-around items-center h-full max-w-2xl mx-auto px-2">
        <NavButton label="Home" icon={<HomeIcon />} isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <NavButton label="Goals" icon={<GoalIcon />} isActive={activeView === 'goals'} onClick={() => setActiveView('goals')} />
        
        <button onClick={onLogClick} className="w-14 h-14 bg-brand-green rounded-full flex items-center justify-center text-white -mt-6 border-4 border-brand-background shadow-lg hover:bg-emerald-600 transition-transform hover:scale-110 flex-shrink-0 z-50">
          <PlusIcon />
        </button>

        <NavButton label="Invest" icon={<TrendingUpIcon />} isActive={activeView === 'investments'} onClick={() => setActiveView('investments')} />
        <NavButton label="Quests" icon={<QuestIcon />} isActive={activeView === 'quests'} onClick={() => setActiveView('quests')} />
        <NavButton label="Profile" icon={<ProfileIcon />} isActive={activeView === 'profile'} onClick={() => setActiveView('profile')} />
      </div>
    </div>
  );
};

export default BottomNav;
