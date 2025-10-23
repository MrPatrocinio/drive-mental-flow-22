
/**
 * Subscription Cache Service - Serviço para cache de assinatura
 * Responsabilidade: Cache local com TTL para evitar múltiplas chamadas
 * Princípio SRP: Apenas gerenciamento de cache de assinatura
 * Princípio SSOT: Fonte única para cache de dados de assinatura
 */

interface CachedSubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  subscription_status?: string; // 🔥 FASE 2: Status detalhado
  timestamp: number;
}

export class SubscriptionCacheService {
  private static readonly CACHE_KEY = 'subscription_cache';
  private static readonly TTL_MS = 5 * 60 * 1000; // 5 minutos

  /**
   * Verifica se o cache é válido
   */
  static isCacheValid(cachedData: CachedSubscriptionData): boolean {
    const now = Date.now();
    return (now - cachedData.timestamp) < this.TTL_MS;
  }

  /**
   * Obtém dados do cache se válidos
   */
  static getFromCache(): CachedSubscriptionData | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached) as CachedSubscriptionData;
      return this.isCacheValid(data) ? data : null;
    } catch (error) {
      console.warn('SubscriptionCacheService: Erro ao ler cache:', error);
      return null;
    }
  }

  /**
   * Armazena dados no cache
   */
  static setCache(subscriptionData: Omit<CachedSubscriptionData, 'timestamp'>): void {
    try {
      const cacheData: CachedSubscriptionData = {
        ...subscriptionData,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('SubscriptionCacheService: Erro ao salvar cache:', error);
    }
  }

  /**
   * Limpa o cache
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('SubscriptionCacheService: Erro ao limpar cache:', error);
    }
  }
}
