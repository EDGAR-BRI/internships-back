import { test } from '@japa/runner'
import User from '#models/user'
import Attendance from '#models/attendance'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
}

test.group('Attendances validation', () => {
  let user: User

  test('setup user', async () => {
    user = await User.create({
      email: 'attendance-validation@example.com',
      password: 'password123',
      fullName: 'Attendance Test',
      role: 'user',
    })
  })

  test('cannot register attendance with a future date', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/attendances/partial')
      .loginAs(user)
      .json({ date: '2099-01-01', hours: 4 })
    res.assertStatus(422)
    const body: any = res.body()
    assert.exists(body.errors)
  })

  test('can register attendance for today', async ({ client, assert }) => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
    const res = await client
      .post('/api/v1/attendances/partial')
      .loginAs(user)
      .json({ date: today, hours: 4 })
    res.assertStatus(200)
    const body: any = res.body()
    const attendance = body.data?.attendances || body.data || body
    assert.exists(attendance.id || attendance)
  })

  test('cannot update attendance to a future date', async ({ client }) => {
    const attendance = await Attendance.query().where('userId', user.id).firstOrFail()
    const res = await client
      .put(`/api/v1/attendances/${attendance.id}`)
      .loginAs(user)
      .json({ date: '2099-12-31' })
    res.assertStatus(422)
  })

  test('cleanup', async () => {
    await Attendance.query().where('userId', user.id).delete()
    await user.delete()
  })
})

test.group('Attendances bulk', () => {
  let user: User

  test('setup user', async () => {
    user = await User.create({
      email: 'attendance-bulk@example.com',
      password: 'password123',
      fullName: 'Bulk Test',
      role: 'user',
    })
  })

  test('cannot bulk register with a future date', async ({ client }) => {
    const res = await client
      .post('/api/v1/attendances/bulk')
      .loginAs(user)
      .json({ dates: [daysAgo(1), '2099-01-01'], isFullDay: true })
    res.assertStatus(422)
  })

  test('registers multiple dates at once and skips existing ones', async ({ client, assert }) => {
    const d1 = daysAgo(2)
    const d2 = daysAgo(3)
    await Attendance.create({
      userId: user.id,
      date: d2,
      isFullDay: true,
    })

    const res = await client
      .post('/api/v1/attendances/bulk')
      .loginAs(user)
      .json({ dates: [d1, d2], isFullDay: true, mode: 'on_site' })
    res.assertStatus(200)
    const body: any = res.body()
    const data = body.data
    assert.equal(data.created, 1)
    assert.equal(data.skipped, 1)
    assert.equal(data.attendances.length, 1)
    assert.equal(data.attendances[0].date, d1)
    assert.equal(data.attendances[0].isFullDay, true)

    const count = await Attendance.query().where('userId', user.id).count('* as total')
    assert.equal(Number(count[0].$extras.total), 2)
  })

  test('registers partial hours for multiple dates', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/attendances/bulk')
      .loginAs(user)
      .json({ dates: [daysAgo(4), daysAgo(5)], hours: 4.5, mode: 'remote' })
    res.assertStatus(200)
    const body: any = res.body()
    const data = body.data
    assert.equal(data.created, 2)
    for (const att of data.attendances) {
      assert.equal(att.hours, 4.5)
      assert.equal(att.isFullDay, false)
      assert.equal(att.mode, 'remote')
    }
  })

  test('deduplicates repeated dates in the payload', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/attendances/bulk')
      .loginAs(user)
      .json({ dates: [daysAgo(6), daysAgo(6)], isFullDay: true })
    res.assertStatus(200)
    const body: any = res.body()
    assert.equal(body.data.created, 1)
  })

  test('cleanup', async () => {
    await Attendance.query().where('userId', user.id).delete()
    await user.delete()
  })
})
