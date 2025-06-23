import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { MessageData, ChatHistoryItem, SettingsData, PlotData } from '@/types';

interface ChatContextType {
  messages: MessageData[];
  chatHistory: ChatHistoryItem[];
  settings: SettingsData;
  sidebarOpen: boolean;
  settingsPanelOpen: boolean;
  currentCircuitImage: string | null;
  currentPlotData: PlotData[] | null;
  currentReportData: string | null;
  addMessage: (message: Omit<MessageData, 'id' | 'timestamp'>) => void;
  toggleSidebar: () => void;
  toggleSettingsPanel: () => void;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  updateCurrentCircuit: (circuitImage: string | null, plotData: PlotData[] | null) => void;
  updateCurrentReport: (reportData: string | null) => void;
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
  
  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Default to closed on mobile
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [currentCircuitImage, setCurrentCircuitImage] = useState<string | null>(null);
  const [currentPlotData, setCurrentPlotData] = useState<PlotData[] | null>(null);
  const [currentReportData, setCurrentReportData] = useState<string | null>(null);

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
  const updateCurrentCircuit = (circuitImage: string | null, plotData: PlotData[] | null) => {
    setCurrentCircuitImage(circuitImage);
    setCurrentPlotData(plotData);
  };

  const updateCurrentReport = (reportData: string | null) => {
    setCurrentReportData(reportData);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        chatHistory,
        settings,
        sidebarOpen,
        settingsPanelOpen,
        currentCircuitImage,
        currentPlotData,
        currentReportData,
        addMessage,
        toggleSidebar,
        toggleSettingsPanel,
        updateSettings,
        updateCurrentCircuit,
        updateCurrentReport,
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
