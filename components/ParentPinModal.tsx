
import React, { useState } from 'react';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { LockIcon } from './shared/Icons';

interface ParentPinModalProps {
    mode: 'create' | 'verify';
    onClose: () => void;
    onSubmit: (pin: string) => void;
}

const ParentPinModal: React.FC<ParentPinModalProps> = ({ mode, onClose, onSubmit }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        if (mode === 'create') {
            if (pin !== confirmPin) {
                setError('PINs do not match');
                return;
            }
        }

        onSubmit(pin);
    };

    return (
        <Modal title={mode === 'create' ? "Set Parent PIN" : "Parent Access"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center mb-4 text-brand-purple">
                    <LockIcon />
                </div>
                
                <p className="text-center text-brand-text-secondary text-sm mb-4">
                    {mode === 'create' 
                        ? "Create a PIN to manage parental controls." 
                        : "Enter Parent PIN to access settings."}
                </p>

                <div>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="PIN"
                        className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-purple focus:ring-0 rounded-md px-3 py-2 text-center text-xl tracking-widest"
                        autoFocus
                        maxLength={6}
                    />
                </div>

                {mode === 'create' && (
                    <div>
                        <input
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            placeholder="Confirm PIN"
                            className="w-full bg-brand-blue-light border-2 border-transparent focus:border-brand-purple focus:ring-0 rounded-md px-3 py-2 text-center text-xl tracking-widest"
                            maxLength={6}
                        />
                    </div>
                )}

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div className="flex gap-4 mt-4">
                    <Button type="button" onClick={onClose} variant="secondary" className="flex-1">Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1">
                        {mode === 'create' ? 'Set PIN' : 'Access'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ParentPinModal;
