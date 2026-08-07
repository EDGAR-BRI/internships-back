import Attendance from '#models/attendance'
import UserSetting from '#models/user_setting'
import { DateTime } from 'luxon'

export default class AttendanceProgressService {
  static TOTAL_HOURS = 360
  static DEFAULT_HOURS_PER_DAY = 8
  static TIMEZONE = 'America/Mexico_City'

  static getWorkHoursPerDay(settings: UserSetting | null): number {
    return settings?.workHoursPerDay ?? this.DEFAULT_HOURS_PER_DAY
  }

  static getTotalDays(settings: UserSetting | null): number {
    return this.TOTAL_HOURS / this.getWorkHoursPerDay(settings)
  }

  static getTotalHours(_settings: UserSetting | null): number {
    return this.TOTAL_HOURS
  }

  static MAX_HOURS_PER_DAY = 10

  static computeDayHours(attendance: Attendance, settings: UserSetting | null): number {
    const fullDayHours = this.getWorkHoursPerDay(settings)
    const maxHours = Math.max(fullDayHours, this.MAX_HOURS_PER_DAY)
    if (attendance.isFullDay && attendance.checkOut) return fullDayHours
    if (attendance.hours !== null && attendance.hours !== undefined) {
      return Math.min(attendance.hours, maxHours)
    }
    if (!attendance.checkIn || !attendance.checkOut) return 0
    const diffMinutes = attendance.checkOut.diff(attendance.checkIn, 'minutes').minutes
    const hours = diffMinutes / 60
    return Math.min(hours, maxHours)
  }

  static countCompletedDay(attendance: Attendance, settings: UserSetting | null): number {
    if (attendance.isFullDay && attendance.checkOut) return 1
    const fullDayHours = this.getWorkHoursPerDay(settings)
    if (attendance.hours !== null && attendance.hours !== undefined && attendance.hours > 0) {
      return Math.min(attendance.hours, fullDayHours) / fullDayHours
    }
    return 0
  }

  static async getSummary(userId: number) {
    const settings = await UserSetting.query().where('userId', userId).first()
    const attendances = await Attendance.query().where('user_id', userId).orderBy('date', 'asc')

    const totalDays = this.getTotalDays(settings)
    const totalHours = this.getTotalHours(settings)
    const fullDayHours = this.getWorkHoursPerDay(settings)

    let completedDays = 0
    let completedHours = 0
    let onSiteDays = 0
    let remoteDays = 0
    for (const a of attendances) {
      const day = this.countCompletedDay(a, settings)
      completedDays += day
      completedHours += this.computeDayHours(a, settings)
      if (day > 0) {
        if (a.mode === 'remote') {
          remoteDays += day
        } else {
          onSiteDays += day
        }
      }
    }

    const remainingDays = Math.round(Math.max(totalDays - completedDays, 0) * 10) / 10
    const remainingHours = Math.max(totalHours - completedHours, 0)

    const daysPerWeek = settings?.daysPerWeek ?? 5
    const round1 = (n: number) => Math.round(n * 10) / 10
    const totalWeeks = round1(totalDays / daysPerWeek)
    const completedWeeks = round1(completedDays / daysPerWeek)
    const remainingWeeks = round1(remainingDays / daysPerWeek)

    let targetEndDate: string | null = null
    if (settings?.startDate) {
      targetEndDate = this.computeTargetEndDate(
        settings.startDate,
        settings.skippedWeeks ?? [],
        totalDays,
        settings.daysPerWeek ?? 5
      )
    }

    let estimatedEndDate: string | null = null
    let pace = { daysPerWeek: 0, hoursPerWeek: 0 }

    if (settings?.startDate && attendances.length > 0) {
      const now = DateTime.now().setZone(this.TIMEZONE)
      const start = settings.startDate
      const weeksElapsed = Math.max(now.diff(start, 'weeks').weeks, 0.001)
      pace.daysPerWeek = completedDays / weeksElapsed
      pace.hoursPerWeek = completedHours / weeksElapsed

      const daysEstimate =
        remainingDays > 0 && pace.daysPerWeek > 0
          ? now.plus({ days: (remainingDays / pace.daysPerWeek) * 7 })
          : now
      const hoursEstimate =
        remainingHours > 0 && pace.hoursPerWeek > 0
          ? now.plus({ days: (remainingHours / pace.hoursPerWeek) * 7 })
          : now

      estimatedEndDate = DateTime.max(daysEstimate, hoursEstimate).toISODate()
    }

    return {
      totalDays: Math.round(totalDays * 10) / 10,
      totalHours,
      fullDayHours,
      completedDays: Math.round(completedDays * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      remainingDays,
      remainingHours: Math.round(remainingHours * 10) / 10,
      onSiteDays: Math.round(onSiteDays * 10) / 10,
      remoteDays: Math.round(remoteDays * 10) / 10,
      totalWeeks,
      completedWeeks,
      remainingWeeks,
      targetEndDate,
      estimatedEndDate,
      pace: {
        daysPerWeek: Math.round(pace.daysPerWeek * 10) / 10,
        hoursPerWeek: Math.round(pace.hoursPerWeek * 10) / 10,
      },
    }
  }

  static computeTargetEndDate(
    startDate: DateTime,
    skippedWeeks: number[],
    totalDays: number,
    daysPerWeek: number
  ): string {
    const start = startDate.startOf('day')
    let businessDaysCounted = 0
    let current = start
    const skippedSet = new Set(skippedWeeks)

    while (businessDaysCounted < totalDays) {
      const dayIndex = current.weekday - 1 // 0=Lunes ... 6=Domingo
      const isCountable = dayIndex < daysPerWeek
      const rawWeek = this.computeRawWeekNumber(start, current)
      const isSkipped = skippedSet.has(rawWeek)

      if (isCountable && !isSkipped) {
        businessDaysCounted++
      }

      if (businessDaysCounted < totalDays) {
        current = current.plus({ days: 1 })
      }
    }

    return current.toISODate()!
  }

  static computeRawWeekNumber(startDate: DateTime, date: DateTime): number {
    const startMonday = startDate.minus({ days: startDate.weekday - 1 }).startOf('day')
    const dateMonday = date.minus({ days: date.weekday - 1 }).startOf('day')
    const diffDays = dateMonday.diff(startMonday, 'days').days
    let week = Math.floor(diffDays / 7) + 1
    if (week < 1) return 1
    return week
  }
}
