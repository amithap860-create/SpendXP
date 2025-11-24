import React, { useState } from 'react';
import { CATEGORY_COLORS } from '../constants';
import Button from './shared/Button';

interface AddCategoryModalProps {
    onClose: () => void;
    onAddCategory: (name: string, emoji: string, color: string) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, onAddCategory }) => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('');
    const [color, setColor] = useState(CATEGORY_COLORS[0]);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !emoji.trim()) {
            setError('Please provide a name and an emoji.');
            return;
        }
        // Basic emoji validation (checks if it's likely a single emoji)
        if ([...emoji].length !== 1) {
            setError('Please use a single emoji character.');
            return;
        }
        onAddCategory(name, emoji, color);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] animate-fade-in p-4">
            <div className="bg-brand-blue rounded-2xl p-6 w-full max-w-sm relative shadow-2xl border border-brand-blue-light">
                <button onClick={onClose} className="absolute top-3 right-3 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-6 text-center">Create Category</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1/4">
                            <label htmlFor="emoji" className="block text-sm font-medium text-brand-text-secondary mb-1">Emoji</label>
                             <input
                                id="emoji"
                                type="text"
                                value={emoji}
                                onChange={(e) => setEmoji(e.target.value)}
                                placeholder="👇"
                                maxLength={2}
                                className="w-full bg-brand-blue-light text-2xl p-2 rounded-md border-2 border-transparent focus:border-brand-yellow focus:ring-0 text-center"
                            />
                        </div>
                        <div className="w-3/4">
                             <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-1">Name</label>
                             <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Hobbies"
                                className="w-full bg-brand-blue-light p-2 rounded-md border-2 border-transparent focus:border-brand-yellow focus:ring-0"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">Color</label>
                        <div className="grid grid-cols-6 gap-3">
                           {CATEGORY_COLORS.map(c => (
                               <button 
                                 key={c}
                                 type="button"
                                 onClick={() => setColor(c)}
                                 className={`w-10 h-10 rounded-full ${c} transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-brand-blue ring-white' : ''}`}
                               />
                           ))}
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <Button type="submit" variant="primary" className="w-full mt-2">
                        Create
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;