import vine from '@vinejs/vine'

const dateFormats = { formats: ['iso8601'] }

export const createNoteValidator = vine.create({
  content: vine.string(),
  logEntryId: vine.number().positive().nullable(),
  date: vine.date(dateFormats).nullable().optional(),
})

export const updateNoteValidator = vine.create({
  content: vine.string().optional(),
  logEntryId: vine.number().positive().nullable().optional(),
  date: vine.date(dateFormats).nullable().optional(),
})
