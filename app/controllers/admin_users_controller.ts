import User from '#models/user'
import Attendance from '#models/attendance'
import Note from '#models/note'
import LogEntry from '#models/log_entry'
import UserSetting from '#models/user_setting'
import AttendanceProgressService from '#services/attendance_progress_service'
import { updateRoleValidator } from '#validators/admin'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminUsersController {
  private settingsByUser = new Map<number, UserSetting>()

  private async loadSettings() {
    this.settingsByUser.clear()
    for (const s of await UserSetting.all()) {
      this.settingsByUser.set(s.userId, s)
    }
  }

  private getSettings(userId: number): UserSetting | null {
    return this.settingsByUser.get(userId) ?? null
  }

  private async aggregate(user: User) {
    const settings = this.getSettings(user.id)
    const attendances = await Attendance.query().where('user_id', user.id).orderBy('date', 'asc')
    const notes = await Note.query().where('user_id', user.id).orderBy('createdAt', 'desc')
    const logEntries = await LogEntry.query().where('user_id', user.id).orderBy('createdAt', 'desc')

    let completedDays = 0
    let completedHours = 0
    let onSiteDays = 0
    let remoteDays = 0
    let lastActivity = user.updatedAt ?? user.createdAt
    for (const a of attendances) {
      const day = AttendanceProgressService.countCompletedDay(a)
      const hours = AttendanceProgressService.computeDayHours(a, settings)
      completedDays += day
      completedHours += hours
      if (day === 1) {
        if (a.mode === 'remote') {
          remoteDays++
        } else {
          onSiteDays++
        }
      }
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
      updatedAt: user.updatedAt,
      completedDays,
      completedHours: Math.round(completedHours * 10) / 10,
      attendanceCount: attendances.length,
      notesCount: notes.length,
      logEntriesCount: logEntries.length,
      lastActivity,
    }
  }

  private async buildDetail(user: User) {
    const settings = this.getSettings(user.id)
    const attendances = await Attendance.query().where('user_id', user.id).orderBy('date', 'desc')
    const notes = await Note.query().where('user_id', user.id).orderBy('createdAt', 'desc')
    const logEntries = await LogEntry.query().where('user_id', user.id).orderBy('createdAt', 'desc')

    let completedDays = 0
    let completedHours = 0
    let onSiteDays = 0
    let remoteDays = 0
    const fullDayHours = AttendanceProgressService.getWorkHoursPerDay(settings)
    const totalDays = AttendanceProgressService.getTotalDays(settings)
    const totalHours = AttendanceProgressService.getTotalHours(settings)

    const attendancesData = []
    for (const a of attendances) {
      const day = AttendanceProgressService.countCompletedDay(a)
      const hours = AttendanceProgressService.computeDayHours(a, settings)
      completedDays += day
      completedHours += hours
      if (day === 1) {
        if (a.mode === 'remote') {
          remoteDays++
        } else {
          onSiteDays++
        }
      }
      attendancesData.push({
        id: a.id,
        date: a.date,
        mode: a.mode,
        isFullDay: a.isFullDay,
        hours: a.hours,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        completedDay: day === 1,
        dayHours: Math.round(hours * 10) / 10,
      })
    }

    const byStatus: Record<string, number> = {}
    for (const l of logEntries) {
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      initials: user.initials,
      createdAt: user.createdAt,
      settings: settings
        ? {
            startDate: settings.startDate,
            endDate: settings.endDate,
            workType: settings.workType,
            workHoursPerDay: settings.workHoursPerDay,
            daysPerWeek: settings.daysPerWeek,
            skippedWeeks: settings.skippedWeeks,
          }
        : null,
      progress: {
        fullDayHours,
        totalDays: Math.round(totalDays * 10) / 10,
        totalHours,
        completedDays,
        completedHours: Math.round(completedHours * 10) / 10,
        remainingDays: Math.max(Math.ceil(totalDays) - completedDays, 0),
        remainingHours: Math.round(Math.max(totalHours - completedHours, 0) * 10) / 10,
        onSiteDays,
        remoteDays,
        percent: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0,
      },
      attendances: attendancesData.slice(0, 30),
      notes: notes.slice(0, 10).map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        tag: n.tag,
        createdAt: n.createdAt,
      })),
      logEntries: logEntries.slice(0, 10).map((l) => ({
        id: l.id,
        name: l.name,
        status: l.status,
        week: l.week,
        createdAt: l.createdAt,
      })),
      logEntriesByStatus: byStatus,
    }
  }

  async index({ serialize }: HttpContext) {
    await this.loadSettings()
    const users = await User.query().orderBy('createdAt', 'desc')

    const data = await Promise.all(users.map((user) => this.aggregate(user)))

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

  async show({ params, response, serialize }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    await this.loadSettings()
    return serialize(await this.buildDetail(user))
  }

  async updateRole({ params, request, response, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateRoleValidator)
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    const currentAdmin = auth.user!

    if (user.id === currentAdmin.id) {
      return response.badRequest({ message: 'No puedes cambiar tu propio rol' })
    }

    if (user.role === 'admin' && payload.role !== 'admin') {
      const adminCount = await User.query().where('role', 'admin').count('* as total')
      if (Number(adminCount[0]?.$extras.total) <= 1) {
        return response.badRequest({
          message: 'No puedes quitar el rol de administrador al último admin',
        })
      }
    }

    user.role = payload.role
    await user.save()

    return serialize({
      id: user.id,
      role: user.role,
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    const currentAdmin = auth.user!

    if (user.id === currentAdmin.id) {
      return response.badRequest({ message: 'No puedes eliminar tu propia cuenta' })
    }

    if (user.role === 'admin') {
      const adminCount = await User.query().where('role', 'admin').count('* as total')
      if (Number(adminCount[0]?.$extras.total) <= 1) {
        return response.badRequest({ message: 'No puedes eliminar al último administrador' })
      }
    }

    await user.delete()

    return response.noContent()
  }
}
