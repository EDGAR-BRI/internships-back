import User from '#models/user'
import Attendance from '#models/attendance'
import Note from '#models/note'
import LogEntry from '#models/log_entry'
import UserSetting from '#models/user_setting'
import Subscription from '#models/subscription'
import Plan from '#models/plan'
import AttendanceProgressService from '#services/attendance_progress_service'
import SubscriptionService from '#services/subscription_service'
import CacheService from '#services/cache_service'
import { updateRoleValidator } from '#validators/admin'
import { assignPlanValidator } from '#validators/subscription'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminUsersController {
  private settingsByUser = new Map<number, UserSetting>()
  private planInfoByUser = new Map<
    number,
    { slug: string; name: string; expiresAt: DateTime | null; status: string }
  >()

  private async loadSettings() {
    this.settingsByUser.clear()
    for (const s of await UserSetting.all()) {
      this.settingsByUser.set(s.userId, s)
    }
  }

  private async loadPlanInfo() {
    this.planInfoByUser.clear()
    const subs = await Subscription.query().preload('plan')
    for (const s of subs) {
      this.planInfoByUser.set(s.userId, {
        slug: s.plan.slug,
        name: s.plan.name,
        expiresAt: s.expiresAt,
        status: s.status,
      })
    }
  }

  private async planFor(userId: number) {
    const entry = this.planInfoByUser.get(userId)
    if (
      entry &&
      entry.status === 'active' &&
      (!entry.expiresAt || entry.expiresAt > DateTime.now())
    ) {
      return { slug: entry.slug, name: entry.name, expiresAt: entry.expiresAt }
    }
    const def = await SubscriptionService.getDefaultPlan()
    return { slug: def.slug, name: def.name, expiresAt: null }
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
      const day = AttendanceProgressService.countCompletedDay(a, settings)
      const hours = AttendanceProgressService.computeDayHours(a, settings)
      completedDays += day
      completedHours += hours
      if (day > 0) {
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
      completedDays: Math.round(completedDays * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      attendanceCount: attendances.length,
      notesCount: notes.length,
      logEntriesCount: logEntries.length,
      lastActivity,
      plan: await this.planFor(user.id),
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
      const day = AttendanceProgressService.countCompletedDay(a, settings)
      const hours = AttendanceProgressService.computeDayHours(a, settings)
      completedDays += day
      completedHours += hours
      if (day > 0) {
        if (a.mode === 'remote') {
          remoteDays += day
        } else {
          onSiteDays += day
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
        completedDay: day > 0,
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
            workStartTime: settings.workStartTime,
            workEndTime: settings.workEndTime,
            skippedWeeks: settings.skippedWeeks,
          }
        : null,
      progress: {
        fullDayHours,
        totalDays: Math.round(totalDays * 10) / 10,
        totalHours,
        completedDays: Math.round(completedDays * 10) / 10,
        completedHours: Math.round(completedHours * 10) / 10,
        remainingDays: Math.round(Math.max(totalDays - completedDays, 0) * 10) / 10,
        remainingHours: Math.round(Math.max(totalHours - completedHours, 0) * 10) / 10,
        onSiteDays: Math.round(onSiteDays * 10) / 10,
        remoteDays: Math.round(remoteDays * 10) / 10,
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
    await this.loadPlanInfo()
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
    await this.loadPlanInfo()

    const detail = await this.buildDetail(user)
    const plan = await this.planFor(user.id)
    const usage = {
      notes: {
        used: await SubscriptionService.countCreatedToday(user.id, 'notes'),
        limit: await SubscriptionService.getDailyLimit(user, 'notes'),
      },
      logEntries: {
        used: await SubscriptionService.countCreatedToday(user.id, 'logEntries'),
        limit: await SubscriptionService.getDailyLimit(user, 'logEntries'),
      },
      attendances: {
        used: await SubscriptionService.countCreatedToday(user.id, 'attendances'),
        limit: await SubscriptionService.getDailyLimit(user, 'attendances'),
      },
    }

    return serialize({ ...detail, plan, usage })
  }

  async assignSubscription({ params, request, response, serialize }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    const payload = await request.validateUsing(assignPlanValidator)
    const plan = await Plan.query().where('slug', payload.planSlug).first()
    if (!plan) {
      return response.badRequest({ message: 'El plan no existe' })
    }

    const rawExpires = payload.expiresAt
    const expiresAt = rawExpires
      ? DateTime.isDateTime(rawExpires)
        ? rawExpires
        : DateTime.fromJSDate(rawExpires as unknown as Date)
      : null
    await SubscriptionService.assignPlan(user.id, plan.slug, expiresAt)
    await CacheService.invalidateUser(user.id)

    return serialize({
      id: user.id,
      plan: {
        slug: plan.slug,
        name: plan.name,
        expiresAt,
      },
    })
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
    await CacheService.invalidateUser(user.id)

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
