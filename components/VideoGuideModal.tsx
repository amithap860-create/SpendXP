import React from 'react';
import { Quest } from '../types';
import Modal from './shared/Modal';
import { PlayIcon } from './shared/Icons';

interface VideoGuideModalProps {
    quest: Quest;
    onClose: () => void;
}

const VideoGuideModal: React.FC<VideoGuideModalProps> = ({ quest, onClose }) => {
    
    const buttonClasses = [
        'w-full', 'inline-flex', 'items-center', 'justify-center', 'gap-2',
        'font-bold', 'rounded-lg', 'transition-colors',
        'bg-brand-green', 'text-white', 'hover:bg-emerald-600',
        'px-4', 'py-2'
    ].join(' ');

    const searchUrl = quest.videoSearchQuery 
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(quest.videoSearchQuery)}`
        : 'https://www.youtube.com';

    return (
        <Modal title="Find a Guide" onClose={onClose}>
            <div className="text-center">
                <p className="text-xl font-bold mb-2">{quest.title}</p>
                <p className="text-brand-text-secondary mb-6">
                    Instead of a single video that might disappear, we'll open a YouTube search for you. This way, you can find the best, most current guide on this topic!
                </p>
                <a 
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses}
                >
                    <PlayIcon />
                    Search on YouTube
                </a>
            </div>
        </Modal>
    );
};

export default VideoGuideModal;