import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  created_at: string;
  matching_game_active: boolean;
};

export type ContentBlock = {
  id: string;
  module_id: string;
  block_type: 'text' | 'rich_text' | 'list' | 'stat' | 'accordion' | 'alert' | 'steps' | 'divider' | 'images';
  title: string | null;
  content: Record<string, unknown>;
  order_index: number;
  created_at: string;
};

export type UploadedImage = {
  id: string;
  url: string;
  storage_path: string;
  filename: string;
  alt_text: string;
  size_bytes: number;
  created_at: string;
};

export type Video = {
  id: string;
  module_id: string;
  title: string;
  youtube_id: string;
  description: string | null;
  order_index: number;
  created_at: string;
};

export type Resource = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  url: string;
  file_type: string;
  order_index: number;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  order_index: number;
  created_at: string;
};

export type QuizCompletion = {
  id: string;
  module_id: string;
  user_name: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  story: string;
  module_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  avatar_url: string | null;
  created_at: string;
};

export type SliderImage = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_type: 'module' | 'section' | 'external' | 'none';
  link_value: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  transition_effect: string;
};

export type DiplomaConfig = {
  id: string;
  title: string;
  congratulations_text: string;
  signer_name: string;
  signer_title: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
};

export type MatchingGamePair = {
  id: string;
  module_id: string;
  concept: string;
  definition: string;
  order_index: number;
  created_at: string;
};

export type CustomPage = {
  id: string;
  title: string;
  slug: string;
  content_html: string;
  content_type: 'html' | 'external_url';
  external_url: string | null;
  open_in_new_tab: boolean;
  show_on_home: boolean;
  button_text: string;
  button_bg_color: string;
  button_text_color: string;
  button_icon_url: string | null;
  button_icon_position: 'left' | 'right';
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ChildrenStory = {
  id: string;
  title: string;
  thumbnail_url: string;
  pdf_url: string | null;
  description: string | null;
  order_index: number;
  created_at: string;
  content_type: 'pdf' | 'video' | 'coloring' | 'game';
  youtube_url: string | null;
  html_file_url: string | null;
  game_url: string | null;
};
