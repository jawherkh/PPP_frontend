import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircuitBoard, ZoomIn, ZoomOut, Power, FileDown } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
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
  
  // Temporary test data for scrolling verification
  const testReportData = `# Circuit Analysis Report

## Introduction
This is a comprehensive analysis of the circuit design and performance characteristics.

## Circuit Description
The circuit consists of several key components that work together to achieve the desired functionality.

### Component Analysis
1. **Resistor R1**: 1kΩ resistance value
2. **Capacitor C1**: 100µF capacitance
3. **Inductor L1**: 10mH inductance

## Mathematical Analysis

The voltage across the resistor can be calculated using Ohm's law:

$$V_R = I \\times R$$

Where:
- $V_R$ is the voltage across the resistor
- $I$ is the current through the resistor  
- $R$ is the resistance value

## Frequency Response

The transfer function of the circuit is given by:

$$H(s) = \\frac{V_{out}(s)}{V_{in}(s)} = \\frac{1}{1 + sRC}$$

## Time Domain Analysis

The step response of the system can be expressed as:

$$v_{out}(t) = V_{in}(1 - e^{-t/RC})u(t)$$

## Performance Metrics

| Parameter | Value | Unit |
|-----------|-------|------|
| Cutoff Frequency | 1.59 | kHz |
| DC Gain | 0 | dB |
| Phase Margin | 90 | degrees |

## Code Implementation

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

def calculate_frequency_response(R, C, frequencies):
    omega = 2 * np.pi * frequencies
    s = 1j * omega
    H = 1 / (1 + s * R * C)
    return H

# Circuit parameters
R = 1000  # 1kΩ
C = 100e-6  # 100µF

# Frequency range
f = np.logspace(0, 5, 1000)  # 1Hz to 100kHz
H = calculate_frequency_response(R, C, f)

# Plot results
plt.figure(figsize=(10, 6))
plt.subplot(2, 1, 1)
plt.semilogx(f, 20*np.log10(np.abs(H)))
plt.ylabel('Magnitude (dB)')
plt.grid(True)

plt.subplot(2, 1, 2)  
plt.semilogx(f, np.angle(H)*180/np.pi)
plt.xlabel('Frequency (Hz)')
plt.ylabel('Phase (degrees)')
plt.grid(True)
plt.show()
\`\`\`

## Conclusions

The analysis reveals several important characteristics:

1. The circuit exhibits **low-pass filter** behavior
2. The **3dB cutoff frequency** is approximately 1.59 kHz
3. The **phase response** shows a gradual transition from 0° to -90°
4. The circuit is **stable** with good phase margin

### Recommendations

Based on the analysis, the following recommendations are made:

- Consider adding **temperature compensation** for improved stability
- Implement **impedance matching** at the input and output
- Add **protective circuitry** to prevent damage from overvoltage conditions
- Use **precision components** for critical applications

## Future Work

Future enhancements could include:

1. **Nonlinear analysis** for large signal conditions
2. **Noise analysis** to determine SNR characteristics  
3. **Monte Carlo simulation** for component tolerance effects
4. **Thermal analysis** for power dissipation considerations

## References

1. Sedra, A. S., & Smith, K. C. (2020). *Microelectronic Circuits*. Oxford University Press.
2. Gray, P. R., et al. (2009). *Analysis and Design of Analog Integrated Circuits*. Wiley.
3. Razavi, B. (2016). *Design of Analog CMOS Integrated Circuits*. McGraw-Hill Education.

---

*Report generated automatically by the PPP Circuit Analysis System*`;

  // Use test data if no real report data is available
  const finalReportData = reportData || testReportData;
  
  const increaseZoom = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const decreaseZoom = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    // Function to generate and download PDF from markdown report
  const handleDownloadPDF = () => {
    if (!finalReportData) return;
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
        </TabsContent>          {/* Report Tab Content - Enhanced with proper scrolling and floating toolbar */}
        <TabsContent value="report" className="flex-1 overflow-hidden flex flex-col">
          {finalReportData ? (
            <div className="relative flex-1 p-6">
              {/* Floating Toolbar */}
              <div className="absolute top-6 right-6 z-10 bg-slate-900/95 backdrop-blur-sm border border-electric-cyan rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-electric-light">Circuit Analysis Report</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 text-electric-light border-electric-cyan hover:bg-electric-cyan hover:text-slate-900 transition-all duration-200"
                  >
                    <FileDown size={16} />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </div>

              {/* Main Report Container - Single distinct container with dark background and electric-blue borders */}
              <div className="h-full bg-slate-900/80 border-2 border-electric-cyan rounded-lg shadow-2xl flex flex-col backdrop-blur-sm">
                {/* Internal scrollable content area with generous spacing */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-electric-cyan pt-16">
                  <div className="p-8 space-y-6">
                    {/* Hidden HTML for PDF export */}
                    <div style={{ display: 'none' }}>
                      <div ref={reportHtmlRef} className="prose prose-sm dark:prose-invert max-w-none prose-blue prose-headings:text-blue-300 prose-a:text-blue-300 prose-code:text-blue-200 prose-pre:bg-blue-950/30">                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {finalReportData}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Enhanced markdown styling for perfect readability */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          // Enhanced table styling
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-8 rounded-lg border border-electric-cyan/30">
                              <table className="w-full border-collapse bg-slate-800/50" {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => (
                            <th className="border-b border-electric-cyan/30 px-6 py-4 bg-electric-cyan/10 text-electric-light font-semibold text-left" {...props} />
                          ),
                          td: ({node, ...props}) => (
                            <td className="border-b border-slate-700/50 px-6 py-4 text-slate-200" {...props} />
                          ),
                          // Enhanced headers with electric styling
                          h1: ({node, ...props}) => (
                            <h1 className="text-4xl font-bold text-electric-light mb-8 pb-4 border-b-2 border-electric-cyan/50 leading-tight" {...props} />
                          ),
                          h2: ({node, ...props}) => (
                            <h2 className="text-3xl font-semibold text-electric-light mb-6 mt-12 pb-2 border-b border-electric-cyan/30 leading-tight" {...props} />
                          ),
                          h3: ({node, ...props}) => (
                            <h3 className="text-2xl font-medium text-electric-light mb-4 mt-8 leading-tight" {...props} />
                          ),
                          h4: ({node, ...props}) => (
                            <h4 className="text-xl font-medium text-electric-cyan mb-3 mt-6 leading-tight" {...props} />
                          ),
                          // Enhanced code blocks
                          code: ({node, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            if (match) {
                              return (
                                <div className="bg-slate-950 border border-electric-cyan/20 rounded-lg p-6 my-6 overflow-x-auto shadow-lg">
                                  <code className="text-electric-green text-sm font-mono leading-relaxed block" {...props}>
                                    {children}
                                  </code>
                                </div>
                              );
                            }
                            return (
                              <code className="bg-electric-dark/40 text-electric-cyan px-2 py-1 rounded font-mono text-sm border border-electric-cyan/20" {...props}>
                                {children}
                              </code>
                            );
                          },
                          // Enhanced paragraphs with perfect spacing
                          p: ({node, ...props}) => (
                            <p className="mb-6 leading-relaxed text-slate-200 text-lg" {...props} />
                          ),
                          // Enhanced lists
                          ul: ({node, ...props}) => (
                            <ul className="list-disc list-outside mb-6 space-y-2 ml-6 text-slate-200" {...props} />
                          ),
                          ol: ({node, ...props}) => (
                            <ol className="list-decimal list-outside mb-6 space-y-2 ml-6 text-slate-200" {...props} />
                          ),
                          li: ({node, ...props}) => (
                            <li className="mb-2 leading-relaxed" {...props} />
                          ),
                          // Enhanced blockquotes
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-electric-cyan pl-6 py-4 my-6 bg-slate-800/30 rounded-r-lg italic text-slate-300" {...props} />
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
                          ),                        }}
                      >
                        {finalReportData}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty state with circuit schematic styling
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-slate-900/60 border-2 border-dashed border-electric-cyan/50 rounded-lg p-12 max-w-md">
                <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center mb-6 mx-auto border border-electric-cyan/30">
                  <CircuitBoard size={36} className="text-electric-cyan" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-electric-light">No Report Available</h3>
                <p className="text-slate-400 leading-relaxed">
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