
import React, { useState, useEffect } from 'react';
import { Investment, Currency } from '../types';
import { CURRENCIES } from '../constants';
import Modal from './shared/Modal';
import Button from './shared/Button';

interface InvestmentModalProps {
  onClose: () => void;
  onSave: (investment: Omit<Investment, 'id'> | Investment) => void;
  investmentToEdit: Investment | null;
  currency: Currency;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ onClose, onSave, investmentToEdit, currency }) => {
  const [accountName, setAccountName] = useState('');
  const [ticker, setTicker] = useState('');
  const [type, setType] = useState<Investment['type']>('Stocks');
  const [currentValue, setCurrentValue] = useState('');
  const [projectedGrowth, setProjectedGrowth] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (investmentToEdit) {
      setAccountName(investmentToEdit.accountName);
      setTicker(investmentToEdit.ticker || '');
      setType(investmentToEdit.type);
      setCurrentValue(investmentToEdit.currentValue.toString());
      setProjectedGrowth(investmentToEdit.projectedGrowth.toString());
    }
  }, [investmentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCurrentValue = parseFloat(currentValue);
    const numProjectedGrowth = parseFloat(projectedGrowth);

    if (!accountName.trim()) {
        setError('Please enter an account name.');
        return;
    }
    if (isNaN(numCurrentValue) || numCurrentValue < 0) {
        setError('Please enter a valid current value.');
        return;
    }
     if (isNaN(numProjectedGrowth) || numProjectedGrowth < 0) {
        setError('Please enter a valid projected growth percentage.');
        return;
    }
    setError('');

    const investmentData = {
        accountName,
        ticker: ticker.trim().toUpperCase() || undefined,
        type,
        currentValue: numCurrentValue,
        projectedGrowth: numProjectedGrowth,
    };
    
    if (investmentToEdit) {
        onSave({ ...investmentData, id: investmentToEdit.id });
    } else {
        onSave(investmentData);
    }
  };

  return (
    <Modal title={investmentToEdit ? "Edit Investment" : "Add Investment"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-brand-text-secondary mb-1">Name / Account</label>
          <input
            id="accountName"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Apple Stock"
            className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-brand-text-secondary mb-1">Stock Ticker (Optional)</label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g., AAPL"
            className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
          />
        </div>
        <div>
            <label htmlFor="type" className="block text-sm font-medium text-brand-text-secondary mb-1">Investment Type</label>
            <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as Investment['type'])}
                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
            >
                <option value="Stocks">Stocks</option>
                <option value="Crypto">Crypto</option>
                <option value="Savings">Savings Account</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div className="flex gap-4">
            <div className="w-1/2">
                <label htmlFor="currentValue" className="block text-sm font-medium text-brand-text-secondary mb-1">Value ({CURRENCIES[currency].symbol})</label>
                <input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                    required
                />
            </div>
            <div className="w-1/2">
                 <label htmlFor="projectedGrowth" className="block text-sm font-medium text-brand-text-secondary mb-1">Est. Growth (%/yr)</label>
                <input
                    id="projectedGrowth"
                    type="number"
                    step="0.1"
                    value={projectedGrowth}
                    onChange={(e) => setProjectedGrowth(e.target.value)}
                    placeholder="e.g., 8"
                    className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                    required
                />
            </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        <div className="flex justify-end gap-4 mt-6">
            <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default InvestmentModal;
