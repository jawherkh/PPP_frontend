// API service for communicating with the circuit design backend

const API_BASE_URL = 'http://localhost:8000';

export interface ProcessQueryRequest {
  query: string;
  endpoint?: 'auto' | 'simple' | 'classify' | 'full';
}

export interface ProcessQueryResponse {
  session_id: string;
  status: 'success' | 'error' | 'processing';
  files?: {
    schema_diagram?: string;
    circuit_plot?: string;
    analysis_report?: string;
    summary_report?: string;
  };
  message?: string;
  error?: string;
  query?: string;
}

export interface SimpleQueryResponse {
  response: string;
  type: 'simple';
  confidence?: number;
}

export interface ClassifyQueryResponse {
  classification: 'simple' | 'complex';
  confidence: number;
  reasoning: string;
}

export class CircuitDesignAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }
  static async processQuery(query: string, endpoint?: 'auto' | 'simple' | 'classify' | 'full'): Promise<ProcessQueryResponse> {
    const body: ProcessQueryRequest = { query };
    if (endpoint) {
      body.endpoint = endpoint;
    }
    return this.request<ProcessQueryResponse>('/process-query', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async simpleQuery(query: string): Promise<SimpleQueryResponse> {
    return this.request<SimpleQueryResponse>('/simple-query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  static async classifyQuery(query: string): Promise<ClassifyQueryResponse> {
    return this.request<ClassifyQueryResponse>('/classify-query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  static async getSessionInfo(sessionId: string) {
    return this.request(`/session/${sessionId}`);
  }

  static async listSessions() {
    return this.request('/sessions');
  }

  static async deleteSession(sessionId: string) {
    return this.request(`/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Helper method to construct file URLs
  static getFileUrl(sessionId: string, filename: string): string {
    return `${API_BASE_URL}/files/${sessionId}/${filename}`;
  }
}
