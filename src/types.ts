export type MediaType = 'photo' | 'video';

export type StylePreset = 
  | 'cinematic' 
  | 'photorealistic' 
  | 'abstract' 
  | 'anime' 
  | 'scifi' 
  | 'fantasy' 
  | '3d-render';

export type TargetEngine = 
  | 'all' 
  | 'midjourney' 
  | 'runway' 
  | 'flux' 
  | 'dalle3' 
  | 'sora';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';

export interface CameraSettings {
  lens: string;
  angle: string;
  movement: string;
  speed: string;
  lighting: string;
  filmStock: string;
}

export interface PromptBreakdown {
  subject: string;
  environment: string;
  lighting: string;
  camera: string;
  aesthetics: string;
  motion: string;
}

export interface RecommendedSettings {
  midjourney: string;
  runway: string;
  general: string;
}

export interface PromptResult {
  id?: string;
  title: string;
  summary: string;
  masterPrompt: string;
  midjourneyPrompt: string;
  runwayPrompt: string;
  negativePrompt: string;
  stylePreset: StylePreset;
  aspectRatio: AspectRatio;
  cameraSettings: CameraSettings;
  promptBreakdown: PromptBreakdown;
  recommendedSettings: RecommendedSettings;
  variations: string[];
  mediaType?: MediaType;
  targetEngine?: TargetEngine;
  timestamp?: number;
  previewImageUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  promptResult?: PromptResult;
  timestamp: number;
  isInitial?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mediaType: MediaType;
  stylePreset: StylePreset;
  targetEngine: TargetEngine;
  aspectRatio: AspectRatio;
  messages: ChatMessage[];
  lastPromptResult?: PromptResult;
}

export type PlanTier = 'free' | 'golden' | 'diamond' | 'premium' | 'enterprise';

export interface UserSubscription {
  plan: PlanTier;
  dailyChatsRemaining: number;
  dailyChatsLimit: number;
  monthlyChatsRemaining: number;
  monthlyChatsLimit: number;
  lastResetDate: string; // YYYY-MM-DD
  billingCycleEnd: string;
  teamMembers?: string[];
  companyName?: string;
  isOwner?: boolean;
  ownerEmail?: string;
}

export interface AppAnalytics {
  totalRevenueMonthly: number;
  subscribers: {
    free: number;
    golden: number;
    diamond: number;
    premium: number;
    enterprise: number;
  };
  totalPromptsGenerated: number;
}

export interface PlanDetails {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  dailyChats: number;
  monthlyChats: number;
  popular?: boolean;
  unlimited?: boolean;
  customPricing?: boolean;
  features: string[];
}
