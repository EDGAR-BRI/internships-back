import { test } from '@japa/runner'
import CacheService from '#services/cache_service'

test.group('CacheService', () => {
  test('set and get roundtrip', async ({ assert }) => {
    const key = `test:roundtrip:${Date.now()}`
    const value = { foo: 'bar', n: 42 }

    await CacheService.set(key, value)
    const result = await CacheService.get(key)

    assert.deepEqual(result, value)
  })

  test('get returns null for missing key', async ({ assert }) => {
    const result = await CacheService.get(`test:missing:${Date.now()}`)
    assert.isNull(result)
  })

  test('expires entries after ttl', async ({ assert }) => {
    const key = `test:expiry:${Date.now()}`
    await CacheService.set(key, { data: true }, 1)

    const fresh = await CacheService.get(key)
    assert.isNotNull(fresh)

    await new Promise((resolve) => setTimeout(resolve, 1100))
    const expired = await CacheService.get(key)
    assert.isNull(expired)
  })

  test('del removes an entry', async ({ assert }) => {
    const key = `test:del:${Date.now()}`
    await CacheService.set(key, { data: true })
    await CacheService.del(key)

    assert.isNull(await CacheService.get(key))
  })

  test('delByPrefix removes matching keys only', async ({ assert }) => {
    const prefix = `test:prefix:${Date.now()}`
    const a = `${prefix}:a`
    const b = `${prefix}:b`
    const other = `test:other:${Date.now()}:x`

    await CacheService.set(a, { x: 1 })
    await CacheService.set(b, { x: 2 })
    await CacheService.set(other, { x: 3 })

    await CacheService.delByPrefix(prefix)

    assert.isNull(await CacheService.get(a))
    assert.isNull(await CacheService.get(b))
    assert.isNotNull(await CacheService.get(other))
  })

  test('invalidateUser clears all user resources', async ({ assert }) => {
    const userId = Date.now()
    await CacheService.set(CacheService.userKey(userId, 'notes'), { data: 1 })
    await CacheService.set(CacheService.userKey(userId, 'log-entries'), { data: 2 })

    await CacheService.invalidateUser(userId)

    assert.isNull(await CacheService.get(CacheService.userKey(userId, 'notes')))
    assert.isNull(await CacheService.get(CacheService.userKey(userId, 'log-entries')))
  })
})
