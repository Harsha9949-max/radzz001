import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Message, ChatMode, User, ChatSession, Attachment } from '../types';
import * as geminiService from '../services/geminiService';
import { Icon } from '../components/Icon';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Stylized3DScene from '../components/FuturisticGlobe';
import VideoEditorModal from '../components/VideoEditorModal';
import FilePreviewModal from '../components/FilePreviewModal';

// Helper functions for localStorage
const getStoredChats = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem('radzz_chats');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse chats from localStorage", e);
    return [];
  }
};

const saveStoredChats = (chats: ChatSession[]) => {
  localStorage.setItem('radzz_chats', JSON.stringify(chats));
};

const initialWelcomeMessage: Message = {
    id: 'initial-welcome',
    role: 'model',
    content: "System online. I am RADZZ AI. Select a mode and begin.",
};

const premiumModes: ChatMode[] = ['deep_thinking', 'real_time_data', 'video_generation'];

interface ChatPageProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ user, onUserUpdate, onLogout }) => {
  const [chats, setChats] = useState<ChatSession[]>(getStoredChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(chats[0]?.id || null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('radzz');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<{ messageId: string; url: string; edits?: Message['media']['edits'] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Attachment | null>(null);
  const [activePreview, setActivePreview] = useState<Attachment | null>(null);

  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMessages = useMemo((): Message[] => {
    if (!activeChatId) return [initialWelcomeMessage];
    const activeChat = chats.find(c => c.id === activeChatId);
    return activeChat ? activeChat.messages : [initialWelcomeMessage];
  }, [chats, activeChatId]);

  useEffect(() => { saveStoredChats(chats); }, [chats]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages, isLoading]);

  useEffect(() => {
    geminiService.startChat(chatMode);
  }, [chatMode]);
  
  const addNewMessageToChat = (message: Message, chatIdToUpdate?: string | null): string => {
      let targetChatId = chatIdToUpdate || activeChatId;
      if (!targetChatId) {
          const newChatId = Date.now().toString();
          const newChat: ChatSession = {
              id: newChatId,
              title: (typeof message.content === 'string' ? message.content : 'New Chat').substring(0, 40) + '...',
              messages: [initialWelcomeMessage, message],
          };
          setChats(prev => [newChat, ...prev]);
          setActiveChatId(newChatId);
          return newChatId;
      } else {
          setChats(prev => prev.map(c => c.id === targetChatId ? { ...c, messages: [...c.messages, message] } : c));
          return targetChatId;
      }
  };

  const handleStreamingChat = async (messageContent: string, attachment?: Attachment) => {
      const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent, attachment };
      const currentChatId = addNewMessageToChat(newUserMessage);
      
      const modelMessageId = (Date.now() + 1).toString();
      addNewMessageToChat({ id: modelMessageId, role: 'model', content: '' }, currentChatId);

      try {
          const responseStream = await geminiService.sendMessageStream(messageContent);
          for await (const chunk of responseStream) {
              const chunkText = chunk.text;
              setChats(prev => prev.map(c => {
                  if (c.id === currentChatId) {
                      const updatedMessages = c.messages.map(msg => msg.id === modelMessageId ? { ...msg, content: (msg.content as string) + chunkText } : msg);
                      return { ...c, messages: updatedMessages };
                  }
                  return c;
              }));
          }
      } catch (e) {
          setError('Connection error. Please check your network and try again.');
          setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: c.messages.filter(msg => msg.id !== modelMessageId) } : c));
      }
  };

  const handleRealTimeSearch = async (messageContent: string) => {
      const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent };
      const currentChatId = addNewMessageToChat(newUserMessage);
      
      const modelMessageId = (Date.now() + 1).toString();
      addNewMessageToChat({ id: modelMessageId, role: 'model', content: <div className="bouncing-loader"><div></div><div></div><div></div></div> }, currentChatId);

      try {
          const { text, sources } = await geminiService.sendMessageWithGoogleSearch(messageContent);
          setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: c.messages.map(m => m.id === modelMessageId ? { ...m, content: text, sources } : m) } : c));
      } catch (e) {
          setError('Failed to fetch real-time data. Please try again.');
          setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: c.messages.filter(msg => msg.id !== modelMessageId) } : c));
      }
  };

  const handleMediaGeneration = (type: 'image' | 'video', messageContent: string) => {
      const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent };
      const currentChatId = addNewMessageToChat(newUserMessage);
      
      const modelMessageId = (Date.now() + 1).toString();
      addNewMessageToChat({ id: modelMessageId, role: 'model', content: `Generating ${type}, please wait...` }, currentChatId);
      
      setTimeout(() => {
          const mediaUrl = type === 'image' 
              ? `https://picsum.photos/seed/${Math.random()}/512/512`
              : 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'; // Placeholder video

          const finalMessage: Message = {
              id: modelMessageId,
              role: 'model',
              content: `Here is the ${type} you requested.`,
              media: { type, url: mediaUrl, isPlaceholder: true }
          };
          setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: c.messages.map(m => m.id === modelMessageId ? finalMessage : m) } : c));
      }, 1500);
  };

  const handleSendMessage = async () => {
      const messageContent = input.trim();
      if (!messageContent && !selectedFile) return;
      
      const isImageGenerationRequest = messageContent.toLowerCase().includes('generate an image');
      const isPremiumAction = premiumModes.includes(chatMode) || isImageGenerationRequest;
      const isStudyBuddyAction = chatMode === 'study_buddy';
      
      // --- Trial Gatekeeping ---
      if (isPremiumAction && !user.isPremium) {
          if (user.premiumTrials <= 0) {
              setError('All premium trials used. Please upgrade for unlimited access.');
              setShowUpgradeModal(true);
              return;
          }
          onUserUpdate({ ...user, premiumTrials: user.premiumTrials - 1 });
      }

      if (isStudyBuddyAction && !user.isPremium) {
          if (user.studyBuddyTrials <= 0) {
              setError('Study Buddy trials exhausted.');
              return;
          }
          onUserUpdate({ ...user, studyBuddyTrials: user.studyBuddyTrials - 1 });
      }
      // --- End Trial Gatekeeping ---

      setInput('');
      setError(null);
      setIsLoading(true);
      const attachmentToSend = previewData;
      setSelectedFile(null);
      setPreviewData(null);


      if (isImageGenerationRequest) {
          handleMediaGeneration('image', messageContent);
      } else if (chatMode === 'video_generation') {
          handleMediaGeneration('video', messageContent);
      } else if (chatMode === 'real_time_data') {
          await handleRealTimeSearch(messageContent);
      } else {
          await handleStreamingChat(messageContent, attachmentToSend || undefined);
      }
      setIsLoading(false);
  };
  
  const handleNewChat = () => { setActiveChatId(null); setInput(''); setError(null); };
  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if(activeChatId === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setActiveChatId(remainingChats[0]?.id || null);
    }
  };
  
  const handleSaveEdits = (messageId: string, edits: Message['media']['edits']) => {
    setChats(prevChats => prevChats.map(chat => {
        if (chat.id !== activeChatId) return chat;
        const updatedMessages = chat.messages.map(msg => {
            if (msg.id === messageId && msg.media) {
                return { ...msg, media: { ...msg.media, edits } };
            }
            return msg;
        });
        return { ...chat, messages: updatedMessages };
    }));
    setEditingMedia(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData({
          name: file.name,
          type: file.type,
          url: reader.result as string,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };


  const openRazorpay = (amount: number, plan: string) => {
      const options = {
          key: 'rzp_test_ILzodxM4UNEU22', // Using Razorpay's public test key
          amount: amount * 100, // Amount in paise
          currency: 'INR',
          name: 'RADZZ AI Premium',
          description: `Unlock Premium Features - ${plan}`,
          handler: (response: any) => {
              console.log('Payment successful:', response);
              onUserUpdate({ ...user, isPremium: true });
              setShowUpgradeModal(false);
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: '#8a2be2' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const renderMessageContent = (message: Message) => {
    const bubbleClass = message.role === 'model' ? 'model' : 'user';
    return (
      <div key={message.id} className={`flex flex-col my-4`}>
        <div className={`chat-bubble-reimagined ${bubbleClass}`}>
          {message.content && <div className="whitespace-pre-wrap">{message.content}</div>}
          {message.attachment && (
             <div className="attachment-bubble" onClick={() => setActivePreview(message.attachment!)}>
                {message.attachment.type.startsWith('image/') ? (
                    <img src={message.attachment.url} alt={message.attachment.name} />
                ) : (
                    <div className="attachment-icon-wrapper">
                        <Icon name="file" className="h-8 w-8 text-white/70" />
                    </div>
                )}
                <div className="overflow-hidden">
                    <p className="font-semibold truncate">{message.attachment.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(message.attachment.size)}</p>
                </div>
            </div>
          )}
          {message.media && (
            <div className="mt-3 relative group">
                {message.media.type === 'image' ? (
                  <img src={message.media.url} alt="Generated content" className="rounded-lg max-w-sm w-full" />
                ) : (
                  <div className="relative">
                    <video 
                        src={message.media.url} 
                        controls 
                        className={`rounded-lg max-w-sm w-full transition-all duration-300 ${message.media.edits?.filter || 'video-filter-none'}`}
                    >
                    </video>
                    {message.media.edits?.overlayText?.text && (
                        <div 
                            className="video-overlay-text"
                            style={{ color: message.media.edits.overlayText.color || '#FFFFFF' }}
                        >
                            {message.media.edits.overlayText.text}
                        </div>
                    )}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {message.media.type === 'video' && (
                         <button onClick={() => setEditingMedia({ messageId: message.id, url: message.media!.url, edits: message.media!.edits })} className="glass-btn !py-1 !px-2 text-xs flex items-center gap-1">
                            <Icon name="edit" className="h-4 w-4" /> Edit
                         </button>
                    )}
                    <a href={message.media.url} download target="_blank" rel="noopener noreferrer" className="glass-btn !py-1 !px-3 text-xs">Download</a>
                </div>
            </div>
          )}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10">
                <h4 className="text-xs font-semibold text-[var(--text-dark-color)] mb-2">SOURCES</h4>
                <ul className="space-y-1">
                    {message.sources.map((source, index) => (
                        <li key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--secondary-light)] hover:underline truncate block">{index + 1}. {source.title}</a></li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const chatModeOptions: { id: ChatMode; name: string; icon: string; }[] = [
    { id: 'radzz', name: 'RADZZ', icon: '›' },
    { id: 'lightning', name: 'Lightning', icon: '›' },
    { id: 'study_buddy', name: 'Study Buddy', icon: '🎓' },
    { id: 'deep_thinking', name: 'Deep Thinking', icon: '✨' },
    { id: 'real_time_data', name: 'Real-Time Data', icon: '✨' },
    { id: 'video_generation', name: 'Video Generation', icon: '✨' },
  ];

  const renderStatusText = () => {
    if (user.isPremium) {
      return <div className="text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2 py-1 rounded-full">PREMIUM</div>;
    }
    if (premiumModes.includes(chatMode)) {
      return <div className="text-xs text-[var(--text-dark-color)] bg-black/20 px-2 py-1 rounded">{user.premiumTrials} Premium trials left</div>;
    }
    if (chatMode === 'study_buddy') {
      return <div className="text-xs text-[var(--text-dark-color)] bg-black/20 px-2 py-1 rounded">{user.studyBuddyTrials} Study Buddy trials left</div>;
    }
    return null;
  };

  return (
    <>
      <Stylized3DScene />
       {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowUpgradeModal(false)}>
          <div className="auth-card w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-center mb-2">Upgrade to Premium</h2>
            <p className="text-center text-[var(--text-dark-color)] mb-8">Unlock powerful features and enhance your AI experience.</p>
            <div className="space-y-4">
              <button onClick={() => openRazorpay(29, 'Daily Pass')} className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-[var(--primary-color)]">
                  <p className="text-lg font-semibold">₹29 - Daily Pass</p>
                  <p className="text-sm text-[var(--text-dark-color)]">24 hours of full premium access.</p>
              </button>
              <button onClick={() => openRazorpay(499, 'Monthly Plan')} className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-[var(--primary-color)]">
                  <p className="text-lg font-semibold">₹499 - Monthly Plan</p>
                  <p className="text-sm text-[var(--text-dark-color)]">Unlimited access for a whole month.</p>
              </button>
            </div>
          </div>
        </div>
      )}
      {editingMedia && (
        <VideoEditorModal 
            videoUrl={editingMedia.url}
            initialEdits={editingMedia.edits}
            onClose={() => setEditingMedia(null)}
            onSave={(edits) => handleSaveEdits(editingMedia.messageId, edits)}
        />
      )}
       {activePreview && (
        <FilePreviewModal file={activePreview} onClose={() => setActivePreview(null)} />
      )}
      <div className="h-screen w-screen flex overflow-hidden p-4 gap-4">
        <Sidebar chats={chats} activeChatId={activeChatId} onNewChat={handleNewChat} onSelectChat={setActiveChatId} onDeleteChat={handleDeleteChat} />
        <main className="flex-1 flex flex-col h-full glass-panel overflow-hidden">
          <Header user={user} onUpgrade={() => setShowUpgradeModal(true)} onLogout={onLogout} />
          <div className="flex-grow p-4 md:p-6 space-y-2 overflow-y-auto">
            {currentMessages.map(renderMessageContent)}
            {isLoading && !currentMessages.some(m => m.id.endsWith('-placeholder')) && (
               <div className="flex flex-col items-start my-4">
                  <div className="chat-bubble-reimagined model p-4">
                    <div className="bouncing-loader"><div></div><div></div><div></div></div>
                  </div>
              </div>
            )}
            {error && <div className="text-red-400 text-center p-2 bg-red-900/50 rounded-md">{error}</div>}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-[var(--card-border)] flex flex-col">
             <div className="flex items-center gap-2 mb-2">
                <select value={chatMode} onChange={(e) => setChatMode(e.target.value as ChatMode)} className="glass-btn !py-1 !px-3 text-sm">
                   {chatModeOptions.map(({ id, name, icon }) => {
                        const isPremiumFeature = premiumModes.includes(id);
                        const isStudyBuddy = id === 'study_buddy';
                        let isDisabled = false;
                        let displayText = `${icon} ${name}`;

                        if (!user.isPremium) {
                            if (isPremiumFeature) {
                                if (user.premiumTrials <= 0) {
                                    isDisabled = true;
                                    displayText = `🔒 ${name}`;
                                } else {
                                    displayText = `✨ ${name} (${user.premiumTrials} left)`;
                                }
                            } else if (isStudyBuddy) {
                                if (user.studyBuddyTrials <= 0) {
                                    isDisabled = true;
                                    displayText = `🔒 ${name}`;
                                } else {
                                    displayText = `🎓 ${name} (${user.studyBuddyTrials} left)`;
                                }
                            }
                        }
                        
                        return (
                            <option key={id} value={id} disabled={isDisabled} style={{ color: isDisabled ? '#888' : 'inherit' }}>
                                {displayText}
                            </option>
                        );
                    })}
                </select>
                {renderStatusText()}
            </div>
            
            {previewData && (
                 <div className="flex items-center gap-2 bg-[rgba(var(--rgb-secondary),0.2)] px-3 py-1.5 rounded-full mb-2 self-start border border-[rgba(var(--rgb-secondary),0.5)]">
                    <button onClick={() => setActivePreview(previewData)} className="text-sm font-medium hover:underline">{previewData.name}</button>
                    <button onClick={() => { setSelectedFile(null); setPreviewData(null); }} className="p-1 rounded-full text-gray-400 hover:bg-black/30 hover:text-white">
                        <Icon name="close" className="h-4 w-4"/>
                    </button>
                 </div>
            )}

            <div className="relative chat-input bg-[rgba(40,40,70,0.5)] rounded-xl overflow-hidden">
              <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} />
              <button onClick={() => fileInputRef.current?.click()} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-[var(--text-dark-color)] hover:text-[var(--text-color)] hover:bg-white/10 transition-colors duration-300" aria-label="Attach file">
                  <Icon name="attachment" className="h-5 w-5" />
              </button>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Send a message..." className="w-full bg-transparent p-4 pl-14 pr-16 text-text-color placeholder-text-dark-color focus:outline-none" disabled={isLoading} />
              <div className="focus-line"></div>
              <button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !selectedFile)} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full transition-colors duration-300 bg-gray-700/50 hover:bg-[var(--secondary-color)] disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send message">
                <Icon name="send" className="h-6 w-6" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatPage;