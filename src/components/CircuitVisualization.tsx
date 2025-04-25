
import { CircuitBoard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CircuitVisualization: React.FC = () => {
  return (
    <div className="h-full flex flex-col border-l border-border">
      <div className="flex items-center justify-between border-b border-border p-2 bg-card">
        <div className="flex items-center gap-2">
          <CircuitBoard className="h-5 w-5 text-electric-light" />
          <span className="font-medium">Circuit Visualization</span>
        </div>
      </div>
      
      <Tabs defaultValue="schematic" className="flex-1">
        <div className="border-b border-border">
          <TabsList className="w-full justify-start rounded-none border-none bg-transparent p-0">
            <TabsTrigger 
              value="schematic" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-electric-light data-[state=active]:bg-transparent"
            >
              Schematic
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-electric-light data-[state=active]:bg-transparent"
            >
              Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="schematic" className="flex-1 p-4 overflow-auto grid-bg mt-0">
          <div className="flex items-center justify-center h-full">
            <div className="border border-dashed border-electric p-8 rounded-lg bg-background/50">
              <div className="flex flex-col items-center gap-4">
                <div className="oscilloscope-glow">
                  <CircuitBoard size={100} className="text-electric-green" />
                </div>
                <p className="text-center text-sm text-muted-foreground max-w-xs">
                  Circuit schematic will be displayed here
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="flex-1 p-4 overflow-auto grid-bg mt-0">
          <div className="flex items-center justify-center h-full">
            <div className="border border-dashed border-electric p-8 rounded-lg bg-background/50">
              <div className="flex flex-col items-center gap-4">
                <div className="oscilloscope-glow">
                  <CircuitBoard size={100} className="text-electric-green" />
                </div>
                <p className="text-center text-sm text-muted-foreground max-w-xs">
                  Circuit analysis and plots will appear here
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CircuitVisualization;
