import React, { useEffect } from 'react';
import { Icon } from './Icon';
import { Attachment } from '../types';

interface FilePreviewModalProps {
  file: Attachment;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return <img src={file.url} alt={file.name} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" />;
    }
    if (file.type.startsWith('video/')) {
      return <video src={file.url} controls autoPlay className="max-h-[85vh] max-w-[90vw] rounded-lg" />;
    }
    if (file.type.startsWith('audio/')) {
      return <audio src={file.url} controls autoPlay className="rounded-lg"/>;
    }
    return (
      <div className="text-center p-8 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]">
        <Icon name="file" className="h-24 w-24 mx-auto text-[var(--text-dark-color)]" />
        <p className="mt-4 text-lg font-semibold break-all">{file.name}</p>
        <p className="text-sm text-[var(--text-dark-color)] mt-1">{file.type}</p>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up" 
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
    >
      <div className="relative p-4" onClick={e => e.stopPropagation()}>
        <button 
            onClick={onClose} 
            className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
            aria-label="Close preview"
        >
          <Icon name="close" className="h-6 w-6 text-white" />
        </button>
        {renderPreview()}
      </div>
    </div>
  );
};

export default FilePreviewModal;
