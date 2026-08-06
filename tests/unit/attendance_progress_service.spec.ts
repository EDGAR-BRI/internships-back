import { test } from '@japa/runner'
import AttendanceProgressService from '#services/attendance_progress_service'

test.group('AttendanceProgressService', () => {
  test('countCompletedDay: 8h = 1 día', async ({ assert }) => {
    const attendance = { isFullDay: false, hours: 8, checkIn: null, checkOut: null } as any
    assert.equal(AttendanceProgressService.countCompletedDay(attendance, null), 1)
  })

  test('countCompletedDay: 4h = 0.5 día', async ({ assert }) => {
    const attendance = { isFullDay: false, hours: 4, checkIn: null, checkOut: null } as any
    assert.equal(AttendanceProgressService.countCompletedDay(attendance, null), 0.5)
  })

  test('countCompletedDay: 2h = 0.25 día', async ({ assert }) => {
    const attendance = { isFullDay: false, hours: 2, checkIn: null, checkOut: null } as any
    assert.equal(AttendanceProgressService.countCompletedDay(attendance, null), 0.25)
  })

  test('countCompletedDay: jornada completa cuenta 1', async ({ assert }) => {
    const attendance = {
      isFullDay: true,
      hours: null,
      checkIn: new Date(),
      checkOut: new Date(),
    } as any
    assert.equal(AttendanceProgressService.countCompletedDay(attendance, null), 1)
  })

  test('countCompletedDay: sin horas cuenta 0', async ({ assert }) => {
    const attendance = { isFullDay: false, hours: null, checkIn: null, checkOut: null } as any
    assert.equal(AttendanceProgressService.countCompletedDay(attendance, null), 0)
  })

  test('countCompletedDay respeta horas por día configuradas', async ({ assert }) => {
    const settings = { workHoursPerDay: 6 } as any
    const attendance = { isFullDay: false, hours: 3, checkIn: null, checkOut: null } as any
    assert.equal(AttendanceProgressService.countCompletedDay(attendance, settings), 0.5)
  })
})
