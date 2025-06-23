import { Button } from "@/components/ui/button";
import { MessageSquare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTabBarProps {
  activeTab: 'chat' | 'circuit';
  onTabChange: (tab: 'chat' | 'circuit') => void;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="ghost"
        className={cn(
          "flex-1 flex flex-col items-center gap-1 py-3 h-auto rounded-none",
          activeTab === 'chat' && "bg-accent text-accent-foreground"
        )}
        onClick={() => onTabChange('chat')}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-xs font-medium">Chat</span>
      </Button>
      
      <Button
        variant="ghost"
        className={cn(
          "flex-1 flex flex-col items-center gap-1 py-3 h-auto rounded-none",
          activeTab === 'circuit' && "bg-accent text-accent-foreground"
        )}
        onClick={() => onTabChange('circuit')}
      >
        <Zap className="h-5 w-5" />
        <span className="text-xs font-medium">Circuit</span>
      </Button>
    </div>
  );
};

export default MobileTabBar;
