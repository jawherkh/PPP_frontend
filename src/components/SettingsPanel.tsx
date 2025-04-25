
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useChatContext } from "@/context/ChatContext";

const SettingsPanel: React.FC = () => {
  const { settings, settingsPanelOpen, toggleSettingsPanel, updateSettings } = useChatContext();

  return (
    <Dialog open={settingsPanelOpen} onOpenChange={toggleSettingsPanel}>
      <DialogContent className="bg-card border-electric-dark">
        <DialogHeader>
          <DialogTitle className="text-electric-light flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-sm font-medium">Dark Mode</Label>
                <p className="text-muted-foreground text-xs">Enable or disable dark mode</p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                className="data-[state=checked]:bg-electric"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size" className="text-sm font-medium">Font Size</Label>
                <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
              </div>
              <Slider
                id="font-size"
                min={12}
                max={22}
                step={1}
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSettings({ fontSize: value })}
                className="[&>[data-state=active]:bg-electric] [&>[data-state=active]:bg-electric-accent]"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>12px</span>
                <span>22px</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-grid" className="text-sm font-medium">Circuit Grid</Label>
                <p className="text-muted-foreground text-xs">Show grid in circuit visualization</p>
              </div>
              <Switch
                id="show-grid"
                checked={settings.showCircuitGrid}
                onCheckedChange={(checked) => updateSettings({ showCircuitGrid: checked })}
                className="data-[state=checked]:bg-electric"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
