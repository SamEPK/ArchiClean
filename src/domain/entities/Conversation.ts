export interface ConversationProps {
  id: string;
  clientId: string;
  advisorId?: string | null;
  status?: 'open' | 'assigned' | 'closed';
  createdAt?: Date;
}

export class Conversation {
  id: string;
  clientId: string;
  advisorId?: string | null;
  status: 'open' | 'assigned' | 'closed';
  createdAt: Date;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.advisorId = props.advisorId ?? null;
    this.status = props.status ?? 'open';
    this.createdAt = props.createdAt ?? new Date();
  }
}
