/**
 * TypeScript types for game data and related interfaces
 */

export interface GameVariant {
  name: string;
  price: number;
  description?: string;
}

export interface RobloxMethod {
  method: string;
  name: string;
  description: string;
  packages: GameVariant[];
}

export interface UserField {
  label: string;
  placeholder: string;
  required: boolean;
}

export interface UserFields {
  userId: UserField;
  zoneId?: UserField;
}

export interface GameInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  category: string;
  is_popular: boolean;
  image_url: string;
  banner_image_url?: string;
  icon_url?: string;
  variants: string; // JSON string
  currency_name: string;
  instructions?: string; // JSON array of strings
  user_fields?: string; // JSON object
  min_price?: number;
  max_price?: number;
  rating: number;
  total_reviews: number;
  status: 'active' | 'inactive' | 'maintenance';
  featured_until?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string; // JSON array of strings
  developer?: string;
  publisher?: string;
  release_date?: string;
  age_rating?: string;
  platforms?: string; // JSON array of strings
  created_at: string;
  updated_at: string;
}

export interface ParsedGameInfo extends Omit<GameInfo, 'variants' | 'instructions' | 'user_fields' | 'tags' | 'platforms'> {
  variants: GameVariant[] | RobloxMethod[];
  instructions: string[];
  user_fields: UserFields;
  tags: string[];
  platforms: string[];
}

export interface GameFormData {
  name: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  is_popular: boolean;
  image_url: string;
  banner_image_url: string;
  icon_url: string;
  variants: string;
  currency_name: string;
  instructions: string;
  user_fields: string;
  rating: number;
  status: 'active' | 'inactive' | 'maintenance';
  meta_title: string;
  meta_description: string;
  tags: string;
  developer: string;
  publisher: string;
  age_rating: string;
  platforms: string;
}

export interface GameSearchFilters {
  category?: string;
  is_popular?: boolean;
  status?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
}

export interface GameStats {
  total_games: number;
  popular_games: number;
  categories: { [key: string]: number };
  avg_rating: number;
  total_reviews: number;
}