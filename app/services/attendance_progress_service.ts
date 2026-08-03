import Attendance from '#models/attendance'
import UserSetting from '#models/user_setting'
import { DateTime } from 'luxon'

export default class AttendanceProgressService {
  static TOTAL_DAYS = 45
  static DEFAULT_HOURS_PER_DAY = 8
  static TIMEZONE = 'America/Mexico_City'

  static getWorkHoursPerDay(settings: UserSetting | null): number {
    return settings?.workHoursPerDay ?? this.DEFAULT_HOURS_PER_DAY
  }

  static getTotalHours(settings: UserSetting | null): number {
    return this.TOTAL_DAYS * this.getWorkHoursPerDay(settings)
  }

  static computeDayHours(attendance: Attendance, settings: UserSetting | null): number {
    const fullDayHours = this.getWorkHoursPerDay(settings)
    if (attendance.isFullDay && attendance.checkOut) return fullDayHours
    if (attendance.hours !== null && attendance.hours !== undefined) {
      return Math.min(attendance.hours, fullDayHours)
    }
    if (!attendance.checkIn || !attendance.checkOut) return 0
    const diffMinutes = attendance.checkOut.diff(attendance.checkIn, 'minutes').minutes
    const hours = diffMinutes / 60
    return Math.min(hours, fullDayHours)
  }

  static countCompletedDay(attendance: Attendance): number {
    if (attendance.isFullDay && attendance.checkOut) return 1
    return 0
  }

  static async getSummary(userId: number) {
    const settings = await UserSetting.query().where('userId', userId).first()
    const attendances = await Attendance.query().where('user_id', userId).orderBy('date', 'asc')

    const totalHours = this.getTotalHours(settings)
    const fullDayHours = this.getWorkHoursPerDay(settings)

    let completedDays = 0
    let completedHours = 0
    for (const a of attendances) {
      completedDays += this.countCompletedDay(a)
      completedHours += this.computeDayHours(a, settings)
    }

    const remainingDays = Math.max(this.TOTAL_DAYS - completedDays, 0)
    const remainingHours = Math.max(totalHours - completedHours, 0)

    let targetEndDate: string | null = null
    if (settings?.startDate) {
      targetEndDate = this.computeTargetEndDate(
        settings.startDate.setZone(this.TIMEZONE),
        settings.skippedWeeks ?? []
      )
    }

    let estimatedEndDate: string | null = null
    let pace = { daysPerWeek: 0, hoursPerWeek: 0 }

    if (settings?.startDate && attendances.length > 0) {
      const now = DateTime.now().setZone(this.TIMEZONE)
      const start = settings.startDate.setZone(this.TIMEZONE)
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
      totalDays: this.TOTAL_DAYS,
      totalHours,
      fullDayHours,
      completedDays,
      completedHours: Math.round(completedHours * 10) / 10,
      remainingDays,
      remainingHours: Math.round(remainingHours * 10) / 10,
      targetEndDate,
      estimatedEndDate,
      pace: {
        daysPerWeek: Math.round(pace.daysPerWeek * 10) / 10,
        hoursPerWeek: Math.round(pace.hoursPerWeek * 10) / 10,
      },
    }
  }

  static computeTargetEndDate(startDate: DateTime, skippedWeeks: number[]): string {
    const start = startDate.startOf('day')
    let businessDaysCounted = 0
    let current = start
    const skippedSet = new Set(skippedWeeks)

    while (businessDaysCounted < this.TOTAL_DAYS) {
      const weekday = current.weekday // Luxon ISO: 1=Mon ... 7=Sun
      const isWeekend = weekday === 6 || weekday === 7
      const rawWeek = this.computeRawWeekNumber(start, current)
      const isSkipped = skippedSet.has(rawWeek)

      if (!isWeekend && !isSkipped) {
        businessDaysCounted++
      }

      if (businessDaysCounted < this.TOTAL_DAYS) {
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
