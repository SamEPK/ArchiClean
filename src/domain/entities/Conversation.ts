export interface ConversationProps {
  id: string;
  clientId: string;
  advisorId?: string | null;
  status?: 'open' | 'assigned' | 'closed';
  createdAt?: Date;
  firstResponderId?: string | null;
  firstResponseAt?: Date | null;
}

export class Conversation {
  id: string;
  clientId: string;
  advisorId?: string | null;
  status: 'open' | 'assigned' | 'closed';
  createdAt: Date;
  firstResponderId: string | null;
  firstResponseAt: Date | null;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.advisorId = props.advisorId ?? null;
    this.status = props.status ?? 'open';
    this.createdAt = props.createdAt ?? new Date();
    this.firstResponderId = props.firstResponderId ?? null;
    this.firstResponseAt = props.firstResponseAt ?? null;
  }
}
