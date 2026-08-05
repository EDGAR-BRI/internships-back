import { test } from '@japa/runner'
import User from '#models/user'
import Note from '#models/note'
import LogEntry from '#models/log_entry'
import Attendance from '#models/attendance'
import Subscription from '#models/subscription'
import Plan from '#models/plan'
import UpgradeRequest from '#models/upgrade_request'
import SubscriptionService from '#services/subscription_service'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

let admin: User
let freeUser: User
let oldUser: User
let proUser: User

async function createUser(email: string, role: 'admin' | 'user' = 'user') {
  return User.create({ email, password: 'password123', fullName: email, role })
}

test.group('Subscriptions', () => {
  test('setup users', async () => {
    admin = await createUser('sub-admin@example.com', 'admin')
    freeUser = await createUser('sub-free@example.com')
    oldUser = await createUser('sub-old@example.com')
    proUser = await createUser('sub-pro@example.com')

    await SubscriptionService.assignPlan(freeUser.id, 'free')
    await SubscriptionService.assignPlan(oldUser.id, 'free')
    await SubscriptionService.assignPlan(proUser.id, 'pro')

    await db.rawQuery('UPDATE users SET created_at = ? WHERE id = ?', [
      '2020-01-01 00:00:00.000+00:00',
      oldUser.id,
    ])

    await Note.query().where('userId', freeUser.id).delete()
    await Note.query().where('userId', oldUser.id).delete()
    await LogEntry.query().where('userId', freeUser.id).delete()
    await Attendance.query().where('userId', freeUser.id).delete()
    await Attendance.query().where('userId', oldUser.id).delete()
  })

  test('signup assigns free plan', async ({ client, assert }) => {
    const email = `signup-${Date.now()}@example.com`
    const res = await client.post('/api/v1/auth/signup').json({
      fullName: 'Signup',
      email,
      password: 'password123',
      passwordConfirmation: 'password123',
    })
    res.assertStatus(200)
    const userId = res.body().data.user.id
    const sub = await Subscription.query().where('userId', userId).first()
    assert.isNotNull(sub)
    const plan = await Plan.find(sub!.planId)
    assert.equal(plan!.slug, 'free')
    await db.rawQuery('DELETE FROM users WHERE id = ?', [userId])
  })

  test('free user blocked after 3 notes per day', async ({ client, assert }) => {
    for (let i = 0; i < 3; i++) {
      const res = await client
        .post('/api/v1/notes')
        .loginAs(freeUser)
        .json({ content: `nota ${i}`, logEntryId: null })
      res.assertStatus(200)
    }
    const res = await client
      .post('/api/v1/notes')
      .loginAs(freeUser)
      .json({ content: 'excede el limite', logEntryId: null })
    res.assertStatus(429)
    const body: any = res.body()
    assert.equal(body.code, 'DAILY_LIMIT')
    assert.equal(body.resource, 'notes')
    assert.equal(body.limit, 3)
    assert.include(body.message, 'Pro')
  })

  test('free user blocked after 4 activities per day', async ({ client, assert }) => {
    for (let i = 0; i < 4; i++) {
      const res = await client
        .post('/api/v1/log-entries')
        .loginAs(freeUser)
        .json({
          name: `actividad ${i}`,
          datStart: new Date().toISOString(),
          status: 'pending',
          week: 1,
          area: null,
          theory: null,
          impact: null,
          resources: null,
          datEnd: null,
        })
      res.assertStatus(200)
    }
    const res = await client.post('/api/v1/log-entries').loginAs(freeUser).json({
      name: 'excede el limite',
      datStart: new Date().toISOString(),
      status: 'pending',
      week: 1,
      area: null,
      theory: null,
      impact: null,
      resources: null,
      datEnd: null,
    })
    res.assertStatus(429)
    const body: any = res.body()
    assert.equal(body.code, 'DAILY_LIMIT')
    assert.equal(body.resource, 'logEntries')
    assert.equal(body.limit, 4)
  })

  test('pro user is not limited', async ({ client, assert }) => {
    for (let i = 0; i < 8; i++) {
      const res = await client
        .post('/api/v1/notes')
        .loginAs(proUser)
        .json({ content: `pro nota ${i}`, logEntryId: null })
      res.assertStatus(200)
    }
    const total = await Note.query().where('userId', proUser.id).count('* as total')
    assert.equal(Number(total[0]?.$extras.total), 8)
  })

  test('admin is exempt from limits', async ({ client }) => {
    for (let i = 0; i < 6; i++) {
      const res = await client
        .post('/api/v1/notes')
        .loginAs(admin)
        .json({ content: `admin nota ${i}`, logEntryId: null })
      res.assertStatus(200)
    }
  })

  test('first-day user can create 15 attendances, then blocked', async ({ client, assert }) => {
    for (let i = 0; i < 15; i++) {
      const date = DateTime.now().setZone('America/Mexico_City').minus({ days: i }).toISODate()!
      const res = await client
        .post('/api/v1/attendances/partial')
        .loginAs(freeUser)
        .json({ date, hours: 1 })
      res.assertStatus(200)
    }
    const res = await client
      .post('/api/v1/attendances/partial')
      .loginAs(freeUser)
      .json({ date: '2020-01-01', hours: 1 })
    res.assertStatus(429)
    const body: any = res.body()
    assert.equal(body.code, 'DAILY_LIMIT')
    assert.equal(body.limit, 15)
  })

  test('older user limited to 5 attendances per day', async ({ client, assert }) => {
    for (let i = 0; i < 5; i++) {
      const date = DateTime.now().setZone('America/Mexico_City').minus({ days: i }).toISODate()!
      const res = await client
        .post('/api/v1/attendances/partial')
        .loginAs(oldUser)
        .json({ date, hours: 1 })
      res.assertStatus(200)
    }
    const res = await client
      .post('/api/v1/attendances/partial')
      .loginAs(oldUser)
      .json({ date: '2020-01-02', hours: 1 })
    res.assertStatus(429)
    const body: any = res.body()
    assert.equal(body.limit, 5)
  })

  test('user creates upgrade request, duplicate blocked', async ({ client }) => {
    const r1 = await client.post('/api/v1/account/subscription/upgrade-request').loginAs(freeUser)
    r1.assertStatus(200)
    const r2 = await client.post('/api/v1/account/subscription/upgrade-request').loginAs(freeUser)
    r2.assertStatus(409)
  })

  test('admin approves upgrade request', async ({ client, assert }) => {
    const req = await UpgradeRequest.query()
      .where('userId', freeUser.id)
      .where('status', 'pending')
      .first()
    assert.isNotNull(req)

    const res = await client
      .post(`/api/v1/admin/upgrade-requests/${req!.id}/approve`)
      .loginAs(admin)
    res.assertStatus(200)

    const sub = await Subscription.query().where('userId', freeUser.id).first()
    const plan = await Plan.find(sub!.planId)
    assert.equal(plan!.slug, 'pro')

    await req!.refresh()
    assert.equal(req!.status, 'approved')
  })

  test('admin rejects upgrade request', async ({ client, assert }) => {
    await client.post('/api/v1/account/subscription/upgrade-request').loginAs(oldUser)
    const req = await UpgradeRequest.query()
      .where('userId', oldUser.id)
      .where('status', 'pending')
      .first()
    assert.isNotNull(req)

    const res = await client.post(`/api/v1/admin/upgrade-requests/${req!.id}/reject`).loginAs(admin)
    res.assertStatus(200)

    await req!.refresh()
    assert.equal(req!.status, 'rejected')
  })

  test('admin lists and creates plans', async ({ client, assert }) => {
    const list = await client.get('/api/v1/admin/plans').loginAs(admin)
    list.assertStatus(200)
    const rawPlans: any = list.body()
    const plansList = Array.isArray(rawPlans) ? rawPlans : rawPlans.data
    assert.equal(plansList.length, 2)

    const created = await client.post('/api/v1/admin/plans').loginAs(admin).json({
      slug: 'test',
      name: 'Test',
      notesPerDay: 10,
      logEntriesPerDay: 10,
      attendancesPerDay: 10,
    })
    created.assertStatus(200)
    const createdPlanId: number = (created.body() as any).data.plan.id

    const duplicate = await client
      .post('/api/v1/admin/plans')
      .loginAs(admin)
      .json({ slug: 'test', name: 'Test' })
    duplicate.assertStatus(409)

    const updated = await client
      .put(`/api/v1/admin/plans/${createdPlanId}`)
      .loginAs(admin)
      .json({ notesPerDay: 20 })
    updated.assertStatus(200)
    assert.equal((updated.body() as any).data.plan.notesPerDay, 20)

    const deleted = await client.delete(`/api/v1/admin/plans/${createdPlanId}`).loginAs(admin)
    deleted.assertStatus(204)
  })

  test('non-admin cannot manage plans or requests', async ({ client }) => {
    const plans = await client.get('/api/v1/admin/plans').loginAs(freeUser)
    plans.assertStatus(403)
    const requests = await client.get('/api/v1/admin/upgrade-requests').loginAs(freeUser)
    requests.assertStatus(403)
  })

  test('admin assigns plan to user', async ({ client, assert }) => {
    const res = await client
      .put(`/api/v1/admin/users/${proUser.id}/subscription`)
      .loginAs(admin)
      .json({ planSlug: 'free' })
    res.assertStatus(200)
    const sub = await Subscription.query().where('userId', proUser.id).first()
    const plan = await Plan.find(sub!.planId)
    assert.equal(plan!.slug, 'free')
  })

  test('user detail includes plan and usage', async ({ client, assert }) => {
    const res = await client.get(`/api/v1/admin/users/${freeUser.id}`).loginAs(admin)
    res.assertStatus(200)
    const detail = res.body().data
    assert.equal(detail.plan.slug, 'pro')
    assert.isObject(detail.usage)
    assert.isNumber(detail.usage.notes.used)
    assert.isAbove(detail.usage.notes.used, 0)
  })

  test('user subscription endpoint reports plan and canExport', async ({ client, assert }) => {
    const res = await client.get('/api/v1/account/subscription').loginAs(oldUser)
    res.assertStatus(200)
    const sub = res.body().data.subscription
    assert.equal(sub.planSlug, 'free')
    assert.equal(sub.canExport, false)

    const proRes = await client.get('/api/v1/account/subscription').loginAs(freeUser)
    proRes.assertStatus(200)
    assert.equal(proRes.body().data.subscription.planSlug, 'pro')
    assert.equal(proRes.body().data.subscription.canExport, true)

    const adminRes = await client.get('/api/v1/account/subscription').loginAs(admin)
    adminRes.assertStatus(200)
    assert.equal(adminRes.body().data.subscription.canExport, true)
  })

  test('admin toggles plan canExport', async ({ client, assert }) => {
    const created = await client
      .post('/api/v1/admin/plans')
      .loginAs(admin)
      .json({
        slug: `exp-${Date.now()}`,
        name: 'Exp',
        notesPerDay: 7,
        logEntriesPerDay: 8,
        attendancesPerDay: 9,
        attendancesPerDayFirstDay: 10,
      })
    created.assertStatus(200)
    const planId: number = (created.body() as any).data.plan.id

    const res = await client
      .put(`/api/v1/admin/plans/${planId}`)
      .loginAs(admin)
      .json({ canExport: true })
    res.assertStatus(200)
    assert.equal(res.body().data.plan.canExport, true)
    assert.equal(res.body().data.plan.notesPerDay, 7)
    assert.equal(res.body().data.plan.attendancesPerDayFirstDay, 10)

    const reverted = await client
      .put(`/api/v1/admin/plans/${planId}`)
      .loginAs(admin)
      .json({ canExport: false })
    reverted.assertStatus(200)
    assert.equal(reverted.body().data.plan.canExport, false)
    assert.equal(reverted.body().data.plan.notesPerDay, 7)

    await client.delete(`/api/v1/admin/plans/${planId}`).loginAs(admin)
  })

  test('partial plan update does not wipe limits', async ({ client, assert }) => {
    const created = await client
      .post('/api/v1/admin/plans')
      .loginAs(admin)
      .json({
        slug: `part-${Date.now()}`,
        name: 'Part',
        notesPerDay: 11,
        logEntriesPerDay: 12,
        attendancesPerDay: 13,
        attendancesPerDayFirstDay: 14,
      })
    created.assertStatus(200)
    const planId: number = (created.body() as any).data.plan.id

    const res = await client
      .put(`/api/v1/admin/plans/${planId}`)
      .loginAs(admin)
      .json({ name: 'Renombrado' })
    res.assertStatus(200)
    assert.equal(res.body().data.plan.notesPerDay, 11)
    assert.equal(res.body().data.plan.logEntriesPerDay, 12)
    assert.equal(res.body().data.plan.attendancesPerDay, 13)
    assert.equal(res.body().data.plan.attendancesPerDayFirstDay, 14)
    assert.equal(res.body().data.plan.canExport, true)

    await client.delete(`/api/v1/admin/plans/${planId}`).loginAs(admin)
  })

  test('cleanup', async () => {
    await Promise.all([admin, freeUser, oldUser, proUser].map((u) => u?.delete()))
  })
})
