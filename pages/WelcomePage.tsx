import React from 'react';
import { AuthMode } from '../types';
import Stylized3DScene from '../components/FuturisticGlobe';

interface WelcomePageProps {
  onNavigate: (mode: AuthMode) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigate }) => {
  return (
    <>
      <Stylized3DScene />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4 perspective-container">
        <div className="stylized-3d-card max-w-3xl p-8 sm:p-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight animate-fade-in-down" style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.5)' }}>
            RADZZ AI
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold text-white mb-6 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
            Your Conversation Companion
          </h2>
          <p className="text-md md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Engage in intelligent, creative, and professional conversations. Powered by Gemini, RADZZ AI is here to help you brainstorm, learn, and create.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto stylized-3d-btn"
            >
              Log In
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto stylized-3d-btn secondary"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;