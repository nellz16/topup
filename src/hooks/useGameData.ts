/**
 * Custom hook for game data management
 * Provides centralized game data fetching and caching
 */

import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/gameService';
import { ParsedGameInfo, GameSearchFilters } from '../types/game';

interface UseGameDataResult {
  games: ParsedGameInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchGames: (query: string) => Promise<void>;
  filterGames: (filters: GameSearchFilters) => Promise<void>;
}

export const useGameData = (initialFilters: GameSearchFilters = {}): UseGameDataResult => {
  const [games, setGames] = useState<ParsedGameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async (filters: GameSearchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedGames = await gameService.getAllGames({
        ...initialFilters,
        ...filters
      });
      
      setGames(fetchedGames);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch games';
      setError(errorMessage);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const refetch = useCallback(async () => {
    await fetchGames();
  }, [fetchGames]);

  const searchGames = useCallback(async (query: string) => {
    await fetchGames({ search: query });
  }, [fetchGames]);

  const filterGames = useCallback(async (filters: GameSearchFilters) => {
    await fetchGames(filters);
  }, [fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    refetch,
    searchGames,
    filterGames
  };
};

/**
 * Hook for fetching a single game by slug
 */
interface UseGameBySlugResult {
  game: ParsedGameInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGameBySlug = (slug: string): UseGameBySlugResult => {
  const [game, setGame] = useState<ParsedGameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    if (!slug) {
      setError('Game slug is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fetchedGame = await gameService.getGameBySlug(slug);
      
      if (!fetchedGame) {
        setError('Game not found');
      } else {
        setGame(fetchedGame);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch game';
      setError(errorMessage);
      console.error('Error fetching game:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const refetch = useCallback(async () => {
    await fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  return {
    game,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for popular games
 */
interface UsePopularGamesResult {
  popularGames: ParsedGameInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePopularGames = (limit: number = 8): UsePopularGamesResult => {
  const [popularGames, setPopularGames] = useState<ParsedGameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const games = await gameService.getPopularGames(limit);
      setPopularGames(games);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch popular games';
      setError(errorMessage);
      console.error('Error fetching popular games:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refetch = useCallback(async () => {
    await fetchPopularGames();
  }, [fetchPopularGames]);

  useEffect(() => {
    fetchPopularGames();
  }, [fetchPopularGames]);

  return {
    popularGames,
    loading,
    error,
    refetch
  };
};