import { test } from '@japa/runner'
import User from '#models/user'
import Attendance from '#models/attendance'

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
