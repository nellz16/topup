/**
 * Routing utilities for dynamic game navigation
 * Provides scalable URL formatting and validation
 */

/**
 * Converts game name to URL-friendly format
 * Example: "Mobile Legends" -> "mobile-legends"
 */
export const formatGameNameForUrl = (gameName: string): string => {
  return gameName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Converts URL slug back to searchable game name
 * Example: "mobile-legends" -> "mobile legends"
 */
export const formatUrlToGameName = (urlSlug: string): string => {
  return urlSlug
    .replace(/-/g, ' ')
    .toLowerCase();
};

/**
 * Validates if a game name is valid for URL generation
 */
export const isValidGameName = (gameName: string): boolean => {
  return gameName && gameName.trim().length > 0;
};

/**
 * Generates the complete game detail URL
 */
export const generateGameUrl = (gameName: string): string => {
  if (!isValidGameName(gameName)) {
    throw new Error('Invalid game name provided');
  }
  return `/games/${formatGameNameForUrl(gameName)}`;
};

/**
 * Special handling for games with multiple methods (like Roblox)
 */
export const parseGameVariants = (variantsString: string) => {
  try {
    const parsed = JSON.parse(variantsString);
    
    // Check if it's the new format with methods
    if (Array.isArray(parsed) && parsed[0]?.method) {
      return parsed; // Return as-is for dual method games
    }
    
    // Return as-is for regular games
    return parsed;
  } catch (error) {
    console.error('Error parsing game variants:', error);
    return [];
  }
};