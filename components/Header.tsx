import React from 'react';
import { Icon } from './Icon';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onUpgrade: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onUpgrade, onLogout }) => {
  return (
    <header className="flex items-center justify-between p-3 border-b border-[var(--card-border)] bg-[rgba(30,30,50,0.4)] backdrop-blur-sm flex-shrink-0">
      {/* Branding & Identity */}
      <div className="flex items-center gap-3">
        <Icon name="sparkles" className="h-7 w-7 text-[var(--secondary-color)]" />
        <h1 className="text-2xl font-bold tracking-wider text-white">RADZZ</h1>
      </div>

      {/* User Account Management & Premium */}
      <div className="flex items-center gap-4">
        {user.isPremium ? (
           <div className="px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-lg shadow-lg">
            Premium Active
          </div>
        ) : (
          <button
            onClick={onUpgrade}
            className="gold-gradient-btn text-sm font-semibold"
          >
            Upgrade
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 text-[var(--text-dark-color)]">
          <Icon name="user" className="h-5 w-5" />
          <span>{user.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center p-2 rounded-full glass-btn"
          aria-label="Logout"
        >
          <Icon name="logout" className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;