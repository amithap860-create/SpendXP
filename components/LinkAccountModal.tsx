
import React, { useState, useEffect } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { BankIcon, CreditCardIcon, ShieldCheckIcon, LockIcon } from './shared/Icons';
import { Currency } from '../types';

interface LinkAccountModalProps {
  onClose: () => void;
  onLink: (provider: string, type: 'Bank' | 'Card') => void;
  currency: Currency;
}

const REGIONAL_BANKS: Record<string, { name: string, icon: string, color: string }[]> = {
  'USD': [
    { name: 'Chase', icon: '🏦', color: 'bg-blue-600' },
    { name: 'Bank of America', icon: '🏛️', color: 'bg-red-600' },
    { name: 'Wells Fargo', icon: '🏰', color: 'bg-yellow-600' },
    { name: 'Citi', icon: '💳', color: 'bg-blue-400' },
    { name: 'Capital One', icon: '🛡️', color: 'bg-blue-800' },
  ],
  'CAD': [
      { name: 'RBC Royal Bank', icon: '🦁', color: 'bg-blue-700' },
      { name: 'TD Canada Trust', icon: '🟩', color: 'bg-green-600' },
      { name: 'Scotiabank', icon: '🌎', color: 'bg-red-600' },
      { name: 'BMO', icon: 'Ⓜ️', color: 'bg-blue-600' },
      { name: 'CIBC', icon: '🏦', color: 'bg-red-700' },
  ],
  'GBP': [
      { name: 'HSBC UK', icon: '🔴', color: 'bg-red-600' },
      { name: 'Barclays', icon: '🦅', color: 'bg-blue-400' },
      { name: 'Lloyds Bank', icon: '🐎', color: 'bg-green-700' },
      { name: 'NatWest', icon: '🔺', color: 'bg-purple-700' },
      { name: 'Santander UK', icon: '🔥', color: 'bg-red-600' },
  ],
  'EUR': [
      { name: 'Deutsche Bank', icon: '🟦', color: 'bg-blue-800' },
      { name: 'BNP Paribas', icon: '🟩', color: 'bg-green-700' },
      { name: 'Santander', icon: '🔥', color: 'bg-red-600' },
      { name: 'ING', icon: '🦁', color: 'bg-orange-500' },
      { name: 'Société Générale', icon: '⬛', color: 'bg-red-600' },
  ],
  'INR': [
    { name: 'SBI', icon: '🏦', color: 'bg-blue-500' },
    { name: 'HDFC Bank', icon: '🟥', color: 'bg-blue-800' },
    { name: 'ICICI Bank', icon: '🟠', color: 'bg-orange-600' },
    { name: 'Axis Bank', icon: '📐', color: 'bg-pink-700' },
    { name: 'Kotak', icon: '📦', color: 'bg-red-500' },
  ],
  'AUD': [
      { name: 'CommBank', icon: '🟡', color: 'bg-yellow-500' },
      { name: 'Westpac', icon: '🇼', color: 'bg-red-600' },
      { name: 'ANZ', icon: '🔵', color: 'bg-blue-700' },
      { name: 'NAB', icon: '⭐', color: 'bg-red-700' },
      { name: 'Macquarie', icon: '⚫', color: 'bg-gray-800' },
  ],
  'SGD': [
      { name: 'DBS', icon: '🔺', color: 'bg-red-600' },
      { name: 'OCBC', icon: '⛵', color: 'bg-red-500' },
      { name: 'UOB', icon: '🏢', color: 'bg-blue-900' },
      { name: 'Standard Chartered', icon: '🟢', color: 'bg-blue-500' },
  ],
  'AED': [
      { name: 'FAB', icon: '🏦', color: 'bg-blue-800' },
      { name: 'Emirates NBD', icon: '🇦🇪', color: 'bg-blue-600' },
      { name: 'ADCB', icon: '🟥', color: 'bg-red-600' },
      { name: 'Dubai Islamic Bank', icon: '🕌', color: 'bg-green-700' },
  ],
  'JPY': [
      { name: 'Mitsubishi UFJ', icon: '🔴', color: 'bg-red-600' },
      { name: 'SMBC', icon: '🟢', color: 'bg-green-600' },
      { name: 'Mizuho', icon: '🔵', color: 'bg-blue-700' },
      { name: 'Japan Post Bank', icon: '📮', color: 'bg-green-500' },
  ],
  'CNY': [
      { name: 'ICBC', icon: '🏦', color: 'bg-red-600' },
      { name: 'Bank of China', icon: '🇨🇳', color: 'bg-red-700' },
      { name: 'China Construction', icon: '🏗️', color: 'bg-blue-700' },
      { name: 'Agricultural Bank', icon: '🌾', color: 'bg-green-700' },
  ],
  'ZAR': [
      { name: 'Standard Bank', icon: '🔵', color: 'bg-blue-600' },
      { name: 'Absa', icon: '🔴', color: 'bg-red-600' },
      { name: 'FirstRand', icon: '🦁', color: 'bg-orange-600' },
      { name: 'Nedbank', icon: '🟢', color: 'bg-green-700' },
  ],
  'BRL': [
      { name: 'Itaú', icon: '🟧', color: 'bg-orange-500' },
      { name: 'Bradesco', icon: '🟥', color: 'bg-red-600' },
      { name: 'Banco do Brasil', icon: '🇧🇷', color: 'bg-yellow-500' },
      { name: 'Nubank', icon: '🟣', color: 'bg-purple-600' },
  ],
  'RUB': [
      { name: 'Sberbank', icon: '🟢', color: 'bg-green-600' },
      { name: 'Tinkoff', icon: '🟡', color: 'bg-yellow-500' },
      { name: 'VTB', icon: '🔵', color: 'bg-blue-700' },
      { name: 'Alfa-Bank', icon: '🅰️', color: 'bg-red-600' },
      { name: 'Gazprombank', icon: '⛽', color: 'bg-blue-800' },
  ],
};

