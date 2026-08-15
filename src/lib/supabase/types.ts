export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  status: "draft" | "analyzing" | "generating" | "completed" | "failed";
  settings: Record<string, unknown>;
  product_analysis: Record<string, unknown> | null;
  reference_analysis: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  project_id: string;
  user_id: string;
  library_product_id: string | null;
  name: string;
  product_url: string | null;
  category: string;
  price: number | null;
  commission_rate: number | null;
  description: string;
  benefits: string[];
  problems_solved: string[];
  objections: string[];
  target_audience: string;
  image_paths: string[];
  analysis: Record<string, unknown> | null;
};

export type ProductLibraryItem = {
  id: string;
  user_id: string;
  name: string;
  product_url: string | null;
  category: string;
  price: number | null;
  commission_rate: number | null;
  rating: number | null;
  review_count: number | null;
  known_sales: number | null;
  description: string;
  benefits: string[];
  problems_solved: string[];
  objections: string[];
  target_audience: string;
  perceived_competition: string | null;
  notes: string | null;
  image_paths: string[];
  raw_data: Record<string, unknown>;
  analysis: Record<string, unknown> | null;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MovementPreset = {
  id: string;
  user_id: string | null;
  name: string;
  category: "fashion" | "product_demo" | "ugc" | "pov" | "cta";
  formats: string[];
  description: string;
  prompt_instruction: string;
  movement_json: Record<string, unknown>;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ContentPerformance = {
  id: string;
  user_id: string;
  project_id: string | null;
  generation_id: string | null;
  combination_number: number | null;
  hook_index: number | null;
  body_index: number | null;
  cta_index: number | null;
  hook_text: string;
  body_text: string;
  cta_text: string;
  platform: string;
  publication_url: string | null;
  published_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  orders: number;
  revenue: number;
  notes: string;
  source: "manual" | "automatic_link";
  match_status: "matched" | "pending";
  video_id: string | null;
  metrics_source: "manual" | "public_page" | "tiktok_display_api";
  analysis: Record<string, unknown>;
  retention_curve?: Array<{ second: number; retention: number }> | null;
  average_watch_seconds?: number | null;
  creative_dimensions?: {
    duration?: number;
    cta?: string;
    avatar?: string;
    voice?: string;
    format?: string;
  } | null;
  created_at: string;
  updated_at: string;
};

export type Avatar = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  image_path: string;
  source: "upload" | "generated";
  generation_prompt: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ScriptScene = {
  id?: string;
  scene_number: number;
  duration_seconds: number;
  spoken_text: string;
  speech_direction: string;
  visual_action: string;
  body_movement: string;
  camera_direction: string;
  framing: string;
  character_direction: string;
  product_direction: string;
  setting: string;
  continuity_rules: string;
  veo_prompt: string;
};

export type ScriptGeneration = {
  id: string;
  project_id: string;
  version: number;
  status: "pending" | "processing" | "completed" | "failed";
  strategy: Record<string, unknown> | null;
  full_script: string | null;
  headline: string | null;
  caption: string | null;
  hashtags: string[];
  result: Record<string, unknown> | null;
  processing_error: string | null;
  created_at: string;
  script_scenes?: ScriptScene[];
};
