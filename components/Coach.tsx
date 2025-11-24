
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Card from './shared/Card';
import Button from './shared/Button';
import { SparklesIcon } from './shared/Icons';

const Coach: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // In a real app, this would be a secure environment variable
    const API_KEY = process.env.API_KEY;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !API_KEY) {
            setError('Please enter a question and ensure API key is available.');
            return;
        }

        setIsLoading(true);
        setResponse('');
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            
            const systemInstruction = "You are a friendly and cool financial coach for teenagers. Your name is 'XP'. Explain financial concepts in a simple, relatable way using analogies they would understand (like gaming, social media, or snacks). Keep your answers short, engaging, and easy to read. Use emojis to make it fun. Always be encouraging and positive.";

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                }
            });
            
            setResponse(result.text);

        } catch (err) {
            console.error(err);
            setError('Oops! Something went wrong talking to my brain. Maybe try again?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-center">XP, Your AI Coach</h1>
            <p className="text-brand-text-secondary mb-6 text-center">Got a money question? Just ask!</p>
            
            <Card>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., What is 'interest'?"
                        className="w-full flex-grow bg-brand-blue-light border-2 border-transparent focus:border-brand-purple focus:ring-0 rounded-md px-3 py-2"
                        disabled={isLoading}
                    />
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? 'Thinking...' : 'Ask'}
                    </Button>
                </form>
            </Card>

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            
            {(isLoading || response) && (
                <Card className="mt-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon /> XP says...</h2>
                    {isLoading && (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-brand-blue-light rounded w-3/4"></div>
                            <div className="h-4 bg-brand-blue-light rounded w-1/2"></div>
                            <div className="h-4 bg-brand-blue-light rounded w-5/6"></div>
                        </div>
                    )}
                    {response && (
                        <div className="prose prose-invert prose-p:text-brand-text prose-strong:text-brand-yellow">
                            {response.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    )}
                </Card>
            )}
            
            {!isLoading && !response && (
                <Card className="mt-6 text-center text-brand-text-secondary">
                    <p className="text-lg">🤔</p>
                    <p>Ask anything like:</p>
                    <ul className="mt-2 text-sm list-none">
                        <li>"How do I start saving?"</li>
                        <li>"What's a credit score?"</li>
                        <li>"Is a budget hard to make?"</li>
                    </ul>
                </Card>
            )}
        </div>
    );
};

export default Coach;
