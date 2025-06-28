import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatContext } from "@/context/ChatContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { History, Menu, Settings, X } from "lucide-react";
import { useEffect } from "react";

const ChatSidebar: React.FC = () => {
  const { chatHistory, sidebarOpen, toggleSidebar, toggleSettingsPanel } = useChatContext();
  const isMobile = useIsMobile();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('chat-sidebar');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen, toggleSidebar]);

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Mobile sidebar */}
        <aside
          id="chat-sidebar"
          className={cn(
            "fixed left-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out border-sidebar-border lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <CircuitBoard className="text-electric-light h-5 w-5" />
              <span className="font-medium text-sidebar-foreground">Circuit Chat</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground"
              onClick={toggleSidebar}
            >
              <X size={20} />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          
          <Separator className="bg-sidebar-border" />
          
          <div className="flex items-center px-4 py-2">
            <div className="flex items-center gap-2">
              <History className="text-sidebar-foreground h-4 w-4" />
              <span className="text-sm font-medium text-sidebar-foreground">History</span>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="px-2 pb-4">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent"
                  onClick={() => {
                    // Handle chat selection and close sidebar on mobile
                    toggleSidebar();
                  }}
                >
                  <CircuitBoard className="text-electric-light h-4 w-4 shrink-0" />
                  <div className="truncate">
                    <p className="truncate font-medium text-sidebar-foreground">{chat.title}</p>
                    <p className="truncate text-xs text-sidebar-foreground/60">{chat.preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          
          <Separator className="bg-sidebar-border" />
          
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground"
              onClick={toggleSettingsPanel}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </Button>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-full flex-col border-r bg-sidebar transition-all duration-300 ease-in-out border-sidebar-border hidden lg:flex",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className={cn("flex items-center gap-2", !sidebarOpen && "hidden")}>
          <CircuitBoard className="text-electric-light h-5 w-5" />
          <span className="font-medium text-sidebar-foreground">Circuit Chat</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      <div className="flex items-center px-4 py-2">
        <div className={cn("flex items-center gap-2", !sidebarOpen && "hidden")}>
          <History className="text-sidebar-foreground h-4 w-4" />
          <span className="text-sm font-medium text-sidebar-foreground">History</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-2">
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent",
                !sidebarOpen && "justify-center"
              )}
            >
              <CircuitBoard className="text-electric-light h-4 w-4 shrink-0" />
              {sidebarOpen && (
                <div className="truncate">
                  <p className="truncate font-medium text-sidebar-foreground">{chat.title}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">{chat.preview}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
      
      <Separator className="bg-sidebar-border" />
      
      <div className="p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground",
            !sidebarOpen && "justify-center"
          )}
          onClick={toggleSettingsPanel}
        >
          <Settings className="h-4 w-4 mr-2" />
          {sidebarOpen && <span>Settings</span>}
        </Button>
      </div>
    </aside>
  );
};

export default ChatSidebar;

// Helper component to avoid the import error
const CircuitBoard = (props: any) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M11 9h4a2 2 0 0 0 2-2V3"/><circle cx="9" cy="9" r="2"/><path d="M7 21v-4a2 2 0 0 1 2-2h4"/><circle cx="15" cy="15" r="2"/></svg>;
