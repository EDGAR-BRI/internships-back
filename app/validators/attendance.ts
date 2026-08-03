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
})

export const updateAttendanceValidator = vine.create({
  isFullDay: vine.boolean().optional(),
  hours: vine.number().positive().withoutDecimals().min(1).max(24).optional(),
  mode: modeRule,
})
