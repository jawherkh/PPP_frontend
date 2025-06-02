import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChatContext } from '@/context/ChatContext';
import MessageItem from '@/components/MessageItem';
import { ArrowUp, CircuitBoard, Zap, Loader2 } from 'lucide-react';
import { CircuitDesignAPI, ProcessQueryResponse } from '@/services/api';

// Function to extract plot data from API response
const extractPlotDataFromResponse = (response: ProcessQueryResponse): Array<{id: string; title: string; imageUrl: string}> => {
  const plotData: Array<{id: string; title: string; imageUrl: string}> = [];
  
  if (!response.files) return plotData;
  
  // Add circuit_plot if available (main simulation result)
  if (response.files.circuit_plot) {
    plotData.push({
      id: 'circuit_plot',
      title: 'Circuit Simulation',
      imageUrl: response.files.circuit_plot,
    });
  }
  
  // Find all other plot files - look for keys that match patterns or contain "plot"
  Object.entries(response.files).forEach(([key, url]) => {
    if (key === 'circuit_plot' || key === 'schema_diagram') return; // Skip already handled keys
    
    if (key.includes('plot') || key.includes('figure') || key.includes('graph') || 
        key.match(/plot_\d+/) || key.includes('simulation')) {
      const title = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/Plot/i, 'Plot')
        .replace(/Figure/i, 'Figure')
        .replace(/Graph/i, 'Graph');
      
      plotData.push({ id: key, title, imageUrl: url });
    }
  });
  
  return plotData;
};

const ChatInterface: React.FC = () => {
  const { messages, addMessage } = useChatContext();
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);
  // Handle message submission
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userQuery = inputMessage.trim();

    // Add user message
    addMessage({
      type: 'user',
      content: userQuery,
    });

    // Clear input and show loading
    setInputMessage('');
    setIsProcessing(true);

    // Add loading message
    addMessage({
      type: 'bot',
      content: 'Processing your circuit design request... This may take a moment.',
    });

    try {
      // Call the API
      const response = await CircuitDesignAPI.processQuery(userQuery);
      
      if (response.status === 'success' && response.files) {
        // Extract circuit image and plot data from response
        const circuitImage = response.files.schema_diagram;
        const plotData = extractPlotDataFromResponse(response);
        
        // Create response message with circuit diagram and plots
        addMessage({
          type: 'bot',
          content: response.message || 'Circuit analysis completed successfully!',
          circuitImage: circuitImage,
          plotData: plotData.length > 0 ? plotData : undefined,
        });
        
        // If there's an analysis report, add its content to a separate message but only show summary in chat
        if (response.files.analysis_report) {
          try {
            const analysisResponse = await fetch(response.files.analysis_report);
            if (analysisResponse.ok) {
              const analysisText = await analysisResponse.text();
              
              // Add the full report to reportData field, but only display a reference in the chat
              addMessage({
                type: 'bot',
                content: "I've prepared a detailed analysis report for your circuit. You can view it in the Report tab.",
                reportData: analysisText,
              });
            }
          } catch (error) {
            console.error('Error fetching analysis report:', error);
          }
        }
        
        // If there's a summary report, add it as a separate message
        if (response.files.summary_report) {
          try {
            const summaryResponse = await fetch(response.files.summary_report);
            if (summaryResponse.ok) {
              const summaryText = await summaryResponse.text();
              addMessage({
                type: 'bot',
                content: summaryText,
              });
            }
          } catch (error) {
            console.error('Error fetching summary report:', error);
          }
        }
      } else {
        // Handle error response
        addMessage({
          type: 'bot',
          content: `Error: ${response.error || 'Unknown error occurred during circuit processing.'}`,
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      addMessage({
        type: 'bot',
        content: `Error: Failed to connect to circuit design service. Please make sure the backend is running on http://localhost:8000`,
      });
    } finally {
      setIsProcessing(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 overflow-auto" ref={scrollAreaRef}>
        <div className="flex flex-col space-y-4 pb-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-4">
        <div className="flex items-end gap-2 relative circuit-border rounded-lg p-1 overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full electric-gradient animate-flow"></div>
            <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isProcessing ? "Processing circuit design..." : "Ask about circuits, components, or analysis..."}
            className="flex-1 min-h-[60px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            maxLength={1000}
            disabled={isProcessing}
          />
          
          <div className="flex items-center gap-2">            <Button
              type="button"
              size="icon"
              className="bg-electric hover:bg-electric-accent"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowUp size={18} />
              )}
              <span className="sr-only">
                {isProcessing ? 'Processing...' : 'Send message'}
              </span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-electric-light" />
            <span>Circuit analysis powered by AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
