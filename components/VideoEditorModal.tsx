import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { Icon } from './Icon';

interface VideoEditorModalProps {
  videoUrl: string;
  initialEdits?: Message['media']['edits'];
  onClose: () => void;
  onSave: (edits: Message['media']['edits']) => void;
}

const filterOptions = [
  { id: 'none', name: 'None' },
  { id: 'grayscale', name: 'Grayscale' },
  { id: 'sepia', name: 'Sepia' },
  { id: 'invert', name: 'Invert' },
  { id: 'brightness', name: 'Brighten' },
  { id: 'contrast', name: 'Contrast' },
];

const VideoEditorModal: React.FC<VideoEditorModalProps> = ({ videoUrl, initialEdits, onClose, onSave }) => {
  const [filter, setFilter] = useState(initialEdits?.filter || 'video-filter-none');
  const [overlayText, setOverlayText] = useState(initialEdits?.overlayText?.text || '');
  const [textColor, setTextColor] = useState(initialEdits?.overlayText?.color || '#FFFFFF');

  const handleSave = () => {
    onSave({
      filter,
      overlayText: {
        text: overlayText,
        color: textColor,
      },
    });
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up" style={{ animationDuration: '0.3s' }} onClick={onClose}>
      <div className="glass-panel w-full max-w-4xl p-6 rounded-2xl flex flex-col gap-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold">Video Editor</h2>
             <button onClick={onClose} className="p-2 rounded-full glass-btn"><Icon name="close" className="h-5 w-5"/></button>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video key={videoUrl} controls autoPlay loop className={`w-full h-full object-contain transition-all duration-300 ${filter}`}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {overlayText && (
            <div className="video-overlay-text" style={{ color: textColor }}>
              {overlayText}
            </div>
          )}
        </div>

        {/* Editing Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filter Controls */}
            <div className="flex flex-col gap-2">
                <label htmlFor="filter-select" className="text-sm font-semibold text-gray-400">Filter</label>
                <select 
                    id="filter-select"
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                    className="w-full glass-btn"
                >
                    {filterOptions.map(opt => (
                        <option key={opt.id} value={`video-filter-${opt.id}`}>{opt.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Text Overlay Controls */}
            <div className="flex flex-col gap-2">
                 <label htmlFor="text-overlay" className="text-sm font-semibold text-gray-400">Text Overlay</label>
                 <div className="flex gap-2">
                    <input
                        id="text-overlay"
                        type="text"
                        placeholder="Add text to video..."
                        value={overlayText}
                        onChange={e => setOverlayText(e.target.value)}
                        className="flex-grow stylized-3d-input !pl-4 !py-2.5 !rounded-lg"
                    />
                    <input
                        type="color"
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="w-12 h-12 p-1 bg-transparent border-2 border-[var(--card-border)] rounded-lg cursor-pointer"
                        title="Select text color"
                    />
                 </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-4">
            <button onClick={onClose} className="stylized-3d-btn secondary">Cancel</button>
            <button onClick={handleSave} className="stylized-3d-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default VideoEditorModal;