import { test } from '@japa/runner'
import User from '#models/user'
import UserSetting from '#models/user_setting'
import SubscriptionService from '#services/subscription_service'
import encryption from '@adonisjs/core/services/encryption'
import { DateTime } from 'luxon'

let admin: User
let freeUser: User
let proUser: User
let proUserWithKey: User

async function createUser(email: string, role: 'admin' | 'user' = 'user') {
  return User.create({ email, password: 'password123', fullName: email, role })
}

async function cleanupUser(email: string) {
  const existing = await User.findBy('email', email)
  if (existing) {
    await UserSetting.query().where('userId', existing.id).delete()
    await existing.delete()
  }
}

test.group('AI suggest', () => {
  test('setup users', async () => {
    await cleanupUser('ai-admin@example.com')
    await cleanupUser('ai-free@example.com')
    await cleanupUser('ai-pro@example.com')
    await cleanupUser('ai-pro-key@example.com')

    admin = await createUser('ai-admin@example.com', 'admin')
    freeUser = await createUser('ai-free@example.com')
    proUser = await createUser('ai-pro@example.com')
    proUserWithKey = await createUser('ai-pro-key@example.com')

    await SubscriptionService.assignPlan(freeUser.id, 'free')
    await SubscriptionService.assignPlan(proUser.id, 'pro')
    await SubscriptionService.assignPlan(proUserWithKey.id, 'pro')

    await UserSetting.create({
      userId: proUserWithKey.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 1 }),
      geminiApiKey: encryption.encrypt('fake-key-for-testing'),
    })
  })

  test('subscription payload exposes canUseAi', async ({ client, assert }) => {
    const res = await client.get('/api/v1/account/subscription').loginAs(freeUser)
    res.assertStatus(200)
    const body: any = res.body()
    assert.isFalse(body.data.subscription.canUseAi)

    const resPro = await client.get('/api/v1/account/subscription').loginAs(proUser)
    resPro.assertStatus(200)
    const bodyPro: any = resPro.body()
    assert.isTrue(bodyPro.data.subscription.canUseAi)

    const resAdmin = await client.get('/api/v1/account/subscription').loginAs(admin)
    resAdmin.assertStatus(200)
    const bodyAdmin: any = resAdmin.body()
    assert.isTrue(bodyAdmin.data.subscription.canUseAi)
  })

  test('settings returns masked api key', async ({ client, assert }) => {
    const res = await client.get('/api/v1/account/settings').loginAs(proUserWithKey)
    res.assertStatus(200)
    const body: any = res.body()
    assert.equal(body.data.settings.geminiApiKey, '••••ting')
  })

  test('free user is blocked with AI_NOT_AVAILABLE', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/ai/suggest')
      .loginAs(freeUser)
      .json({ name: 'Actividad', notes: [{ content: 'nota' }] })
    res.assertStatus(403)
    const body: any = res.body()
    assert.equal(body.code, 'AI_NOT_AVAILABLE')
  })

  test('pro user without key gets AI_KEY_MISSING', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/ai/suggest')
      .loginAs(proUser)
      .json({ name: 'Actividad', notes: [{ content: 'nota' }] })
    res.assertStatus(403)
    const body: any = res.body()
    assert.equal(body.code, 'AI_KEY_MISSING')
  })

  test('pro user with key reaches the provider', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/ai/suggest')
      .loginAs(proUserWithKey)
      .json({
        name: 'Configuración del entorno',
        area: 'Backend',
        notes: [{ content: 'Instalé Linux y configuré SSH' }],
      })
    res.assertStatus(502)
    const body: any = res.body()
    assert.include(['AI_PROVIDER_ERROR', 'AI_NETWORK_ERROR'], body.code)
  })
})
