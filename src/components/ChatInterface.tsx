import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChatContext } from '@/context/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MessageItem from '@/components/MessageItem';
import { ArrowUp, CircuitBoard, Zap, Loader2, Settings, Menu } from 'lucide-react';
import { CircuitDesignAPI, ProcessQueryResponse, SimpleQueryResponse, ClassifyQueryResponse } from '@/services/api';

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
  const { messages, addMessage, toggleSidebar } = useChatContext();
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [routingMode, setRoutingMode] = useState<'auto' | 'simple' | 'classify' | 'full'>('auto');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);  // Handle message submission
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

    try {
      // Handle different routing modes
      if (routingMode === 'simple') {
        // Force simple response
        const response = await CircuitDesignAPI.simpleQuery(userQuery);
        addMessage({
          type: 'bot',
          content: response.response,
        });
      } else if (routingMode === 'classify') {
        // Get classification only
        const response = await CircuitDesignAPI.classifyQuery(userQuery);
        addMessage({
          type: 'bot',
          content: `**Query Classification:**\n\n**Type:** ${response.classification}\n**Confidence:** ${Math.round(response.confidence * 100)}%\n**Reasoning:** ${response.reasoning}`,
        });
      } else {
        // Use process-query endpoint with routing mode (auto or full)
        const response = await CircuitDesignAPI.processQuery(userQuery, routingMode);
        
        if (response.status === 'success') {
          // Check if this was a simple response (no files)
          if (!response.files && response.message) {
            // Simple response - just show the message
            addMessage({
              type: 'bot',
              content: response.message,
            });
          } else if (response.files) {
            // Complex response with circuit analysis
            const circuitImage = response.files.schema_diagram;
            const plotData = extractPlotDataFromResponse(response);
            
            // Create response message with circuit diagram and plots
            addMessage({
              type: 'bot',
              content: response.message || 'Circuit analysis completed successfully!',
              circuitImage: circuitImage,
              plotData: plotData.length > 0 ? plotData : undefined,
            });

            // Handle analysis report
            if (response.files.analysis_report) {
              try {
                const analysisResponse = await fetch(response.files.analysis_report);
                if (analysisResponse.ok) {
                  const analysisText = await analysisResponse.text();
                  
                  if (analysisText.trim().length > 0) {
                    addMessage({
                      type: 'bot',
                      content: "I've prepared a detailed analysis report for your circuit. You can view it in the Report tab.",
                      reportData: analysisText,
                    });
                  }
                } else {
                  console.error('Failed to fetch analysis report:', analysisResponse.status);
                }
              } catch (error) {
                console.error('Error fetching analysis report:', error);
              }
            }

            // Handle summary report
            if (response.files.summary_report) {
              try {
                const summaryResponse = await fetch(response.files.summary_report);
                if (summaryResponse.ok) {
                  const summaryText = await summaryResponse.text();
                  
                  if (summaryText.trim().length > 0) {
                    addMessage({
                      type: 'bot',
                      content: summaryText,
                    });
                  }
                } else {
                  console.error('Failed to fetch summary report:', summaryResponse.status);
                }
              } catch (error) {
                console.error('Error fetching summary report:', error);
              }
            }
          } else {
            // Fallback message
            addMessage({
              type: 'bot',
              content: response.message || 'Query processed successfully!',
            });
          }
        } else {
          // Handle error response
          addMessage({
            type: 'bot',
            content: `Error: ${response.error || 'Unknown error occurred during processing.'}`,
          });
        }
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
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-foreground"
          >
            <Menu size={20} />
            <span className="sr-only">Open menu</span>
          </Button>
          <div className="flex items-center gap-2">
            <CircuitBoard className="h-5 w-5 text-electric-light" />
            <span className="font-medium">Circuit Assistant</span>
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      )}
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 overflow-auto" ref={scrollAreaRef}>
        <div className="flex flex-col space-y-4 pb-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>      {/* Input Area */}
      <div className="border-t border-border bg-background p-4">
        {/* Advanced Controls */}
        {showAdvancedControls && (
          <div className="mb-4 p-3 bg-slate-900/50 border border-electric-cyan/30 rounded-lg">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-electric-light">Query Routing:</label>
              <Select value={routingMode} onValueChange={(value: 'auto' | 'simple' | 'classify' | 'full') => setRoutingMode(value)}>
                <SelectTrigger className="w-40 bg-slate-800 border-electric-cyan/30 text-electric-light">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-electric-cyan/30">
                  <SelectItem value="auto" className="text-electric-light">Auto (Smart)</SelectItem>
                  <SelectItem value="simple" className="text-electric-light">Simple Only</SelectItem>
                  <SelectItem value="classify" className="text-electric-light">Classify Only</SelectItem>
                  <SelectItem value="full" className="text-electric-light">Full Analysis</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-slate-400 ml-2">
                {routingMode === 'auto' && 'AI decides between simple response or full analysis'}
                {routingMode === 'simple' && 'Fast responses for basic queries'}
                {routingMode === 'classify' && 'Show query classification only'}
                {routingMode === 'full' && 'Always run full circuit analysis'}
              </div>
            </div>
          </div>
        )}
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
            <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="hover:bg-electric-cyan/20"
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              title="Advanced routing controls"
            >
              <Settings size={18} className={showAdvancedControls ? 'text-electric-cyan' : 'text-slate-400'} />
            </Button>
            
            <Button
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
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-electric-light" />
            <span>Circuit analysis powered by AI</span>
          </div>
          {routingMode !== 'auto' && (
            <div className="text-electric-cyan">
              Mode: {routingMode.charAt(0).toUpperCase() + routingMode.slice(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
