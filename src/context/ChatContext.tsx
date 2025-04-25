import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { MessageData, ChatHistoryItem, SettingsData } from '@/types';

interface ChatContextType {
  messages: MessageData[];
  chatHistory: ChatHistoryItem[];
  settings: SettingsData;
  sidebarOpen: boolean;
  settingsPanelOpen: boolean;
  addMessage: (message: Omit<MessageData, 'id' | 'timestamp'>) => void;
  toggleSidebar: () => void;
  toggleSettingsPanel: () => void;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
}

const defaultSettings: SettingsData = {
  darkMode: true,
  fontSize: 16,
  showCircuitGrid: true,
};

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your circuit simulation assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    {
      id: '1',
      title: 'First conversation',
      preview: 'Discussing basic RC circuit',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Transistor analysis',
      preview: 'BJT amplifier circuit design',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Current conversation',
      preview: 'Circuit simulation assistant',
      timestamp: new Date(),
    },
  ]);
  
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  }, [settings.darkMode, settings.fontSize]);

  const addMessage = (message: Omit<MessageData, 'id' | 'timestamp'>) => {
    const newMessage: MessageData = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleSettingsPanel = () => {
    setSettingsPanelOpen((prev) => !prev);
  };

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        chatHistory,
        settings,
        sidebarOpen,
        settingsPanelOpen,
        addMessage,
        toggleSidebar,
        toggleSettingsPanel,
        updateSettings,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
