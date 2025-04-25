
import { useCallback, useEffect } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import CircuitVisualization from '@/components/CircuitVisualization';
import SettingsPanel from '@/components/SettingsPanel';
import { ChatProvider, useChatContext } from '@/context/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';

const MainContent = () => {
  const { sidebarOpen } = useChatContext();
  const isMobile = useIsMobile();
  
  // Determine the layout based on screen size
  const layout = isMobile ? 'mobile' : 'desktop';
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar />
      
      <main className={`flex-1 flex transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {layout === 'desktop' ? (
          <>
            <div className="w-1/2 h-full">
              <ChatInterface />
            </div>
            <div className="w-1/2 h-full">
              <CircuitVisualization />
            </div>
          </>
        ) : (
          <div className="w-full h-full">
            <ChatInterface />
          </div>
        )}
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
