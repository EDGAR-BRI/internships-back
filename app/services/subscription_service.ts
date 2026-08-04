import Plan from '#models/plan'
import Subscription from '#models/subscription'
import type User from '#models/user'
import Note from '#models/note'
import LogEntry from '#models/log_entry'
import Attendance from '#models/attendance'
import { DateTime } from 'luxon'

export type SubscriptionResource = 'notes' | 'logEntries' | 'attendances'

export default class SubscriptionService {
  static TIMEZONE = 'America/Mexico_City'
  static PRO_PRICE_USD = 3

  static getDefaultPlan(): Promise<Plan> {
    return Plan.query().where('isDefault', true).firstOrFail()
  }

  static async getPlanFor(userId: number): Promise<Plan> {
    const sub = await Subscription.query().where('userId', userId).first()
    if (!sub || sub.status !== 'active') return this.getDefaultPlan()
    if (sub.expiresAt && sub.expiresAt < DateTime.now()) return this.getDefaultPlan()
    const plan = await Plan.find(sub.planId)
    return plan ?? this.getDefaultPlan()
  }

  static async assignPlan(
    userId: number,
    planSlug: string,
    expiresAt: DateTime | null = null
  ): Promise<Subscription> {
    const plan = await Plan.query().where('slug', planSlug).firstOrFail()
    const existing = await Subscription.query().where('userId', userId).first()
    const data = {
      planId: plan.id,
      status: 'active',
      startedAt: DateTime.now(),
      expiresAt,
    }
    if (existing) {
      existing.merge(data)
      await existing.save()
      return existing
    }
    return Subscription.create({ userId, ...data })
  }

  static startOfToday(): DateTime {
    return DateTime.now().setZone(this.TIMEZONE).startOf('day')
  }

  static async countCreatedToday(userId: number, type: SubscriptionResource): Promise<number> {
    const format = Note.query().client.dialect.dateTimeFormat
    const start = this.startOfToday().toUTC().toFormat(format)
    const end = this.startOfToday().plus({ days: 1 }).toUTC().toFormat(format)
    let query: any
    if (type === 'notes') {
      query = Note.query().where('user_id', userId)
    } else if (type === 'logEntries') {
      query = LogEntry.query().where('user_id', userId)
    } else {
      query = Attendance.query().where('user_id', userId)
    }
    const result = await query
      .where('created_at', '>=', start)
      .where('created_at', '<', end)
      .count('* as total')
    return Number(result[0]?.$extras.total) || 0
  }

  static async getDailyLimit(user: User, type: SubscriptionResource): Promise<number | null> {
    if (user.isAdmin) return null
    const plan = await this.getPlanFor(user.id)
    let limit: number | null
    if (type === 'notes') limit = plan.notesPerDay
    else if (type === 'logEntries') limit = plan.logEntriesPerDay
    else limit = plan.attendancesPerDay

    if (type === 'attendances' && plan.attendancesPerDayFirstDay !== null) {
      const isFirstDay = user.createdAt
        .setZone(this.TIMEZONE)
        .startOf('day')
        .hasSame(this.startOfToday(), 'day')
      if (isFirstDay) limit = plan.attendancesPerDayFirstDay
    }
    return limit
  }

  static async getUsage(user: User, type: SubscriptionResource) {
    const limit = await this.getDailyLimit(user, type)
    const used = await this.countCreatedToday(user.id, type)
    const plan = await this.getPlanFor(user.id)
    return { used, limit, plan }
  }

  static resourceLabel(type: SubscriptionResource): string {
    if (type === 'notes') return 'notas'
    if (type === 'logEntries') return 'actividades'
    return 'asistencias'
  }

  static limitMessage(planName: string, label: string, limit: number): string {
    return `Alcanzaste tu límite diario de ${label} (${limit}/día) del plan ${planName}. Cambia al plan Pro por $${this.PRO_PRICE_USD} para registros ilimitados.`
  }
}
