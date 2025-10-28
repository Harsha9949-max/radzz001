import React from 'react';
import { Icon } from './Icon';
import { ChatSession } from '../types';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat }) => {
  return (
    <aside className="w-64 glass-panel flex-col p-4 h-full hidden md:flex">
      <div className="relative">
        <button 
          onClick={onNewChat}
          className="flex items-center justify-center w-full p-3 text-left text-lg glass-btn"
        >
          <Icon name="add_comment" className="h-6 w-6 mr-3" />
          New Chat
        </button>
      </div>

      <div className="flex-1 mt-4 space-y-2 overflow-y-auto pr-2 -mr-2">
        <h3 className="px-3 py-2 text-xs font-semibold tracking-wider text-[var(--text-dark-color)] uppercase">
          Saved Chats
        </h3>
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`group w-full text-left p-3 rounded-lg transition-colors duration-200 flex justify-between items-center ${
                  activeChatId === chat.id
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="truncate pr-2">{chat.title}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent chat selection when deleting
                        onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-500/20"
                    aria-label={`Delete chat: ${chat.title}`}
                >
                   <Icon name="trash" className="h-4 w-4 text-[var(--text-dark-color)] hover:text-[var(--error-color)]" />
                </button>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;