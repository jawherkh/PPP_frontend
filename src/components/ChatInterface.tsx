
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChatContext } from '@/context/ChatContext';
import MessageItem from '@/components/MessageItem';
import { ArrowUp, CircuitBoard, Zap } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { messages, addMessage } = useChatContext();
  const [inputMessage, setInputMessage] = useState('');
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
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: inputMessage,
    });

    // Simulate bot response
    setTimeout(() => {
      const demoResponses = [
        {
          content: "I've analyzed your circuit. Here's the schematic and voltage analysis:",
          circuitImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2lyY3VpdHxlbnwwfHwwfHx8MA%3D%3D",
        },
        {
          content: "Based on your requirements, I've calculated the following current and voltage relationships. The RC time constant is τ = RC = 1kΩ × 10μF = 10ms.",
          plotData: [
            {
              id: '1',
              title: 'Voltage vs. Time',
              imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Oscilloscope.png/640px-Oscilloscope.png',
            }
          ],
        },
        {
          content: "I've simulated the amplifier circuit. The gain is approximately 24dB with the current component values.",
        }
      ];

      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];

      addMessage({
        type: 'bot',
        content: randomResponse.content,
        circuitImage: randomResponse.circuitImage,
        plotData: randomResponse.plotData,
      });
    }, 1000);

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            placeholder="Ask about circuits, components, or analysis..."
            className="flex-1 min-h-[60px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            maxLength={1000}
          />
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              className="bg-electric hover:bg-electric-accent"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              <ArrowUp size={18} />
              <span className="sr-only">Send message</span>
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
