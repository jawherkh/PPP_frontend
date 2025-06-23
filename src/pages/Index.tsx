
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import CircuitVisualization from '@/components/CircuitVisualization';
import SettingsPanel from '@/components/SettingsPanel';
import { ChatProvider, useChatContext } from '@/context/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';

const MainContent = () => {
  const { sidebarOpen } = useChatContext();
  const isMobile = useIsMobile();
    if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Mobile layout - single column with tabs */}
        <ChatSidebar />
        
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
        
        {/* TODO: Add mobile tabs for circuit view later */}
        {/* <MobileTabBar activeTab={activeMobileTab} onTabChange={setActiveMobileTab} /> */}
        
        <SettingsPanel />
      </div>
    );
  }
  
  // Desktop layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar />
      
      <main className={`flex-1 flex transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Responsive grid layout for desktop/tablet */}
        <div className="hidden lg:flex w-full">
          <div className="w-1/2 h-full border-r border-border">
            <ChatInterface />
          </div>
          <div className="w-1/2 h-full">
            <CircuitVisualization />
          </div>
        </div>
        
        {/* Tablet layout - stacked */}
        <div className="flex flex-col lg:hidden w-full">
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
