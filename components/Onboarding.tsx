
import React, { useState } from 'react';
import { Currency } from '../types';
import { CURRENCIES } from '../constants';
import Card from './shared/Card';
import Button from './shared/Button';
import { ShieldCheckIcon, LockIcon } from './shared/Icons';

interface OnboardingProps {
    onCreateAccount: (name: string, email: string, currency: Currency, pin: string) => Promise<void>;
    onLogin: (email: string, pin?: string) => Promise<void>;
    checkUser: (email: string) => { exists: boolean; hasPin: boolean; twoFactorEnabled: boolean };
    onResetPin: (email: string, newPin: string) => Promise<void>;
}

const Onboarding: React.FC<OnboardingProps> = ({ onCreateAccount, onLogin, checkUser, onResetPin }) => {
    const [step, setStep] = useState<'email' | 'login-pin' | 'signup-details' | 'signup-pin' | 'forgot-pin-code' | 'forgot-pin-new'>('email');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Forgot PIN State
    const [verificationCode, setVerificationCode] = useState('');
    const [enteredCode, setEnteredCode] = useState('');

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }
        setEmail(cleanEmail);

        const userCheck = checkUser(cleanEmail);
        
        if (userCheck.exists) {
            // User exists, force them to login flow
            if (userCheck.twoFactorEnabled && userCheck.hasPin) {
                setStep('login-pin');
            } else {
                // Legacy support: Login immediately if no security
                handleLoginAttempt(cleanEmail);
            }
        } else {
            // New user, proceed to signup
            setStep('signup-details');
        }
    };

    const handleLoginAttempt = async (emailToLog: string, pinToLog?: string) => {
        setIsLoading(true);
        setError('');
        try {
            await onLogin(emailToLog, pinToLog);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("Login failed.");
            setIsLoading(false);
        }
    };

    const handleLoginPinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) {
            setError('PIN must be 4 digits.');
            return;
        }
        handleLoginAttempt(email, pin);
    };

    const handleSignupDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters.');
            return;
        }
        setError('');
        setStep('signup-pin');
    };

    const handleSignupPinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits.');
            return;
        }
        if (pin !== confirmPin) {
            setError('PINs do not match.');
            return;
        }
        
        setIsLoading(true);
        try {
            await onCreateAccount(name.trim(), email, currency, pin);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to create account.");
            }
            setIsLoading(false);
        }
    };

    const handleForgotPinClick = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // Simulate sending email
        setTimeout(() => alert(`Your SpendXP verification code is: ${code}`), 500);
        setVerificationCode(code);
        setStep('forgot-pin-code');
        setEnteredCode('');
        setError('');
    };

    const handleForgotPinCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (enteredCode === verificationCode) {
            setStep('forgot-pin-new');
            setPin('');
            setConfirmPin('');
            setError('');
        } else {
            setError('Incorrect verification code.');
        }
    };

    const handleForgotPinNewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits.');
            return;
        }
        if (pin !== confirmPin) {
            setError('PINs do not match.');
            return;
        }
        
        setIsLoading(true);
        try {
            await onResetPin(email, pin);
            // App state will update and this component will unmount
        } catch (err) {
             if (err instanceof Error) setError(err.message);
            else setError("Failed to reset PIN.");
            setIsLoading(false);
        }
    };

    const resetFlow = () => {
        setStep('email');
        setName('');
        // Don't clear email to allow easy retry or correction
        setPin('');
        setConfirmPin('');
        setError('');
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen animate-fade-in p-4">
            <Card className="w-full max-w-sm relative">
                {step !== 'email' && (
                    <button onClick={resetFlow} className="absolute top-4 left-4 text-sm text-brand-text-secondary hover:text-brand-text">
                        &larr; Back
                    </button>
                )}
                
                <div className="text-center mb-6 mt-4">
                    <h1 className="text-3xl font-bold">SpendXP</h1>
                    <p className="text-brand-text-secondary mt-1">
                        {step === 'email' && "Secure money tracking for pros."}
                        {step === 'login-pin' && "Welcome back!"}
                        {step === 'signup-details' && "Let's get you set up."}
                        {step === 'signup-pin' && "Secure your account."}
                        {step === 'forgot-pin-code' && "Verify it's you."}
                        {step === 'forgot-pin-new' && "Set a new PIN."}
                    </p>
                </div>

                {step === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-1">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                                autoFocus
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" className="w-full">Continue</Button>
                    </form>
                )}

                {step === 'login-pin' && (
                    <form onSubmit={handleLoginPinSubmit} className="space-y-4">
                        <div className="flex justify-center mb-4 text-brand-green">
                            <ShieldCheckIcon />
                        </div>
                        <div>
                            <p className="text-center text-sm font-bold mb-4">{email}</p>
                            <label htmlFor="login-pin" className="block text-sm font-medium text-brand-text-secondary mb-1">Enter your Security PIN</label>
                            <input
                                id="login-pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center tracking-[0.5em] text-2xl font-bold"
                                maxLength={6}
                                autoFocus
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Log In'}
                        </Button>
                        <button 
                            type="button" 
                            onClick={handleForgotPinClick}
                            className="w-full text-center text-sm text-brand-text-secondary hover:text-brand-text underline"
                        >
                            Forgot PIN?
                        </button>
                    </form>
                )}
                
                {step === 'forgot-pin-code' && (
                    <form onSubmit={handleForgotPinCodeSubmit} className="space-y-4">
                        <div>
                            <p className="text-center text-sm mb-4">We sent a code to <span className="font-bold">{email}</span></p>
                            <label htmlFor="code" className="block text-sm font-medium text-brand-text-secondary mb-1">Verification Code</label>
                            <input
                                id="code"
                                type="text"
                                value={enteredCode}
                                onChange={(e) => setEnteredCode(e.target.value)}
                                placeholder="123456"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center text-xl font-bold tracking-widest"
                                autoFocus
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" className="w-full">Verify Code</Button>
                    </form>
                )}

                {step === 'forgot-pin-new' && (
                    <form onSubmit={handleForgotPinNewSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="new-pin" className="block text-sm font-medium text-brand-text-secondary mb-1">New PIN</label>
                            <input
                                id="new-pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center tracking-widest"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-new-pin" className="block text-sm font-medium text-brand-text-secondary mb-1">Confirm New PIN</label>
                            <input
                                id="confirm-new-pin"
                                type="password"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center tracking-widest"
                                maxLength={6}
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Set New PIN'}
                        </Button>
                    </form>
                )}

                {step === 'signup-details' && (
                    <form onSubmit={handleSignupDetailsSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-1">What should we call you?</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-brand-text-secondary mb-1">Choose your currency</label>
                            <select
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as Currency)}
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2"
                            >
                                {(Object.keys(CURRENCIES) as Currency[]).map(c => (
                                    <option key={c} value={c}>
                                        {CURRENCIES[c].name} ({CURRENCIES[c].symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button type="submit" variant="primary" className="w-full">Next</Button>
                    </form>
                )}

                {step === 'signup-pin' && (
                    <form onSubmit={handleSignupPinSubmit} className="space-y-4">
                        <div className="bg-brand-blue-light bg-opacity-30 p-4 rounded-lg text-sm text-brand-text-secondary mb-4 border border-brand-blue-light">
                            <p className="flex items-center gap-2 font-bold mb-1"><ShieldCheckIcon /> Unhackable Mode</p>
                            <p>Set a secure PIN. You'll need this every time you log in on a new device.</p>
                        </div>
                        <div>
                            <label htmlFor="create-pin" className="block text-sm font-medium text-brand-text-secondary mb-1">Create PIN (4+ digits)</label>
                            <input
                                id="create-pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center tracking-widest"
                                maxLength={6}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-pin" className="block text-sm font-medium text-brand-text-secondary mb-1">Confirm PIN</label>
                            <input
                                id="confirm-pin"
                                type="password"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-yellow focus:ring-0 rounded-md px-3 py-2 text-center tracking-widest"
                                maxLength={6}
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Secure Account'}
                        </Button>
                    </form>
                )}
                
                {error && <p className="text-red-400 text-sm text-center mt-4 animate-pulse">{error}</p>}
            </Card>
        </div>
    );
};

export default Onboarding;
