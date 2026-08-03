import vine from '@vinejs/vine'

const dateFormats = { formats: ['iso8601'] }

export const createNoteValidator = vine.create({
  title: vine.string().maxLength(255).nullable().optional(),
  content: vine.string(),
  tag: vine.enum(['general', 'aprendizaje', 'sentimientos', 'idea']).optional(),
  logEntryId: vine.number().positive().nullable(),
  date: vine.date(dateFormats).nullable().optional(),
})

export const updateNoteValidator = vine.create({
  title: vine.string().maxLength(255).nullable().optional(),
  content: vine.string().optional(),
  tag: vine.enum(['general', 'aprendizaje', 'sentimientos', 'idea']).optional(),
  logEntryId: vine.number().positive().nullable().optional(),
  date: vine.date(dateFormats).nullable().optional(),
})
