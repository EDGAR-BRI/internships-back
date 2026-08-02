import vine from '@vinejs/vine'

export const createNoteValidator = vine.create({
  content: vine.string(),
  logEntryId: vine.number().positive().nullable(),
})

export const updateNoteValidator = vine.create({
  content: vine.string().optional(),
  logEntryId: vine.number().positive().nullable().optional(),
})
