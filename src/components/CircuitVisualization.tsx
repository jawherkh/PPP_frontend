import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircuitBoard, ZoomIn, ZoomOut, Power, FileDown } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageData, PlotData } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import html2pdf from 'html2pdf.js';

const CircuitVisualization: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const { messages } = useChatContext();
  const reportHtmlRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Get the latest circuit image, plot data, and report data from messages
  const getLatestCircuitData = () => {
    // Find the most recent bot message with circuit data
    const botMessages = messages.filter(msg => msg.type === 'bot');
    
    let latestCircuitImage: string | undefined;
    let latestPlotData: PlotData[] = [];
    let latestReportData: string | undefined;
    
    // Search from most recent to oldest
    for (let i = botMessages.length - 1; i >= 0; i--) {
      const message = botMessages[i];
      
      // For schema diagram
      if (!latestCircuitImage && message.circuitImage) {
        latestCircuitImage = message.circuitImage;
      }
      
      // For plot data
      if (message.plotData && message.plotData.length > 0) {
        // Only add new plots we don't already have
        for (const plot of message.plotData) {
          if (!latestPlotData.some(p => p.imageUrl === plot.imageUrl)) {
            latestPlotData.push(plot);
          }
        }
      }
      
      // For report data - only use actual report data, not test data
      if (!latestReportData && message.reportData && message.reportData.trim().length > 0) {
        latestReportData = message.reportData;
      }
      
      // Stop if we found all the data we need
      if (latestCircuitImage && latestPlotData.length > 0 && latestReportData) {
        break;
      }
    }
    
    return { 
      circuitImage: latestCircuitImage, 
      plotData: latestPlotData,
      reportData: latestReportData
    };
  };
  
  const { circuitImage, plotData, reportData } = getLatestCircuitData();
  
  const increaseZoom = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const decreaseZoom = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  // Function to generate and download PDF from markdown report
  const handleDownloadPDF = () => {
    if (!reportData) return;
    const element = reportHtmlRef.current;
    if (!element) return;
    
    html2pdf()
      .set({
        margin: 0.5,
        filename: 'circuit-analysis-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(element)
      .save();
  };
  
  return (
    <div className="h-full flex flex-col border-l border-border">
      <div className="flex items-center justify-between border-b border-border p-2 sm:p-3 bg-card">
        <div className="flex items-center gap-2">
          <CircuitBoard className="h-4 w-4 sm:h-5 sm:w-5 text-electric-light" />
          <span className="font-medium text-sm sm:text-base">Circuit Simulator</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={decreaseZoom} className="h-7 w-7 sm:h-8 sm:w-8">
            <ZoomOut size={14} className="sm:w-4 sm:h-4" />
          </Button>
          <span className="text-xs sm:text-sm min-w-8 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={increaseZoom} className="h-7 w-7 sm:h-8 sm:w-8">
            <ZoomIn size={14} className="sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="schematic" className="flex flex-col flex-1">
        <TabsList className="bg-card border-b border-border rounded-none px-2 h-auto">
          <TabsTrigger 
            value="schematic" 
            className="data-[state=active]:bg-electric-dark data-[state=active]:text-electric-light text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
          >
            Schematic
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            className="data-[state=active]:bg-electric-dark data-[state=active]:text-electric-light text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
          >
            Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="report" 
            className="data-[state=active]:bg-electric-dark data-[state=active]:text-electric-light text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
          >
            Report
          </TabsTrigger>
        </TabsList>
        
        {/* Schematic Tab Content */}
        <TabsContent value="schematic" className="flex-1 p-2 sm:p-4 overflow-auto grid-bg">
          <div className="flex items-center justify-center h-full">
            {circuitImage ? (
              <div 
                className="max-w-full max-h-full transform transition-transform"
                style={{ transform: `scale(${zoom})` }}
              >
                <img 
                  src={circuitImage} 
                  alt="Circuit Schematic"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg border border-electric/30"
                  onError={(e) => {
                    console.error('Failed to load circuit image:', circuitImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div 
                className="border border-dashed border-electric p-4 sm:p-8 rounded-lg bg-background/50 transform transition-transform max-w-sm"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="oscilloscope-glow">
                    <CircuitBoard size={isMobile ? 60 : 100} className="text-electric-green" />
                  </div>
                  <p className="text-center text-xs sm:text-sm text-muted-foreground max-w-xs">
                    Circuit schematic will be displayed here when generated by the AI assistant.
                    Ask about a specific circuit to see its diagram.
                  </p>
                  <Button variant="outline" className="border-electric text-electric-light text-xs sm:text-sm">
                    <Power size={14} className="mr-2 sm:w-4 sm:h-4" />
                    Simulate Circuit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Analysis Tab Content */}
        <TabsContent value="analysis" className="flex-1 p-2 sm:p-4 overflow-auto grid-bg">
          <div className="flex items-center justify-center h-full">
            {plotData && plotData.length > 0 ? (
              <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-4xl">
                {plotData.map(plot => (
                  <div key={plot.id} className="bg-background/80 border border-electric-cyan rounded-lg p-3 sm:p-4 shadow-md">
                    <h3 className="text-xs sm:text-sm font-medium mb-2 text-electric-light">{plot.title}</h3>
                    <div 
                      className="transform transition-transform"
                      style={{ transform: `scale(${zoom})` }}
                    >
                      <img 
                        src={plot.imageUrl} 
                        alt={plot.title}
                        className="max-w-full object-contain rounded-lg mx-auto"
                        onError={(e) => {
                          console.error('Failed to load plot image:', plot.imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-electric-cyan p-4 sm:p-8 rounded-lg bg-background/50 max-w-sm">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="w-48 h-24 sm:w-64 sm:h-32 bg-electric-dark/70 rounded-lg overflow-hidden border border-electric-cyan oscilloscope-glow flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-electric-green/50"></div>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-center">
                        <div className="w-full h-px bg-electric-green/50"></div>
                        <div className="w-full h-px bg-electric-green/50 mt-4 sm:mt-8"></div>
                        <div className="w-full h-px bg-electric-green/50 -mt-4 sm:-mt-8"></div>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <path 
                          d="M 0,25 Q 15,10 25,25 T 50,25 T 75,25 T 100,25" 
                          fill="none" 
                          stroke="#10B981" 
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-center text-xs sm:text-sm text-muted-foreground max-w-xs">
                    Circuit analysis plots will be displayed here when generated by the AI assistant.
                    Ask for voltage, current, or frequency analysis to see corresponding plots.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Report Tab Content */}
        <TabsContent value="report" className="flex-1 overflow-hidden flex flex-col">
          {reportData ? (
            <div className="relative flex-1 p-3 sm:p-6">
              {/* Floating Toolbar */}
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10 bg-slate-900/95 backdrop-blur-sm border border-electric-cyan rounded-lg shadow-lg p-2 sm:p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-medium text-electric-light">Circuit Analysis Report</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 text-electric-light border-electric-cyan hover:bg-electric-cyan hover:text-slate-900 transition-all duration-200 text-xs sm:text-sm h-7 sm:h-8"
                  >
                    <FileDown size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>
              </div>

              {/* Main Report Container */}
              <div className="h-full bg-slate-900/80 border-2 border-electric-cyan rounded-lg shadow-2xl flex flex-col backdrop-blur-sm">
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-electric-cyan pt-12 sm:pt-16">
                  <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                    {/* Hidden HTML for PDF export */}
                    <div style={{ display: 'none' }}>
                      <div ref={reportHtmlRef} className="prose prose-sm dark:prose-invert max-w-none prose-blue prose-headings:text-blue-300 prose-a:text-blue-300 prose-code:text-blue-200 prose-pre:bg-blue-950/30">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {reportData}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Enhanced markdown styling */}
                    <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          // Enhanced table styling
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-4 sm:my-8 rounded-lg border border-electric-cyan/30">
                              <table className="w-full border-collapse bg-slate-800/50 text-xs sm:text-sm" {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => (
                            <th className="border-b border-electric-cyan/30 px-3 sm:px-6 py-2 sm:py-4 bg-electric-cyan/10 text-electric-light font-semibold text-left text-xs sm:text-sm" {...props} />
                          ),
                          td: ({node, ...props}) => (
                            <td className="border-b border-slate-700/50 px-3 sm:px-6 py-2 sm:py-4 text-slate-200 text-xs sm:text-sm" {...props} />
                          ),
                          // Enhanced headers
                          h1: ({node, ...props}) => (
                            <h1 className="text-2xl sm:text-4xl font-bold text-electric-light mb-4 sm:mb-8 pb-2 sm:pb-4 border-b-2 border-electric-cyan/50 leading-tight" {...props} />
                          ),
                          h2: ({node, ...props}) => (
                            <h2 className="text-xl sm:text-3xl font-semibold text-electric-light mb-3 sm:mb-6 mt-6 sm:mt-12 pb-1 sm:pb-2 border-b border-electric-cyan/30 leading-tight" {...props} />
                          ),
                          h3: ({node, ...props}) => (
                            <h3 className="text-lg sm:text-2xl font-medium text-electric-light mb-2 sm:mb-4 mt-4 sm:mt-8 leading-tight" {...props} />
                          ),
                          h4: ({node, ...props}) => (
                            <h4 className="text-base sm:text-xl font-medium text-electric-cyan mb-2 sm:mb-3 mt-3 sm:mt-6 leading-tight" {...props} />
                          ),
                          // Enhanced code blocks
                          code: ({node, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            if (match) {
                              return (
                                <div className="bg-slate-950 border border-electric-cyan/20 rounded-lg p-3 sm:p-6 my-3 sm:my-6 overflow-x-auto shadow-lg">
                                  <code className="text-electric-green text-xs sm:text-sm font-mono leading-relaxed block" {...props}>
                                    {children}
                                  </code>
                                </div>
                              );
                            }
                            return (
                              <code className="bg-electric-dark/40 text-electric-cyan px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-xs sm:text-sm border border-electric-cyan/20" {...props}>
                                {children}
                              </code>
                            );
                          },
                          // Enhanced paragraphs
                          p: ({node, ...props}) => (
                            <p className="mb-3 sm:mb-6 leading-relaxed text-slate-200 text-sm sm:text-lg" {...props} />
                          ),
                          // Enhanced lists
                          ul: ({node, ...props}) => (
                            <ul className="list-disc list-outside mb-3 sm:mb-6 space-y-1 sm:space-y-2 ml-4 sm:ml-6 text-slate-200 text-sm sm:text-base" {...props} />
                          ),
                          ol: ({node, ...props}) => (
                            <ol className="list-decimal list-outside mb-3 sm:mb-6 space-y-1 sm:space-y-2 ml-4 sm:ml-6 text-slate-200 text-sm sm:text-base" {...props} />
                          ),
                          li: ({node, ...props}) => (
                            <li className="mb-1 sm:mb-2 leading-relaxed" {...props} />
                          ),
                          // Enhanced blockquotes
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-electric-cyan pl-3 sm:pl-6 py-2 sm:py-4 my-3 sm:my-6 bg-slate-800/30 rounded-r-lg italic text-slate-300 text-sm sm:text-base" {...props} />
                          ),
                          // Enhanced links
                          a: ({node, ...props}) => (
                            <a className="text-electric-cyan hover:text-electric-light underline decoration-electric-cyan/50 hover:decoration-electric-light transition-colors" {...props} />
                          ),
                          // Enhanced strong/bold text
                          strong: ({node, ...props}) => (
                            <strong className="text-electric-light font-semibold" {...props} />
                          ),
                          // Enhanced emphasis/italic text
                          em: ({node, ...props}) => (
                            <em className="text-electric-cyan italic" {...props} />
                          ),
                        }}
                      >
                        {reportData}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty state
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center bg-slate-900/60 border-2 border-dashed border-electric-cyan/50 rounded-lg p-6 sm:p-12 max-w-md">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 sm:mb-6 mx-auto border border-electric-cyan/30">
                  <CircuitBoard size={isMobile ? 24 : 36} className="text-electric-cyan" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-electric-light">No Report Available</h3>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                  Detailed analysis reports will appear here when generated by the AI assistant.
                  Request a comprehensive circuit analysis to generate a report.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CircuitVisualization;