import User from '#models/user'
import Attendance from '#models/attendance'
import Note from '#models/note'
import LogEntry from '#models/log_entry'
import UserSetting from '#models/user_setting'
import AttendanceProgressService from '#services/attendance_progress_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminUsersController {
  async index({ serialize }: HttpContext) {
    const users = await User.query().orderBy('createdAt', 'desc')

    const settingsByUser = new Map<number, UserSetting>()
    for (const s of await UserSetting.all()) {
      settingsByUser.set(s.userId, s)
    }

    const data = await Promise.all(
      users.map(async (user) => {
        const settings = settingsByUser.get(user.id) ?? null
        const attendances = await Attendance.query().where('user_id', user.id)
        const notes = await Note.query().where('user_id', user.id)
        const logEntriesCount = await LogEntry.query()
          .where('user_id', user.id)
          .count('* as total')

        let completedDays = 0
        let completedHours = 0
        let lastActivity = user.updatedAt ?? user.createdAt
        for (const a of attendances) {
          completedDays += AttendanceProgressService.countCompletedDay(a)
          completedHours += AttendanceProgressService.computeDayHours(a, settings)
          if (a.updatedAt && a.updatedAt > lastActivity) {
            lastActivity = a.updatedAt
          }
        }
        for (const n of notes) {
          if (n.createdAt > lastActivity) {
            lastActivity = n.createdAt
          }
        }

        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          completedDays,
          completedHours: Math.round(completedHours * 10) / 10,
          attendanceCount: attendances.length,
          notesCount: notes.length,
          logEntriesCount: Number(logEntriesCount[0]?.$extras.total) || 0,
          lastActivity,
        }
      })
    )

    return serialize(data)
  }

  async summary({ serialize }: HttpContext) {
    const users = await User.query()
    const attendances = await Attendance.all()

    let totalHours = 0
    let activeUsers = 0
    const usersWithAttendances = new Set<number>()
    const settingsByUser = new Map<number, UserSetting>()
    for (const s of await UserSetting.all()) {
      settingsByUser.set(s.userId, s)
    }

    for (const a of attendances) {
      const settings = settingsByUser.get(a.userId) ?? null
      const hours = AttendanceProgressService.computeDayHours(a, settings)
      if (hours > 0) {
        totalHours += hours
        usersWithAttendances.add(a.userId)
      }
    }

    activeUsers = usersWithAttendances.size
    const notesCount = await Note.query().count('* as total')
    const logEntriesCount = await LogEntry.query().count('* as total')

    return serialize({
      summary: {
        totalUsers: users.length,
        activeUsers,
        totalHours: Math.round(totalHours * 10) / 10,
        totalNotes: Number(notesCount[0]?.$extras.total) || 0,
        totalLogEntries: Number(logEntriesCount[0]?.$extras.total) || 0,
      },
    })
  }
}
