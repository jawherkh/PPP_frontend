import { MessageData } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CircuitBoard, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
        "max-w-[80%]",
        isUserMessage && "bg-blue-600 text-white rounded-lg p-2 rounded-tr-none",
        !isUserMessage && "bg-card text-foreground rounded-lg p-2 rounded-tl-none shadow-sm border border-border"
      )}>
        <div className="flex items-center gap-2">
          {!isUserMessage && <CircuitBoard size={16} className="text-blue-400" />}
          <span className={cn(
            "text-sm",
            isUserMessage ? "opacity-70" : "text-blue-400"
          )}>
            {isUserMessage ? "" : "Circuit Assistant"}
          </span>
        </div>
        
        <div className="text-sm md:text-base whitespace-pre-wrap">
          {isUserMessage ? (
            message.content
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-blue prose-headings:text-blue-300 prose-a:text-blue-300 prose-code:text-blue-200 prose-pre:bg-blue-950/30">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
          
        {/* Circuit images are displayed in the CircuitVisualization component */}
        {message.circuitImage && (
          <div className="mt-3 p-2 border border-blue-500/30 rounded-lg bg-blue-950/20 text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <CircuitBoard size={14} />
              <span>Circuit schematic available in the "Schematic" tab</span>
            </div>
          </div>
        )}
        
        {/* Plot data is displayed in the CircuitVisualization component */}
        {message.plotData && message.plotData.length > 0 && (
          <div className="mt-3 p-2 border border-blue-500/30 rounded-lg bg-blue-950/20 text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <CircuitBoard size={14} />
              <span>{message.plotData.length} analysis plot(s) available in the "Analysis" tab</span>
            </div>
          </div>
        )}
        
        {/* Report data is displayed in the CircuitVisualization component */}
        {message.reportData && (
          <div className="mt-3 p-2 border border-blue-500/30 rounded-lg bg-blue-950/20 text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <FileText size={14} />
              <span>Detailed analysis report available in the "Report" tab</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
