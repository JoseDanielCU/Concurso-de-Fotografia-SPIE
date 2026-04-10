export type Phase = 1 | 2 | 3;

export interface Settings {
  id: string;
  current_phase: Phase;
  created_at: string;
  updated_at: string;
}

export interface Category {
  max_phase2_participants: number;
  id: string;
  name: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
  phase1_finalists_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  category_id: string;
  name: string;
  photo_url: string;
  photo_storage_path: string | null;
  description: string | null;
  is_finalist: boolean;
  is_phase2_winner: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  category_id: string;
  participant_id: string;
  voter_token: string;
  created_at: string;
}

export interface VoteCount {
  participant_id: string;
  name: string;
  photo_url: string;
  category_id: string;
  is_finalist: boolean;
  is_phase2_winner: boolean;
  category_name: string;
  category_slug: string;
  vote_count: number;
}

export interface CategoryWithParticipants extends Category {
  participants: Participant[];
}

export interface CategoryWithVoteCounts extends Category {
  participants: VoteCount[];
}

// Form types
export interface CreateCategoryForm {
  name: string;
  description: string;
  slug: string;
  phase1_finalists_count: number;
  sort_order: number;
}

export interface CreateParticipantForm {
  name: string;
  category_id: string;
  description: string;
  photo: File | null;
}

export interface AdminUser {
  id: string;
  email: string;
}