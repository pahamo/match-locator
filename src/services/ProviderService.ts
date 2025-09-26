/**
 * Centralized provider service
 * Handles all provider lookups with caching and consistent fallbacks
 */

import { Provider } from '../types';
import { supabase } from './supabase';

interface ProviderRow {
  id: number;
  display_name?: string;
  name: string;
  type?: string;
}

class ProviderServiceClass {
  private cache = new Map<number, Provider>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes
  private lastFullLoad = 0;

  /**
   * Get providers by IDs with intelligent fallbacks
   */
  async getProviders(ids: number[]): Promise<Provider[]> {
    if (!ids.length) return [];

    // Remove duplicates
    const uniqueIds = Array.from(new Set(ids));

    // Check what we have in cache
    const fromCache: Provider[] = [];
    const needsLookup: number[] = [];

    for (const id of uniqueIds) {
      const cached = this.cache.get(id);
      if (cached && this.isCacheValid()) {
        fromCache.push(cached);
      } else {
        needsLookup.push(id);
      }
    }

    // Lookup missing providers
    if (needsLookup.length > 0) {
      const newProviders = await this.fetchProviders(needsLookup);
      newProviders.forEach(provider => {
        this.cache.set(parseInt(provider.id), provider);
      });
      fromCache.push(...newProviders);
    }

    return fromCache;
  }

  /**
   * Get single provider by ID
   */
  async getProvider(id: number): Promise<Provider | null> {
    const providers = await this.getProviders([id]);
    return providers[0] || null;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastFullLoad = 0;
  }

  private async fetchProviders(ids: number[]): Promise<Provider[]> {
    const providers: Provider[] = [];

    try {
      // Try to get from database
      const { data, error } = await supabase
        .from('providers')
        .select('id,display_name,name,type')
        .in('id', ids)
        .order('display_name', { ascending: true });

      if (!error && data) {
        const dbProviders = data.map((p: ProviderRow) => ({
          id: String(p.id),
          name: p.display_name || p.name || 'Unknown Provider',
          type: p.type || 'tv',
          href: this.getProviderUrl(p.id),
          status: 'confirmed' as const,
        }));
        providers.push(...dbProviders);
      }

    } catch (error) {
      console.warn('[ProviderService] Database fetch error:', error);
    }

    // Add fallbacks for known providers not in database
    const dbIds = new Set(providers.map(p => parseInt(p.id)));
    for (const id of ids) {
      if (!dbIds.has(id)) {
        const fallback = this.createFallbackProvider(id);
        if (fallback) {
          providers.push(fallback);
        }
      }
    }

    return providers;
  }

  private createFallbackProvider(id: number): Provider | null {
    // Known provider mappings
    const knownProviders: Record<number, Omit<Provider, 'id'>> = {
      1: {
        name: 'Sky Sports',
        type: 'tv',
        href: 'https://www.skysports.com/football/fixtures-results',
        status: 'confirmed',
      },
      2: {
        name: 'TNT Sports',
        type: 'tv',
        href: 'https://tntsports.co.uk/football',
        status: 'confirmed',
      },
      999: {
        name: 'Sky Sports',
        type: 'tv',
        href: 'https://www.skysports.com/football/fixtures-results',
        status: 'confirmed',
      },
      // BBC/ITV for FA Cup/International games
      3: {
        name: 'BBC',
        type: 'tv',
        href: 'https://www.bbc.co.uk/sport/football',
        status: 'confirmed',
      },
      4: {
        name: 'ITV',
        type: 'tv',
        href: 'https://www.itv.com/hub/itv1',
        status: 'confirmed',
      },
    };

    const known = knownProviders[id];
    if (known) {
      return {
        id: String(id),
        ...known,
      };
    }

    // Generic fallback for unknown providers
    return {
      id: String(id),
      name: 'Unknown Provider',
      type: 'tv',
      href: '',
      status: 'confirmed',
    };
  }

  private getProviderUrl(id: number): string {
    const urls: Record<number, string> = {
      1: 'https://www.skysports.com/football/fixtures-results',
      2: 'https://tntsports.co.uk/football',
      3: 'https://www.bbc.co.uk/sport/football',
      4: 'https://www.itv.com/hub/itv1',
      999: 'https://www.skysports.com/football/fixtures-results',
    };

    return urls[id] || '';
  }

  private isCacheValid(): boolean {
    return (Date.now() - this.lastFullLoad) < this.cacheTimeout;
  }
}

// Export singleton instance
export const ProviderService = new ProviderServiceClass();