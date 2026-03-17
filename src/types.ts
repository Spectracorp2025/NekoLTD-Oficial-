export interface User {
  id: number;
  name: string;
  role: 'normal' | 'premium' | 'plus' | 'admin';
  phone: string;
  country?: string;
  age?: number;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  message: string;
  created_at: string;
}

export interface ForumPost {
  id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  title: string;
  content: string;
  created_at: string;
  comment_count: number;
}

export interface Ad {
  id: number;
  title: string;
  content: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
}
