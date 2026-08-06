import { test } from '@japa/runner'
import User from '#models/user'
import LogEntry from '#models/log_entry'
import Subscription from '#models/subscription'
import SubscriptionService from '#services/subscription_service'

let admin: User
let user: User

test.group('Cache', () => {
  test('setup users', async () => {
    admin = await User.create({
      email: 'cache-admin@example.com',
      password: 'password123',
      fullName: 'Cache Admin',
      role: 'admin',
    })
    user = await User.create({
      email: 'cache-user@example.com',
      password: 'password123',
      fullName: 'Cache User',
      role: 'user',
    })
    await SubscriptionService.assignPlan(user.id, 'free')
  })

  test('GET lists are invalidated after a mutation', async ({ client, assert }) => {
    const first = await client.get('/api/v1/log-entries').loginAs(user)
    first.assertStatus(200)
    assert.equal((first.body() as any).data.logEntries.length, 0)

    const created = await client.post('/api/v1/log-entries').loginAs(user).json({
      name: 'actividad cacheada',
      datStart: new Date().toISOString(),
      status: 'pending',
      week: 1,
      area: null,
      theory: null,
      impact: null,
      resources: null,
      datEnd: null,
    })
    created.assertStatus(200)

    const after = await client.get('/api/v1/log-entries').loginAs(user)
    after.assertStatus(200)
    const entries = (after.body() as any).data.logEntries
    assert.lengthOf(entries, 1)
    assert.equal(entries[0].name, 'actividad cacheada')
  })

  test('GET notes reflect new notes after invalidation', async ({ client, assert }) => {
    const first = await client.get('/api/v1/notes').loginAs(user)
    first.assertStatus(200)
    assert.equal((first.body() as any).data.notes.length, 0)

    await client
      .post('/api/v1/notes')
      .loginAs(user)
      .json({ content: 'nota cacheada', logEntryId: null })

    const after = await client.get('/api/v1/notes').loginAs(user)
    after.assertStatus(200)
    assert.equal((after.body() as any).data.notes[0].content, 'nota cacheada')
  })

  test('subscription cache is invalidated when admin assigns a plan', async ({
    client,
    assert,
  }) => {
    const before = await client.get('/api/v1/account/subscription').loginAs(user)
    before.assertStatus(200)
    assert.equal((before.body() as any).data.subscription.planSlug, 'free')

    await client
      .put(`/api/v1/admin/users/${user.id}/subscription`)
      .loginAs(admin)
      .json({ planSlug: 'pro' })

    const after = await client.get('/api/v1/account/subscription').loginAs(user)
    after.assertStatus(200)
    assert.equal((after.body() as any).data.subscription.planSlug, 'pro')
  })

  test('cleanup', async () => {
    await LogEntry.query().where('userId', user.id).delete()
    const sub = await Subscription.query().where('userId', user.id).first()
    if (sub) {
      await sub.delete()
    }
    await User.query().whereIn('id', [admin.id, user.id]).delete()
  })
})
