import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-brand-background rounded-2xl p-6 w-full max-w-sm relative shadow-2xl border border-brand-blue-light">
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