const GENERIC_BANKS = [
    { name: 'National Bank', icon: '🏦', color: 'bg-blue-600' },
    { name: 'City Bank', icon: '🏙️', color: 'bg-gray-600' },
    { name: 'Global Trust', icon: '🌐', color: 'bg-green-600' },
    { name: 'Local Credit Union', icon: '🤝', color: 'bg-teal-600' },
    { name: 'Neo Bank', icon: '📱', color: 'bg-purple-600' },
];

const LinkAccountModal: React.FC<LinkAccountModalProps> = ({ onClose, onLink, currency }) => {
  const [step, setStep] = useState<'select' | 'credentials' | 'connecting' | 'success'>('select');
  const [selectedBank, setSelectedBank] = useState<{name: string, icon: string} | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const banksToShow = REGIONAL_BANKS[currency] || GENERIC_BANKS;

  const handleSelect = (bank: { name: string, icon: string }) => {
      setSelectedBank(bank);
      setStep('credentials');
  };

  const handleConnect = (e: React.FormEvent) => {
      e.preventDefault();
      setStep('connecting');
      // Simulate network delay
      setTimeout(() => {
          setStep('success');
      }, 2500);
  };

  const handleFinalize = () => {
      if (selectedBank) {
          onLink(selectedBank.name, 'Bank');
      }
  };

  return (
    <Modal title={step === 'success' ? "Account Linked!" : "Secure Connect"} onClose={onClose}>
        {step === 'select' && (
            <div className="space-y-4">
                <p className="text-brand-text-secondary text-center mb-4">Select your financial institution ({currency})</p>
                <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {banksToShow.map(bank => (
                        <button 
                            key={bank.name}
                            onClick={() => handleSelect(bank)}
                            className="flex items-center gap-4 p-3 rounded-lg bg-brand-blue-light hover:bg-brand-blue border border-transparent hover:border-brand-blue-light transition-all text-left"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${bank.color} text-white flex-shrink-0`}>
                                {bank.icon}
                            </div>
                            <span className="font-bold">{bank.name}</span>
                        </button>
                    ))}
                </div>
                 <div className="mt-6 text-xs text-center text-brand-text-secondary flex items-center justify-center gap-1 opacity-70">
                    <LockIcon />
                    <span>End-to-end encrypted via Plaid-Sim</span>
                </div>
            </div>
        )}

        {step === 'credentials' && selectedBank && (
            <form onSubmit={handleConnect} className="space-y-4">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{selectedBank.icon}</div>
                    <h3 className="font-bold text-xl">Log in to {selectedBank.name}</h3>
                </div>
                <div>
                    <label className="block text-xs font-bold text-brand-text-secondary uppercase mb-1">Username / User ID</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-green focus:ring-0 rounded-md px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-brand-text-secondary uppercase mb-1">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-green focus:ring-0 rounded-md px-3 py-2"
                        required
                    />
                </div>
                <div className="flex gap-3 mt-6">
                    <Button type="button" variant="secondary" onClick={() => setStep('select')}>Back</Button>
                    <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center gap-2">
                        <ShieldCheckIcon /> Secure Login
                    </Button>
                </div>
            </form>
        )}

        {step === 'connecting' && (
            <div className="text-center py-8 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
                <p className="font-bold">Verifying credentials...</p>
                <p className="text-xs text-brand-text-secondary">This may take a few moments.</p>
            </div>
        )}

        {step === 'success' && (
            <div className="text-center py-6 space-y-4">
                 <div className="text-6xl text-brand-green mx-auto animate-bounce">
                     <ShieldCheckIcon />
                 </div>
                 <h3 className="text-xl font-bold">Successfully Connected!</h3>
                 <p className="text-brand-text-secondary">Your transactions will now sync automatically.</p>
                 <Button onClick={handleFinalize} variant="primary" className="w-full mt-4">
                     Return to Profile
                 </Button>
            </div>
        )}
    </Modal>
  );
};

export default LinkAccountModal;