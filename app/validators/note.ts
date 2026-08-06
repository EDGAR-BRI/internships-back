import vine from '@vinejs/vine'

const dateFormats = { formats: ['iso8601'] }

export const createNoteValidator = vine.create({
  title: vine.string().maxLength(255).nullable().optional(),
  content: vine.string(),
  tag: vine.string().trim().maxLength(30).optional(),
  logEntryId: vine.number().positive().nullable(),
  date: vine.date(dateFormats).nullable().optional(),
})

export const updateNoteValidator = vine.create({
  title: vine.string().maxLength(255).nullable().optional(),
  content: vine.string().optional(),
  tag: vine.string().trim().maxLength(30).optional(),
  logEntryId: vine.number().positive().nullable().optional(),
  date: vine.date(dateFormats).nullable().optional(),
})
