export interface AnalysisResult {
  percentAI?: number;
  verdict: string;
  details: string;
  confidence?: number;
}

export interface JobAnalysisResult {
  verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'POTENTIAL_SCAM';
  evidence: string[];
  redFlags: string[];
  companyStatus: string;
}

export interface NewsAnalysisResult {
  verdict: 'REAL' | 'FAKE' | 'MISLEADING';
  correction: string;
  sources: {
    title: string;
    uri: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}