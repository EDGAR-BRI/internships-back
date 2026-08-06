import vine from '@vinejs/vine'

const modeRule = vine.enum(['on_site', 'remote']).optional()

export const checkInValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isFullDay: vine.boolean().optional(),
  mode: modeRule,
})

export const checkOutValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const fullDayValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mode: modeRule,
})

export const partialValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  date: vine
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  isFullDay: vine.boolean().optional(),
  hours: vine.number().positive().withoutDecimals().min(1).max(24).optional(),
  mode: modeRule,
  checkIn: timeRule,
  checkOut: timeRule,
})
