export type SibotCapability =
  | 'chat'
  | 'streaming'
  | 'read-only'
  | 'evidence-first'
  | 'charts'
  | 'tables'
  | 'logs';

export type SibotGuardrailVerdict =
  | 'in_scope'
  | 'out_of_scope'
  | 'unsafe'
  | 'read_only_blocked';

export interface SibotCitation {
  module: string;
  source: string;
  title: string;
  period?: string | null;
}

export interface SibotToolResult<T = unknown> {
  module: string;
  summary: string;
  data: T;
  recordCount: number;
  filtersApplied: Record<string, unknown>;
  citations: SibotCitation[];
  suggestedFollowUps: string[];
  status?: 'success' | 'error';
}

export interface SibotModule {
  id: string;
  label: string;
  description: string;
  toolNames: string[];
}

export interface SibotScope {
  roles: string[];
  mode: 'read-only';
}

export interface SibotGuardrailResult {
  verdict: SibotGuardrailVerdict;
  reason: string;
  message?: string;
  toolChoice: 'auto' | 'required';
}

export interface SibotToolExecutionContext {
  sessionId: string;
  userId: string;
}

export interface SibotToolExecutionLog {
  toolName: string;
  status: 'success' | 'error';
  filtersApplied?: Record<string, unknown>;
  summary: string;
  citations?: SibotCitation[];
  recordCount?: number;
  period?: string | null;
  durationMs?: number;
}
