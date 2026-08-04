import { test } from '@japa/runner'
import User from '#models/user'

test.group('Admin users', () => {
  let admin: User
  let regular: User

  test('setup users', async () => {
    admin = await User.create({
      email: 'admin-test@example.com',
      password: 'password123',
      fullName: 'Admin Test',
      role: 'admin',
    })
    regular = await User.create({
      email: 'regular-test@example.com',
      password: 'password123',
      fullName: 'Regular Test',
      role: 'user',
    })
  })

  test('non-admin gets 403 on admin endpoints', async ({ client }) => {
    const res = await client.get('/api/v1/admin/users').loginAs(regular)
    res.assertStatus(403)
  })

  test('admin lists users', async ({ client, assert }) => {
    const res = await client.get('/api/v1/admin/users').loginAs(admin)
    res.assertStatus(200)
    const raw: any = res.body()
    const body = Array.isArray(raw) ? raw : raw.data
    const found = body.find((u: any) => u.email === regular.email)
    assert.exists(found)
    assert.equal(found.completedDays, 0)
  })

  test('admin gets summary', async ({ client, assert }) => {
    const res = await client.get('/api/v1/admin/summary').loginAs(admin)
    res.assertStatus(200)
    const raw: any = res.body()
    const summary = Array.isArray(raw) ? raw : raw.data.summary
    assert.isObject(summary)
    assert.isAbove(summary.totalUsers, 0)
  })

  test('admin gets user detail', async ({ client, assert }) => {
    const res = await client.get(`/api/v1/admin/users/${regular.id}`).loginAs(admin)
    res.assertStatus(200)
    const body = res.body().data
    assert.equal(body.id, regular.id)
    assert.isTrue(!!body.initials)
    assert.isAbove(body.progress.totalHours, 0)
  })

  test('detail of missing user returns 404', async ({ client }) => {
    const res = await client.get('/api/v1/admin/users/999999').loginAs(admin)
    res.assertStatus(404)
  })

  test('admin promotes user to admin', async ({ client, assert }) => {
    const res = await client.patch(`/api/v1/admin/users/${regular.id}/role`).loginAs(admin).json({
      role: 'admin',
    })
    res.assertStatus(200)
    await regular.refresh()
    assert.equal(regular.role, 'admin')
  })

  test('admin demotes user back', async ({ client, assert }) => {
    const res = await client.patch(`/api/v1/admin/users/${regular.id}/role`).loginAs(admin).json({
      role: 'user',
    })
    res.assertStatus(200)
    await regular.refresh()
    assert.equal(regular.role, 'user')
  })

  test('cannot change own role', async ({ client }) => {
    const res = await client.patch(`/api/v1/admin/users/${admin.id}/role`).loginAs(admin).json({
      role: 'user',
    })
    res.assertStatus(400)
  })

  test('cannot delete own account', async ({ client }) => {
    const res = await client.delete(`/api/v1/admin/users/${admin.id}`).loginAs(admin)
    res.assertStatus(400)
  })

  test('admin deletes user', async ({ client, assert }) => {
    const res = await client.delete(`/api/v1/admin/users/${regular.id}`).loginAs(admin)
    res.assertStatus(204)
    const deleted = await User.find(regular.id)
    assert.isNull(deleted)
  })

  test('delete of missing user returns 404', async ({ client }) => {
    const res = await client.delete('/api/v1/admin/users/999999').loginAs(admin)
    res.assertStatus(404)
  })

  test('cleanup admin user', async () => {
    const remaining = await User.find(admin.id)
    await remaining?.delete()
  })
})
