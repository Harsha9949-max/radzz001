import type React from 'react';

// Added Razorpay to Window interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

export type Page = 'welcome' | 'auth' | 'chat';
export type AuthMode = 'login' | 'signup';
// Updated ChatMode with new premium features
export type ChatMode = 'radzz' | 'lightning' | 'deep_thinking' | 'real_time_data' | 'video_generation' | 'study_buddy';

export interface Attachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string | React.ReactNode;
  sources?: GroundingSource[];
  media?: {
    type: 'image' | 'video';
    url: string;
    // Adding a flag for placeholder media to differentiate
    isPlaceholder?: boolean;
    edits?: {
      filter: string;
      overlayText?: {
        text: string;
        color: string;
      };
    };
  };
  attachment?: Attachment;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface User {
  name: string;
  email: string;
  isPremium: boolean;
  premiumTrials: number;
  studyBuddyTrials: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  // Future-proofing: you might want to store the mode per-chat
  // chatMode: ChatMode; 
}