import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import CircuitVisualization from '@/components/CircuitVisualization';
import SettingsPanel from '@/components/SettingsPanel';
import MobileTabBar from '@/components/MobileTabBar';
import { ChatProvider, useChatContext } from '@/context/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

const MainContent = () => {
  const { sidebarOpen } = useChatContext();
  const isMobile = useIsMobile();
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'circuit'>('chat');
  
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <ChatSidebar />
        
        <main className="flex-1 overflow-hidden">
          {activeMobileTab === 'chat' ? (
            <ChatInterface />
          ) : (
            <CircuitVisualization />
          )}
        </main>
        
        <MobileTabBar 
          activeTab={activeMobileTab} 
          onTabChange={setActiveMobileTab} 
        />
        
        <SettingsPanel />
      </div>
    );
  }
  
  // Desktop and tablet layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar />
      
      <main className={`flex-1 flex transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        {/* Desktop layout - side by side */}
        <div className="hidden xl:flex w-full">
          <div className="w-1/2 h-full border-r border-border">
            <ChatInterface />
          </div>
          <div className="w-1/2 h-full">
            <CircuitVisualization />
          </div>
        </div>
        
        {/* Tablet layout - stacked vertically */}
        <div className="flex flex-col xl:hidden w-full">
          <div className="h-1/2 border-b border-border">
            <ChatInterface />
          </div>
          <div className="h-1/2">
            <CircuitVisualization />
          </div>
        </div>
      </main>
      
      <SettingsPanel />
    </div>
  );
};

const Index = () => {
  return (
    <ChatProvider>
      <MainContent />
    </ChatProvider>
  );
};

export default Index;