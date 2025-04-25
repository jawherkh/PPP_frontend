
import { MessageData } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CircuitBoard } from 'lucide-react';

interface MessageItemProps {
  message: MessageData;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const isUserMessage = message.type === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUserMessage ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg p-4",
        isUserMessage 
          ? "bg-electric-accent text-white rounded-tr-none"
          : "bg-secondary text-white rounded-tl-none circuit-border"
      )}>
        <div className="flex items-center gap-2 mb-1">
          {!isUserMessage && <CircuitBoard size={16} className="text-electric-light" />}
          <span className="text-sm opacity-70">
            {isUserMessage ? "You" : "Circuit Assistant"}
          </span>
          <span className="text-xs opacity-50 ml-auto">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="text-sm md:text-base whitespace-pre-wrap">
          {message.content}
        </div>
        
        {message.circuitImage && (
          <div className="mt-3 rounded overflow-hidden border border-electric">
            <img 
              src={message.circuitImage} 
              alt="Circuit Diagram"
              className={cn(
                "w-full transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="h-32 bg-electric-dark/50 animate-pulse flex items-center justify-center">
                <CircuitBoard className="text-electric-light/30" />
              </div>
            )}
          </div>
        )}
        
        {message.plotData && message.plotData.length > 0 && (
          <div className="mt-3 space-y-3">
            {message.plotData.map(plot => (
              <div key={plot.id} className="rounded overflow-hidden border border-electric-cyan">
                <div className="bg-electric-dark/70 text-xs p-1 px-2 font-mono text-electric-cyan">
                  {plot.title}
                </div>
                <img src={plot.imageUrl} alt={plot.title} className="w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
