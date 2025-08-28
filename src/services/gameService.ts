/**
 * Game Service - Handles all game-related database operations
 * Provides CRUD operations for game_info table in Xata database
 */

import { API_CONFIG, getHeaders } from '../utils/api';
import { GameInfo, ParsedGameInfo, GameFormData, GameSearchFilters, GameStats } from '../types/game';

export class GameService {
  private static instance: GameService;
  
  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  /**
   * Check if Xata is properly configured
   */
  private isConfigured(): boolean {
    return !!(
      API_CONFIG.XATA_API_KEY && 
      API_CONFIG.XATA_DB_URL &&
      API_CONFIG.XATA_API_KEY !== 'your_xata_api_key_here' &&
      !API_CONFIG.XATA_DB_URL.includes('your-workspace')
    );
  }

  /**
   * Generate URL-friendly slug from game name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Parse game data from database format to application format
   */
  private parseGameData(game: GameInfo): ParsedGameInfo {
    try {
      return {
        ...game,
        variants: game.variants ? JSON.parse(game.variants) : [],
        instructions: game.instructions ? JSON.parse(game.instructions) : [],
        user_fields: game.user_fields ? JSON.parse(game.user_fields) : { userId: { label: 'User ID', placeholder: 'Enter User ID', required: true } },
        tags: game.tags ? JSON.parse(game.tags) : [],
        platforms: game.platforms ? JSON.parse(game.platforms) : []
      };
    } catch (error) {
      console.error('Error parsing game data:', error);
      return {
        ...game,
        variants: [],
        instructions: [],
        user_fields: { userId: { label: 'User ID', placeholder: 'Enter User ID', required: true } },
        tags: [],
        platforms: []
      };
    }
  }

  /**
   * Get all games with optional filtering
   */
  async getAllGames(filters: GameSearchFilters = {}): Promise<ParsedGameInfo[]> {
    if (!this.isConfigured()) {
      throw new Error('Xata database is not configured. Please check your environment variables.');
    }

    try {
      const queryFilter: any = {};
      
      // Apply filters
      if (filters.category) {
        queryFilter.category = filters.category;
      }
      
      if (filters.is_popular !== undefined) {
        queryFilter.is_popular = filters.is_popular;
      }
      
      if (filters.status) {
        queryFilter.status = filters.status;
      } else {
        queryFilter.status = 'active'; // Default to active games
      }

      // Search filter
      if (filters.search) {
        queryFilter.$any = [
          { name: { $iContains: filters.search } },
          { description: { $iContains: filters.search } },
          { tags: { $iContains: filters.search } }
        ];
      }

      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/game_info/query`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          filter: queryFilter,
          sort: [
            { is_popular: 'desc' },
            { rating: 'desc' },
            { name: 'asc' }
          ],
          page: { size: 100 }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.records || []).map((game: GameInfo) => this.parseGameData(game));
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  /**
   * Get game by slug
   */
  async getGameBySlug(slug: string): Promise<ParsedGameInfo | null> {
    if (!this.isConfigured()) {
      throw new Error('Xata database is not configured. Please check your environment variables.');
    }

    try {
      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/game_info/query`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          filter: { 
            slug: slug,
            status: 'active'
          },
          page: { size: 1 }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch game: ${response.statusText}`);
      }

      const data = await response.json();
      const games = data.records || [];
      
      if (games.length === 0) {
        return null;
      }

      return this.parseGameData(games[0]);
    } catch (error) {
      console.error('Error fetching game by slug:', error);
      throw error;
    }
  }

  /**
   * Get popular games
   */
  async getPopularGames(limit: number = 8): Promise<ParsedGameInfo[]> {
    const games = await this.getAllGames({ is_popular: true, status: 'active' });
    return games.slice(0, limit);
  }

  /**
   * Get games by category
   */
  async getGamesByCategory(category: string): Promise<ParsedGameInfo[]> {
    return this.getAllGames({ category, status: 'active' });
  }

  /**
   * Search games
   */
  async searchGames(query: string): Promise<ParsedGameInfo[]> {
    return this.getAllGames({ search: query, status: 'active' });
  }

  /**
   * Create new game
   */
  async createGame(gameData: GameFormData): Promise<GameInfo> {
    if (!this.isConfigured()) {
      throw new Error('Xata database is not configured. Please check your environment variables.');
    }

    try {
      // Generate slug if not provided
      if (!gameData.slug) {
        gameData.slug = this.generateSlug(gameData.name);
      }

      // Validate JSON fields
      try {
        JSON.parse(gameData.variants);
        JSON.parse(gameData.instructions);
        JSON.parse(gameData.user_fields);
        JSON.parse(gameData.tags);
        JSON.parse(gameData.platforms);
      } catch (error) {
        throw new Error('Invalid JSON format in one of the fields');
      }

      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/game_info/data`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          ...gameData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create game: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  /**
   * Update existing game
   */
  async updateGame(id: string, gameData: Partial<GameFormData>): Promise<GameInfo> {
    if (!this.isConfigured()) {
      throw new Error('Xata database is not configured. Please check your environment variables.');
    }

    try {
      // Validate JSON fields if they exist
      if (gameData.variants) {
        JSON.parse(gameData.variants);
      }
      if (gameData.instructions) {
        JSON.parse(gameData.instructions);
      }
      if (gameData.user_fields) {
        JSON.parse(gameData.user_fields);
      }
      if (gameData.tags) {
        JSON.parse(gameData.tags);
      }
      if (gameData.platforms) {
        JSON.parse(gameData.platforms);
      }

      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/game_info/data/${id}`, {
        method: 'PATCH',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          ...gameData,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update game: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  }

  /**
   * Delete game
   */
  async deleteGame(id: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Xata database is not configured. Please check your environment variables.');
    }

    try {
      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/game_info/data/${id}`, {
        method: 'DELETE',
        headers: getHeaders('xata')
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete game: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }

  /**
   * Get game statistics for admin dashboard
   */
  async getGameStats(): Promise<GameStats> {
    if (!this.isConfigured()) {
      throw new Error('Xata database is not configured. Please check your environment variables.');
    }

    try {
      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/game_info/aggregate`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          aggs: {
            total_games: { count: '*' },
            popular_games: { count: '*', filter: { is_popular: true } },
            avg_rating: { avg: 'rating' },
            total_reviews: { sum: 'total_reviews' }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch game stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Get category breakdown
      const categoryResponse = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/game_info/query`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          columns: ['category'],
          page: { size: 1000 }
        })
      });

      const categoryData = await categoryResponse.json();
      const categories: { [key: string]: number } = {};
      
      (categoryData.records || []).forEach((record: any) => {
        categories[record.category] = (categories[record.category] || 0) + 1;
      });

      return {
        total_games: data.aggs.total_games || 0,
        popular_games: data.aggs.popular_games || 0,
        categories,
        avg_rating: data.aggs.avg_rating || 0,
        total_reviews: data.aggs.total_reviews || 0
      };
    } catch (error) {
      console.error('Error fetching game stats:', error);
      throw error;
    }
  }

  /**
   * Toggle game popularity status
   */
  async togglePopularity(id: string, isPopular: boolean): Promise<void> {
    await this.updateGame(id, { is_popular: isPopular });
  }

  /**
   * Update game status
   */
  async updateGameStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<void> {
    await this.updateGame(id, { status });
  }
}

// Export singleton instance
export const gameService = GameService.getInstance();