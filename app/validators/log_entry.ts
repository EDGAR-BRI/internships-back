import vine from '@vinejs/vine'

export const createLogEntryValidator = vine.create({
  name: vine.string(),
  status: vine.enum(['pending', 'in_progress', 'done']).optional(),
  theory: vine.string().nullable(),
  attitudes: vine.string().nullable(),
  resources: vine.string().nullable(),
  datStart: vine.date(),
  datEnd: vine.date().nullable(),
})

export const updateLogEntryValidator = vine.create({
  name: vine.string().optional(),
  status: vine.enum(['pending', 'in_progress', 'done']).optional(),
  theory: vine.string().nullable().optional(),
  attitudes: vine.string().nullable().optional(),
  resources: vine.string().nullable().optional(),
  datStart: vine.date().optional(),
  datEnd: vine.date().nullable().optional(),
})
