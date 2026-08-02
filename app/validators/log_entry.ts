import vine from '@vinejs/vine'

const dateFormats = { formats: ['iso8601'] }

export const createLogEntryValidator = vine.create({
  name: vine.string(),
  status: vine.enum(['pending', 'in_progress', 'done']).optional(),
  week: vine.number().positive().withoutDecimals().nullable(),
  area: vine.string().nullable(),
  theory: vine.string().nullable(),
  attitudes: vine.string().nullable(),
  impact: vine.string().nullable(),
  resources: vine.string().nullable(),
  datStart: vine.date(dateFormats),
  datEnd: vine.date(dateFormats).nullable(),
})

export const updateLogEntryValidator = vine.create({
  name: vine.string().optional(),
  status: vine.enum(['pending', 'in_progress', 'done']).optional(),
  week: vine.number().positive().withoutDecimals().nullable().optional(),
  area: vine.string().nullable().optional(),
  theory: vine.string().nullable().optional(),
  attitudes: vine.string().nullable().optional(),
  impact: vine.string().nullable().optional(),
  resources: vine.string().nullable().optional(),
  datStart: vine.date(dateFormats).optional(),
  datEnd: vine.date(dateFormats).nullable().optional(),
})
