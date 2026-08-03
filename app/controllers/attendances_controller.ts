import Attendance from '#models/attendance'
import UserSetting from '#models/user_setting'
import AttendanceProgressService from '#services/attendance_progress_service'
import {
  checkInValidator,
  checkOutValidator,
  fullDayValidator,
  partialValidator,
  updateAttendanceValidator,
} from '#validators/attendance'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AttendancesController {
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const settings = await UserSetting.query().where('userId', user.id).first()
    const attendances = await Attendance.query()
      .where('user_id', user.id)
      .orderBy('date', 'desc')
      .orderBy('check_in', 'desc')

    const data = attendances.map((a) => ({
      ...a.serialize(),
      hours: AttendanceProgressService.computeDayHours(a, settings),
    }))

    return serialize(data)
  }

  async checkIn({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date, isFullDay, mode } = await request.validateUsing(checkInValidator)
    const dateObj = DateTime.fromISO(date, { zone: 'America/Mexico_City' }).startOf('day')
    const dateStr = dateObj.toSQLDate()!

    let attendance = await Attendance.query()
      .where('user_id', user.id)
      .where('date', dateStr)
      .first()

    if (!attendance) {
      attendance = new Attendance()
      attendance.userId = user.id
      attendance.date = dateObj
    }

    attendance.checkIn = DateTime.now()
    attendance.isFullDay = isFullDay ?? null
    attendance.mode = mode ?? null
    await attendance.save()

    const settings = await UserSetting.query().where('userId', user.id).first()

    return serialize({
      ...attendance.serialize(),
      hours: AttendanceProgressService.computeDayHours(attendance, settings),
    })
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

    const settings = await UserSetting.query().where('userId', user.id).first()

    return serialize({
      ...attendance.serialize(),
      hours: AttendanceProgressService.computeDayHours(attendance, settings),
    })
  }

  async fullDay({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date, mode } = await request.validateUsing(fullDayValidator)
    const dateObj = DateTime.fromISO(date, { zone: 'America/Mexico_City' }).startOf('day')
    const dateStr = dateObj.toSQLDate()!

    let attendance = await Attendance.query()
      .where('user_id', user.id)
      .where('date', dateStr)
      .first()

    if (!attendance) {
      attendance = new Attendance()
      attendance.userId = user.id
      attendance.date = dateObj
    }

    attendance.checkOut = DateTime.now()
    attendance.isFullDay = true
    attendance.mode = mode ?? null
    await attendance.save()

    const settings = await UserSetting.query().where('userId', user.id).first()

    return serialize({
      ...attendance.serialize(),
      hours: AttendanceProgressService.computeDayHours(attendance, settings),
    })
  }

  async partial({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date, hours, mode } = await request.validateUsing(partialValidator)
    const dateObj = DateTime.fromISO(date, { zone: 'America/Mexico_City' }).startOf('day')
    const dateStr = dateObj.toSQLDate()!

    let attendance = await Attendance.query()
      .where('user_id', user.id)
      .where('date', dateStr)
      .first()

    if (!attendance) {
      attendance = new Attendance()
      attendance.userId = user.id
      attendance.date = dateObj
    }

    attendance.hours = hours
    attendance.isFullDay = false
    attendance.mode = mode ?? null
    await attendance.save()

    const settings = await UserSetting.query().where('userId', user.id).first()

    return serialize({
      ...attendance.serialize(),
      hours: AttendanceProgressService.computeDayHours(attendance, settings),
    })
  }

  async update({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateAttendanceValidator)

    const attendance = await Attendance.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (data.date !== undefined) {
      const newDate = DateTime.fromISO(data.date, { zone: 'America/Mexico_City' }).startOf('day')
      const newDateStr = newDate.toSQLDate()!
      const currentDateStr = attendance.date.toSQLDate()!

      if (newDateStr !== currentDateStr) {
        const existing = await Attendance.query()
          .where('user_id', user.id)
          .where('date', newDateStr)
          .first()

        if (existing) {
          return response.conflict({ message: 'Ya existe una asistencia para esa fecha' })
        }

        attendance.date = newDate
      }
    }

    if (data.isFullDay !== undefined) {
      attendance.isFullDay = data.isFullDay
      if (data.isFullDay) {
        attendance.hours = null
      }
    }
    if (data.hours !== undefined) {
      attendance.hours = data.hours
      attendance.isFullDay = false
    }
    if (data.mode !== undefined) {
      attendance.mode = data.mode
    }

    await attendance.save()

    const settings = await UserSetting.query().where('userId', user.id).first()

    return serialize({
      ...attendance.serialize(),
      hours: AttendanceProgressService.computeDayHours(attendance, settings),
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const attendance = await Attendance.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await attendance.delete()
    return response.noContent()
  }

  async summary({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const summary = await AttendanceProgressService.getSummary(user.id)
    return serialize({ summary })
  }
}
