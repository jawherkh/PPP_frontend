// API service for communicating with the circuit design backend

const API_BASE_URL = 'http://localhost:8000';

export interface ProcessQueryRequest {
  query: string;
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

  static async processQuery(query: string): Promise<ProcessQueryResponse> {
    return this.request<ProcessQueryResponse>('/process-query', {
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
