
import React, { useState } from 'react';
import { User, Currency, Investment, LinkedAccount } from '../types';
import { CURRENCIES, CURRENCY_DATA, formatCurrency } from '../constants';
import Card from './shared/Card';
import Button from './shared/Button';
import { UserCircleIcon, FireIcon, ChartLineIcon, PlusIcon, TrashIcon, BellIcon, MailIcon, SunIcon, MoonIcon, ShieldCheckIcon, BankIcon, UserGroupIcon, LockIcon, ShareIcon, CheckIcon } from './shared/Icons';
import ProgressBar from './shared/ProgressBar';
import Modal from './shared/Modal';
import LinkAccountModal from './LinkAccountModal';


interface ProfileProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onViewTutorial: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onLogout: () => void;
    onUpdateSecurity: (enabled: boolean, newPin?: string) => Promise<void>;
    onEnterParentMode: () => void;
    onLinkAccount: (provider: string, type: 'Bank' | 'Card') => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onViewTutorial, theme, onToggleTheme, onLogout, onUpdateSecurity, onEnterParentMode, onLinkAccount }) => {
    const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    
    // Security Modal State
    const [securityMode, setSecurityMode] = useState<'toggle' | 'change-pin'>('toggle');
    const [pin, setPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [securityError, setSecurityError] = useState('');
    
    // Share Feedback State
    const [shareFeedback, setShareFeedback] = useState(false);

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCurrency = e.target.value as Currency;
        onUpdateUser({ ...user, currency: newCurrency });
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSecurityError('');

        if (securityMode === 'change-pin') {
            if (newPin.length < 4) {
                setSecurityError('PIN must be at least 4 digits');
                return;
            }
            if (newPin !== confirmNewPin) {
                setSecurityError('PINs do not match');
                return;
            }
            await onUpdateSecurity(true, newPin);
            setShowSecurityModal(false);
            setNewPin('');
            setConfirmNewPin('');
            alert("PIN Updated Successfully");
        } else {
            // Toggle Mode
            await onUpdateSecurity(!user.security?.twoFactorEnabled);
            setShowSecurityModal(false);
        }
    };
    
    const handleLinkAccountSubmit = (provider: string, type: 'Bank' | 'Card') => {
        onLinkAccount(provider, type);
        setShowLinkAccountModal(false);
    }

    const handleShareApp = async () => {
        const shareData = {
            title: 'SpendXP',
            text: 'Level up your financial skills with SpendXP! 🚀',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            setShareFeedback(true);
            setTimeout(() => setShareFeedback(false), 2000);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Profile</h1>
                <Button onClick={onEnterParentMode} variant="secondary" size="sm" className="flex items-center gap-1 text-xs !py-1">
                    <UserGroupIcon /> Parent Mode
                </Button>
            </div>

            <Card className="text-center">
                <div className="flex flex-col items-center">
                    <UserCircleIcon />
                    <h2 className="text-2xl font-bold mt-2">{user.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-brand-text-secondary">
                        <span>Level {user.level}</span>
                        <div className="flex items-center gap-1">
                            <FireIcon /> {user.streak} Day Streak
                        </div>
                    </div>
                    <div className="w-full mt-4">
                        <p className="text-sm text-brand-text-secondary mb-1">XP Progress</p>
                        <ProgressBar value={user.xp} max={user.xpToNextLevel} color="bg-brand-yellow"/>
                        <p className="text-xs mt-1">{user.xp} / {user.xpToNextLevel} XP</p>
                    </div>
                </div>
            </Card>
            
             <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><BankIcon /> Linked Accounts</h2>
                    <Button onClick={() => setShowLinkAccountModal(true)} size="sm" variant="secondary"><PlusIcon /></Button>
                </div>
                <div className="space-y-3">
                    {user.linkedAccounts && user.linkedAccounts.length > 0 ? (
                        user.linkedAccounts.map(acc => (
                            <div key={acc.id} className="flex justify-between items-center p-3 bg-brand-blue-light rounded-lg">
                                <div>
                                    <p className="font-semibold">{acc.provider} {acc.type}</p>
                                    <p className="text-xs text-brand-text-secondary">{acc.mask}</p>
                                </div>
                                <span className="text-xs text-brand-green font-bold border border-brand-green px-2 py-1 rounded-full bg-brand-green/10">Linked</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-brand-text-secondary text-sm py-2">No accounts linked yet.</p>
                    )}
                </div>
            </Card>
            
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheckIcon /> Security</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-brand-blue-light p-3 rounded-lg">
                        <div>
                            <p className="font-bold text-sm">Two-Step Verification</p>
                            <p className="text-xs text-brand-text-secondary">Require PIN at login</p>
                        </div>
                         <div className={`w-10 h-5 rounded-full relative transition-colors ${user.security?.twoFactorEnabled ? 'bg-brand-green' : 'bg-gray-600'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${user.security?.twoFactorEnabled ? 'translate-x-5' : ''}`}></div>
                         </div>
                    </div>
                    
                    <Button 
                        onClick={() => {
                            setSecurityMode('change-pin');
                            setShowSecurityModal(true);
                        }} 
                        variant="secondary" 
                        className="w-full text-sm"
                    >
                        Change Login PIN
                    </Button>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><LockIcon /> Parental Controls</h2>
                <div className="bg-brand-blue-light/50 p-4 rounded-lg border border-brand-blue-light">
                    <p className="text-sm text-brand-text-secondary mb-3">
                        These settings are managed by your parent or guardian.
                    </p>
                    
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">Spending Limit</span>
                        <span className={user.parentalControls.spendingLimitEnabled ? "text-brand-green font-bold text-sm" : "text-brand-text-secondary text-sm"}>
                            {user.parentalControls.spendingLimitEnabled 
                                ? `${formatCurrency(user.parentalControls.spendingLimitAmount || 0, user.currency)} / ${user.parentalControls.spendingLimitPeriod}` 
                                : "Disabled"}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">Alerts</span>
                         <span className={user.parentalControls.notificationsEnabled ? "text-brand-green font-bold text-sm" : "text-brand-text-secondary text-sm"}>
                            {user.parentalControls.notificationsEnabled ? "Active" : "Disabled"}
                        </span>
                    </div>
                    
                    <Button onClick={onEnterParentMode} variant="secondary" className="w-full mt-4 text-sm">
                        Manage Settings (Parent PIN Required)
                    </Button>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="theme-toggle" className="block text-sm font-medium text-brand-text-secondary">Appearance</label>
                        <button
                            id="theme-toggle"
                            onClick={onToggleTheme}
                            className="relative inline-flex items-center h-7 w-12 rounded-full transition-colors bg-brand-blue-light"
                            aria-label="Toggle theme"
                        >
                            <span
                                className={`${
                                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                } inline-flex items-center justify-center w-5 h-5 transform bg-white rounded-full transition-transform`}
                            >
                                {theme === 'dark' 
                                    ? <MoonIcon className="h-3 w-3 text-brand-purple"/> 
                                    : <SunIcon className="h-3 w-3 text-brand-yellow"/> 
                                }
                            </span>
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                         <label htmlFor="prefs-notifications" className="block text-sm font-medium text-brand-text-secondary">Receive app notifications</label>
                         <input
                            type="checkbox"
                            id="prefs-notifications"
                            checked={user.preferences?.notifications ?? true}
                            onChange={(e) => onUpdateUser({
                                ...user,
                                preferences: { ...user.preferences, notifications: e.target.checked }
                            })}
                            className="h-6 w-6 rounded text-brand-green bg-brand-background border-brand-blue-light focus:ring-brand-green focus:ring-offset-brand-blue-light"
                        />
                    </div>

                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-brand-text-secondary mb-1">Currency</label>
                        <select
                            id="currency"
                            value={user.currency}
                            onChange={handleCurrencyChange}
                            className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                        >
                            {(Object.keys(CURRENCIES) as Currency[]).map(c => (
                                <option key={c} value={c}>{CURRENCIES[c].name} ({CURRENCIES[c].symbol})</option>
                            ))}
                        </select>
                        {user.currency !== 'USD' && (
                            <p className="text-xs text-brand-text-secondary mt-1">
                                Base rate: 1 USD ≈ {CURRENCY_DATA[user.currency].multiplier} {user.currency}
                            </p>
                        )}
                    </div>
                     <Button onClick={onViewTutorial} variant="secondary" className="w-full">
                        View App Tutorial
                     </Button>
                      <a
                        href="mailto:support@spendxp.app?subject=SpendXP%20Support%20Request"
                        className="w-full text-center flex items-center justify-center gap-2 font-bold rounded-lg transition-colors bg-brand-blue-light text-brand-text-secondary hover:bg-blue-900 px-4 py-2"
                      >
                        <MailIcon />
                        Contact Support
                     </a>

                     <Button 
                        onClick={handleShareApp} 
                        variant="secondary" 
                        className={`w-full flex items-center justify-center gap-2 transition-all duration-300 ${shareFeedback ? 'bg-brand-green text-white hover:bg-brand-green' : ''}`}
                    >
                        {shareFeedback ? <CheckIcon /> : <ShareIcon />} 
                        {shareFeedback ? 'Copied Link!' : 'Share SpendXP'}
                    </Button>
                     
                     <Button onClick={onLogout} variant="secondary" className="w-full mt-4 !text-red-400 hover:!bg-red-900/20 hover:!text-red-300 border border-transparent hover:border-red-900/30">
                        Log Out
                     </Button>
                </div>
            </Card>
            
            {showSecurityModal && (
                <Modal title="Update Security PIN" onClose={() => setShowSecurityModal(false)}>
                    <form onSubmit={handleSecuritySubmit} className="space-y-4">
                        <p className="text-brand-text-secondary text-sm">Create a new 4-digit PIN to secure your account.</p>
                        <div>
                            <label htmlFor="newPin" className="block text-sm font-medium text-brand-text-secondary mb-1">New PIN</label>
                            <input
                                id="newPin"
                                type="password"
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center tracking-widest text-xl"
                                maxLength={6}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmNewPin" className="block text-sm font-medium text-brand-text-secondary mb-1">Confirm PIN</label>
                            <input
                                id="confirmNewPin"
                                type="password"
                                value={confirmNewPin}
                                onChange={(e) => setConfirmNewPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center tracking-widest text-xl"
                                maxLength={6}
                                required
                            />
                        </div>
                        {securityError && <p className="text-red-400 text-xs text-center">{securityError}</p>}
                        <div className="flex gap-4 mt-4">
                            <Button type="button" onClick={() => setShowSecurityModal(false)} variant="secondary" className="w-1/2">Cancel</Button>
                            <Button type="submit" variant="primary" className="w-1/2">Save PIN</Button>
                        </div>
                    </form>
                </Modal>
            )}
            
            {showLinkAccountModal && (
                <LinkAccountModal 
                    onClose={() => setShowLinkAccountModal(false)}
                    onLink={handleLinkAccountSubmit}
                    currency={user.currency}
                />
            )}
        </div>
    );
};

export default Profile;
