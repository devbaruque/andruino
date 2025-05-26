import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.cacheConfig = {
      maxMemoryItems: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      maxStorageSize: 50 * 1024 * 1024, // 50MB
    };
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  // Gerar chave de cache
  generateKey(namespace, key, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(k => `${k}:${params[k]}`)
      .join('|');
    
    return `${namespace}:${key}${paramString ? `:${paramString}` : ''}`;
  }

  // Verificar se item está expirado
  isExpired(item) {
    if (!item.expiresAt) return false;
    return Date.now() > item.expiresAt;
  }

  // Obter item do cache de memória
  getFromMemory(key) {
    const item = this.memoryCache.get(key);
    
    if (!item) {
      this.cacheStats.misses++;
      return null;
    }
    
    if (this.isExpired(item)) {
      this.memoryCache.delete(key);
      this.cacheStats.misses++;
      return null;
    }
    
    // Atualizar último acesso
    item.lastAccessed = Date.now();
    this.cacheStats.hits++;
    
    return item.data;
  }

  // Armazenar item no cache de memória
  setInMemory(key, data, ttl = this.cacheConfig.defaultTTL) {
    // Verificar limite de itens
    if (this.memoryCache.size >= this.cacheConfig.maxMemoryItems) {
      this.evictLRU();
    }
    
    const item = {
      data,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + ttl : null,
      size: this.estimateSize(data),
    };
    
    this.memoryCache.set(key, item);
  }

  // Remover item menos recentemente usado
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.cacheStats.evictions++;
    }
  }

  // Estimar tamanho do objeto
  estimateSize(obj) {
    try {
      return JSON.stringify(obj).length * 2; // Aproximação em bytes
    } catch {
      return 1024; // Fallback
    }
  }

  // Obter item do AsyncStorage
  async getFromStorage(key) {
    try {
      const stored = await AsyncStorage.getItem(`cache:${key}`);
      if (!stored) return null;
      
      const item = JSON.parse(stored);
      
      if (this.isExpired(item)) {
        await AsyncStorage.removeItem(`cache:${key}`);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Erro ao ler cache do storage:', error);
      return null;
    }
  }

  // Armazenar item no AsyncStorage
  async setInStorage(key, data, ttl = this.cacheConfig.defaultTTL) {
    try {
      const item = {
        data,
        createdAt: Date.now(),
        expiresAt: ttl > 0 ? Date.now() + ttl : null,
        size: this.estimateSize(data),
      };
      
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Erro ao salvar cache no storage:', error);
    }
  }

  // Obter item (verifica memória primeiro, depois storage)
  async get(namespace, key, params = {}) {
    const cacheKey = this.generateKey(namespace, key, params);
    
    // Tentar cache de memória primeiro
    const memoryResult = this.getFromMemory(cacheKey);
    if (memoryResult !== null) {
      return memoryResult;
    }
    
    // Tentar AsyncStorage
    const storageResult = await this.getFromStorage(cacheKey);
    if (storageResult !== null) {
      // Colocar de volta na memória para acesso rápido
      this.setInMemory(cacheKey, storageResult);
      return storageResult;
    }
    
    return null;
  }

  // Armazenar item (memória e storage)
  async set(namespace, key, data, options = {}) {
    const {
      ttl = this.cacheConfig.defaultTTL,
      memoryOnly = false,
      storageOnly = false,
      params = {}
    } = options;
    
    const cacheKey = this.generateKey(namespace, key, params);
    
    if (!storageOnly) {
      this.setInMemory(cacheKey, data, ttl);
    }
    
    if (!memoryOnly) {
      await this.setInStorage(cacheKey, data, ttl);
    }
  }

  // Remover item específico
  async remove(namespace, key, params = {}) {
    const cacheKey = this.generateKey(namespace, key, params);
    
    this.memoryCache.delete(cacheKey);
    
    try {
      await AsyncStorage.removeItem(`cache:${cacheKey}`);
    } catch (error) {
      console.warn('Erro ao remover cache do storage:', error);
    }
  }

  // Limpar namespace específico
  async clearNamespace(namespace) {
    // Limpar memória
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Limpar storage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const namespaceKeys = keys.filter(key => 
        key.startsWith(`cache:${namespace}:`)
      );
      
      if (namespaceKeys.length > 0) {
        await AsyncStorage.multiRemove(namespaceKeys);
      }
    } catch (error) {
      console.warn('Erro ao limpar namespace do storage:', error);
    }
  }

  // Limpar todo o cache
  async clearAll() {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.warn('Erro ao limpar todo o cache:', error);
    }
    
    // Resetar estatísticas
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  // Obter estatísticas do cache
  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0;
    
    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memoryItems: this.memoryCache.size,
      memorySize: this.getMemorySize(),
    };
  }

  // Obter tamanho do cache de memória
  getMemorySize() {
    let totalSize = 0;
    
    for (const item of this.memoryCache.values()) {
      totalSize += item.size || 0;
    }
    
    return totalSize;
  }

  // Limpar itens expirados
  async cleanupExpired() {
    let cleanedCount = 0;
    
    // Limpar memória
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }
    
    // Limpar storage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      
      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const item = JSON.parse(stored);
          if (this.isExpired(item)) {
            await AsyncStorage.removeItem(key);
            cleanedCount++;
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao limpar itens expirados:', error);
    }
    
    return cleanedCount;
  }

  // Pré-carregar dados importantes
  async preload(namespace, items) {
    const promises = items.map(async ({key, loader, ttl, params}) => {
      const cached = await this.get(namespace, key, params);
      
      if (cached === null && loader) {
        try {
          const data = await loader();
          await this.set(namespace, key, data, {ttl, params});
          return {key, success: true};
        } catch (error) {
          console.warn(`Erro ao pré-carregar ${key}:`, error);
          return {key, success: false, error};
        }
      }
      
      return {key, success: true, cached: true};
    });
    
    return Promise.all(promises);
  }

  // Configurar cache
  configure(config) {
    this.cacheConfig = {
      ...this.cacheConfig,
      ...config,
    };
  }
}

// Instância singleton
const cacheService = new CacheService();

export default cacheService; 