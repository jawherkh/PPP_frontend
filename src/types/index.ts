
export type MessageType = 'user' | 'bot';

export interface MessageData {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  circuitImage?: string;
  plotData?: PlotData[];
  reportData?: string; // Full analysis report content in markdown format
}

export interface PlotData {
  id: string;
  title: string;
  imageUrl: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}

export interface SettingsData {
  darkMode: boolean;
  fontSize: number;
  showCircuitGrid: boolean;
}
