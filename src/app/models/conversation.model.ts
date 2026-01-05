export interface Conversation {
  id?: string;
  messages: Message[];
  createdAt?: any;
  updatedAt?: any;
  resolved?: boolean;
  userId: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
  loading?: boolean;
}
