import Attendance from '#models/attendance'
import { checkInValidator, checkOutValidator } from '#validators/attendance'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AttendancesController {
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const attendances = await Attendance.query()
      .where('user_id', user.id)
      .orderBy('date', 'desc')
      .orderBy('check_in', 'desc')

    return serialize(attendances)
  }

  async checkIn({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date } = await request.validateUsing(checkInValidator)
    const dateObj = DateTime.fromISO(date, { zone: 'America/Mexico_City' }).startOf('day')

    const attendance = await Attendance.updateOrCreate(
      { userId: user.id, date: dateObj },
      { checkIn: DateTime.now() }
    )

    return serialize(attendance)
  }

  async checkOut({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date } = await request.validateUsing(checkOutValidator)
    const dateStr = DateTime.fromISO(date, { zone: 'America/Mexico_City' }).toSQLDate()!

    const attendance = await Attendance.query()
      .where('user_id', user.id)
      .where('date', dateStr)
      .firstOrFail()

    attendance.checkOut = DateTime.now()
    await attendance.save()

    return serialize(attendance)
  }
}
