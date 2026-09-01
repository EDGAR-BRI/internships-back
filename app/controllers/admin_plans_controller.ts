import Plan from '#models/plan'
import Subscription from '#models/subscription'
import { createPlanValidator, updatePlanValidator } from '#validators/subscription'
import type { HttpContext } from '@adonisjs/core/http'

function serializePlan(plan: Plan) {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    notesPerDay: plan.notesPerDay,
    logEntriesPerDay: plan.logEntriesPerDay,
    attendancesPerDay: plan.attendancesPerDay,
    attendancesPerDayFirstDay: plan.attendancesPerDayFirstDay,
    canExport: plan.canExport,
    canExportAttendance: plan.canExportAttendance,
    isDefault: plan.isDefault,
  }
}

export default class AdminPlansController {
  async index({ serialize }: HttpContext) {
    const plans = await Plan.query().orderBy('id', 'asc')
    return serialize(plans.map(serializePlan))
  }

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createPlanValidator)

    const existing = await Plan.query().where('slug', payload.slug).first()
    if (existing) {
      return response.conflict({ message: 'Ya existe un plan con ese slug' })
    }

    const isDefault = payload.isDefault ?? false
    if (isDefault) {
      await Plan.query().where('isDefault', true).update({ isDefault: false })
    }

    const totalPlans = await Plan.query().count('* as total')
    const plan = await Plan.create({
      slug: payload.slug,
      name: payload.name,
      notesPerDay: payload.notesPerDay ?? null,
      logEntriesPerDay: payload.logEntriesPerDay ?? null,
      attendancesPerDay: payload.attendancesPerDay ?? null,
      attendancesPerDayFirstDay: payload.attendancesPerDayFirstDay ?? null,
      canExport: payload.canExport ?? true,
      canExportAttendance: payload.canExportAttendance ?? true,
      isDefault: isDefault || Number(totalPlans[0]?.$extras.total) === 0,
    })

    return serialize({ plan: serializePlan(plan) })
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const plan = await Plan.find(params.id)
    if (!plan) {
      return response.notFound({ message: 'Plan no encontrado' })
    }

    const payload = await request.validateUsing(updatePlanValidator)

    if (payload.isDefault === true) {
      await Plan.query().where('isDefault', true).update({ isDefault: false })
    }

    plan.merge({
      name: payload.name !== undefined ? payload.name : plan.name,
      notesPerDay: payload.notesPerDay !== undefined ? payload.notesPerDay : plan.notesPerDay,
      logEntriesPerDay:
        payload.logEntriesPerDay !== undefined ? payload.logEntriesPerDay : plan.logEntriesPerDay,
      attendancesPerDay:
        payload.attendancesPerDay !== undefined
          ? payload.attendancesPerDay
          : plan.attendancesPerDay,
      attendancesPerDayFirstDay:
        payload.attendancesPerDayFirstDay !== undefined
          ? payload.attendancesPerDayFirstDay
          : plan.attendancesPerDayFirstDay,
      canExport: payload.canExport !== undefined ? payload.canExport : plan.canExport,
      canExportAttendance:
        payload.canExportAttendance !== undefined
          ? payload.canExportAttendance
          : plan.canExportAttendance,
      isDefault: payload.isDefault !== undefined ? payload.isDefault : plan.isDefault,
    })
    await plan.save()

    if (plan.isDefault === false) {
      const defaultCount = await Plan.query().where('isDefault', true).count('* as total')
      if (Number(defaultCount[0]?.$extras.total) === 0) {
        const fallback = await Plan.query().orderBy('id', 'asc').first()
        if (fallback) {
          fallback.isDefault = true
          await fallback.save()
        }
      }
    }

    return serialize({ plan: serializePlan(plan) })
  }

  async destroy({ params, response }: HttpContext) {
    const plan = await Plan.find(params.id)
    if (!plan) {
      return response.notFound({ message: 'Plan no encontrado' })
    }
    if (plan.isDefault) {
      return response.badRequest({ message: 'No puedes eliminar el plan por defecto' })
    }

    const inUse = await Subscription.query().where('plan_id', plan.id).count('* as total')
    if (Number(inUse[0]?.$extras.total) > 0) {
      return response.badRequest({
        message: 'No puedes eliminar un plan que tiene usuarios asignados',
      })
    }

    await plan.delete()
    return response.noContent()
  }
}
