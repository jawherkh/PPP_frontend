import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircuitBoard, ZoomIn, ZoomOut, Power, FileDown } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { MessageData, PlotData } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import html2pdf from 'html2pdf.js';

const CircuitVisualization: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const { messages } = useChatContext();
  const reportHtmlRef = useRef<HTMLDivElement>(null);
  
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
      
      // For report data
      if (!latestReportData && message.reportData) {
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
    // Render the markdown to HTML in a hidden div, then export that div as PDF
    const element = reportHtmlRef.current;
    if (!element) return;
    // Use html2pdf.js to export the HTML (with styles and math)
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
      <div className="flex items-center justify-between border-b border-border p-2 bg-card">
        <div className="flex items-center gap-2">
          <CircuitBoard className="h-5 w-5 text-electric-light" />
          <span className="font-medium">Circuit Simulator</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={decreaseZoom}>
            <ZoomOut size={16} />
          </Button>
          <span className="text-sm min-w-8 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={increaseZoom}>
            <ZoomIn size={16} />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="schematic" className="flex flex-col flex-1">
        <TabsList className="bg-card border-b border-border rounded-none px-2">
          <TabsTrigger value="schematic" className="data-[state=active]:bg-electric-dark data-[state=active]:text-electric-light">Schematic</TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-electric-dark data-[state=active]:text-electric-light">Analysis</TabsTrigger>
          <TabsTrigger value="report" className="data-[state=active]:bg-electric-dark data-[state=active]:text-electric-light">Report</TabsTrigger>
        </TabsList>
        
        {/* Schematic Tab Content */}
        <TabsContent value="schematic" className="flex-1 p-4 overflow-auto grid-bg">
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
                className="border border-dashed border-electric p-8 rounded-lg bg-background/50 transform transition-transform"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="oscilloscope-glow">
                    <CircuitBoard size={100} className="text-electric-green" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground max-w-xs">
                    Circuit schematic will be displayed here when generated by the AI assistant.
                    Ask about a specific circuit to see its diagram.
                  </p>
                  <Button variant="outline" className="border-electric text-electric-light">
                    <Power size={16} className="mr-2" />
                    Simulate Circuit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Analysis Tab Content */}
        <TabsContent value="analysis" className="flex-1 p-4 overflow-auto grid-bg">
          <div className="flex items-center justify-center h-full">
            {plotData && plotData.length > 0 ? (
              <div className="flex flex-col gap-4 w-full max-w-4xl">
                {plotData.map(plot => (
                  <div key={plot.id} className="bg-background/80 border border-electric-cyan rounded-lg p-4 shadow-md">
                    <h3 className="text-sm font-medium mb-2 text-electric-light">{plot.title}</h3>
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
              <div className="border border-dashed border-electric-cyan p-8 rounded-lg bg-background/50">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-64 h-32 bg-electric-dark/70 rounded-lg overflow-hidden border border-electric-cyan oscilloscope-glow flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-electric-green/50"></div>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-center">
                        <div className="w-full h-px bg-electric-green/50"></div>
                        <div className="w-full h-px bg-electric-green/50 mt-8"></div>
                        <div className="w-full h-px bg-electric-green/50 -mt-8"></div>
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
                  <p className="text-center text-sm text-muted-foreground max-w-xs">
                    Circuit analysis plots will be displayed here when generated by the AI assistant.
                    Ask for voltage, current, or frequency analysis to see corresponding plots.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Report Tab Content - New Tab */}
        <TabsContent value="report" className="flex-1 p-4 overflow-auto grid-bg">
          <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
            <div className="bg-background/80 border border-electric rounded-lg p-6 shadow-md">
              {reportData ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-electric-light">Circuit Analysis Report</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1 text-electric-light hover:text-electric-dark"
                    >
                      <FileDown size={16} />
                      <span>Download PDF</span>
                    </Button>
                  </div>
                  {/* Hidden HTML for PDF export */}
                  <div style={{ display: 'none' }}>
                    <div ref={reportHtmlRef} className="prose prose-sm dark:prose-invert max-w-none prose-blue prose-headings:text-blue-300 prose-a:text-blue-300 prose-code:text-blue-200 prose-pre:bg-blue-950/30">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {reportData}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {/* Visible HTML for user */}
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-electric-light prose-a:text-electric">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeKatex]}>
                      {reportData}
                    </ReactMarkdown>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center mb-4 border border-electric/30">
                    <CircuitBoard size={28} className="text-electric-light opacity-60" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-electric-light">No Report Available</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Analysis reports will be displayed here when generated by the AI assistant.
                    Ask for a detailed circuit analysis to generate a report.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CircuitVisualization;