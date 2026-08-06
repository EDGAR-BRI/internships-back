import { Redis } from '@upstash/redis'
import env from '#start/env'

type CacheValue = unknown

const DEFAULT_TTL_SECONDS = 60
const MEMORY_PREFIX = 'cache:'

const memoryStore = new Map<string, { value: string; expiresAt: number }>()

const redisClient = (() => {
  const url = env.get('UPSTASH_REDIS_REST_URL')
  const token = env.get('UPSTASH_REDIS_REST_TOKEN')
  if (url && token) {
    return new Redis({ url, token })
  }
  return null
})()

function isEnabled(): boolean {
  return env.get('CACHE_ENABLED') !== false
}

function ttlSeconds(): number {
  return env.get('CACHE_TTL_SECONDS') || DEFAULT_TTL_SECONDS
}

export default class CacheService {
  /**
   * Devuelve el valor cacheado o null si no existe o expiró.
   */
  static async get<T = unknown>(key: string): Promise<T | null> {
    if (!isEnabled()) return null

    let raw: string | null
    if (redisClient) {
      raw = await redisClient.get<string>(key)
    } else {
      const entry = memoryStore.get(key)
      if (!entry) return null
      if (entry.expiresAt <= Date.now()) {
        memoryStore.delete(key)
        return null
      }
      raw = entry.value
    }

    if (raw === null || raw === undefined) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  /**
   * Almacena un valor con TTL en segundos (usa el TTL global por defecto).
   */
  static async set(key: string, value: CacheValue, ttl = ttlSeconds()): Promise<void> {
    if (!isEnabled()) return

    const raw = JSON.stringify(value)

    if (redisClient) {
      await redisClient.set(key, raw, { ex: ttl })
    } else {
      memoryStore.set(key, { value: raw, expiresAt: Date.now() + ttl * 1000 })
    }
  }

  static async del(key: string): Promise<void> {
    if (redisClient) {
      await redisClient.del(key)
    } else {
      memoryStore.delete(key)
    }
  }

  /**
   * Elimina todas las claves que empiezan con el prefijo dado.
   */
  static async delByPrefix(prefix: string): Promise<void> {
    if (!isEnabled()) return

    if (redisClient) {
      const keys: string[] = []
      let cursor = '0'
      do {
        const [next, batch] = await redisClient.scan(cursor, {
          match: `${prefix}*`,
          count: 100,
        })
        cursor = next
        keys.push(...batch)
      } while (cursor !== '0')
      if (keys.length > 0) {
        await redisClient.del(...keys)
      }
    } else {
      for (const key of [...memoryStore.keys()]) {
        if (key.startsWith(prefix)) {
          memoryStore.delete(key)
        }
      }
    }
  }

  /**
   * Clave de cache para un recurso de un usuario.
   */
  static userKey(userId: number, resource: string): string {
    return `${MEMORY_PREFIX}user:${userId}:${resource}`
  }

  /**
   * Invalida toda la cache de un usuario (al crear/actualizar/eliminar datos).
   */
  static async invalidateUser(userId: number): Promise<void> {
    await this.delByPrefix(`${MEMORY_PREFIX}user:${userId}`)
  }
}
