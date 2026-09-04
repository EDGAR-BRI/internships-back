import vine from '@vinejs/vine'
import type { FieldContext } from '@vinejs/vine/types'
import { dateRule, notInFuture, todayInZone } from '#validators/date_rules'

const modeRule = vine.enum(['on_site', 'remote']).optional()

export const checkInValidator = vine.create({
  date: dateRule.use(notInFuture()),
  isFullDay: vine.boolean().optional(),
  mode: modeRule,
})

export const checkOutValidator = vine.create({
  date: dateRule.use(notInFuture()),
})

export const fullDayValidator = vine.create({
  date: dateRule.use(notInFuture()),
  mode: modeRule,
})

export const partialValidator = vine.create({
  date: dateRule.use(notInFuture()),
  hours: vine.number().positive().min(0.5).max(10),
  mode: modeRule,
  checkIn: vine
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  checkOut: vine
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
})

const timeRule = vine
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
  .optional()

export const updateAttendanceValidator = vine.create({
  date: dateRule.use(notInFuture()).optional(),
  isFullDay: vine.boolean().optional(),
  hours: vine.number().positive().min(0.5).max(10).optional(),
  mode: modeRule,
  checkIn: timeRule,
  checkOut: timeRule,
})

const notFutureDates = vine.createRule(
  (value: unknown, _options, field: FieldContext) => {
    if (!Array.isArray(value)) return value
    const today = todayInZone()
    const bad = value.filter((v) => typeof v === 'string' && v > today)
    if (bad.length > 0) {
      field.isValid = false
      field.report('Las fechas no pueden ser futuras', 'notFutureDates', field)
    }
    return value
  },
  { name: 'notFutureDates' }
)

export const bulkValidator = vine.create({
  dates: vine
    .array(vine.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .minLength(1)
    .maxLength(31)
    .use(notFutureDates()),
  isFullDay: vine.boolean().optional(),
  hours: vine.number().positive().min(0.5).max(10).optional(),
  mode: modeRule,
  checkIn: timeRule,
  checkOut: timeRule,
})
