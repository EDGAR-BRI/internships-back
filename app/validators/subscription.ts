import vine from '@vinejs/vine'

const nullableNumber = () => vine.number().withoutDecimals().min(0).nullable().optional()

export const assignPlanValidator = vine.create({
  planSlug: vine.string().trim().minLength(1).maxLength(50),
  expiresAt: vine.date().optional().nullable(),
})

export const createPlanValidator = vine.create({
  slug: vine.string().trim().minLength(1).maxLength(50),
  name: vine.string().trim().minLength(1).maxLength(50),
  notesPerDay: nullableNumber(),
  logEntriesPerDay: nullableNumber(),
  attendancesPerDay: nullableNumber(),
  attendancesPerDayFirstDay: nullableNumber(),
  canExport: vine.boolean().optional(),
  isDefault: vine.boolean().optional(),
})

export const updatePlanValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(50).optional(),
  notesPerDay: nullableNumber(),
  logEntriesPerDay: nullableNumber(),
  attendancesPerDay: nullableNumber(),
  attendancesPerDayFirstDay: nullableNumber(),
  canExport: vine.boolean().optional(),
  isDefault: vine.boolean().optional(),
})
