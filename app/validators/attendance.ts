import vine from '@vinejs/vine'
import { dateRule, notInFuture } from '#validators/date_rules'

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
  hours: vine.number().positive().withoutDecimals().min(1).max(24),
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
  hours: vine.number().positive().withoutDecimals().min(1).max(24).optional(),
  mode: modeRule,
  checkIn: timeRule,
  checkOut: timeRule,
})
