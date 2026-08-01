export type AppUser = {
  id: string;
  email: string;
  displayName: string;
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
