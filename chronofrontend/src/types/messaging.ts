export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  file_path?: string;
  created_at: string;
  sender?: User;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  class_level: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  participants?: GroupParticipant[];
}

export interface GroupParticipant {
  id: number;
  group_id: number;
  user_id: number;
  role: string;
  is_active: boolean;
  created_at: string;
  user?: User;
}

export interface Conversation {
  id: number;
  participant1_id?: number;
  participant2_id?: number;
  group_id?: number;
  title?: string;
  type: string;
  last_message_id?: number;
  created_at: string;
  updated_at: string;
  participant1?: User;
  participant2?: User;
  group?: Group;
  lastMessage?: Message;
}

export interface MessagingSystemProps {
  currentUserId: number;
  currentUserRole: string;
}

