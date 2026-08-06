import { test } from '@japa/runner'
import User from '#models/user'
import SubscriptionService from '#services/subscription_service'

let user: User
let googleUser: User

test.group('Account profile & password', () => {
  test('setup users', async () => {
    user = await User.create({
      email: 'account-user@example.com',
      password: 'password123',
      fullName: 'Account User',
      role: 'user',
    })
    await SubscriptionService.assignPlan(user.id, 'free')
    googleUser = await User.create({
      email: 'account-google@example.com',
      fullName: 'Google User',
      role: 'user',
      provider: 'google',
      providerId: 'google-123',
    })
    await SubscriptionService.assignPlan(googleUser.id, 'free')
  })

  test('updates profile fullName', async ({ client, assert }) => {
    const res = await client
      .put('/api/v1/account/profile')
      .loginAs(user)
      .json({ fullName: 'Nombre Actualizado' })
    res.assertStatus(200)
    assert.equal((res.body() as any).data.user.fullName, 'Nombre Actualizado')

    const profile = await client.get('/api/v1/account/profile').loginAs(user)
    profile.assertStatus(200)
    assert.equal((profile.body() as any).data.fullName, 'Nombre Actualizado')
  })

  test('changes password with correct current password', async ({ client, assert }) => {
    const res = await client
      .put('/api/v1/account/password')
      .loginAs(user)
      .json({
        currentPassword: 'password123',
        newPassword: 'newpassword456',
        passwordConfirmation: 'newpassword456',
      })
    res.assertStatus(200)

    const oldLogin = await client
      .post('/api/v1/auth/login')
      .json({ email: 'account-user@example.com', password: 'password123' })
    oldLogin.assertStatus(400)

    const newLogin = await client
      .post('/api/v1/auth/login')
      .json({ email: 'account-user@example.com', password: 'newpassword456' })
    newLogin.assertStatus(200)
    assert.isDefined((newLogin.body() as any).data.token)
  })

  test('rejects wrong current password', async ({ client }) => {
    const res = await client
      .put('/api/v1/account/password')
      .loginAs(user)
      .json({
        currentPassword: 'wrongpass',
        newPassword: 'another456',
        passwordConfirmation: 'another456',
      })
    res.assertStatus(400)
  })

  test('rejects mismatched confirmation', async ({ client }) => {
    const res = await client
      .put('/api/v1/account/password')
      .loginAs(user)
      .json({
        currentPassword: 'newpassword456',
        newPassword: 'somepass789',
        passwordConfirmation: 'different789',
      })
    res.assertStatus(422)
  })

  test('google user sets a password without current password', async ({ client }) => {
    const res = await client
      .put('/api/v1/account/password')
      .loginAs(googleUser)
      .json({
        newPassword: 'googlepass123',
        passwordConfirmation: 'googlepass123',
      })
    res.assertStatus(200)

    const login = await client
      .post('/api/v1/auth/login')
      .json({ email: 'account-google@example.com', password: 'googlepass123' })
    login.assertStatus(200)
  })

  test('cleanup', async () => {
    await User.query().whereIn('id', [user.id, googleUser.id]).delete()
  })
})
