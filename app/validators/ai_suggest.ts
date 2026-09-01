import vine from '@vinejs/vine'

export const aiSuggestValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(300),
  area: vine.string().maxLength(100).nullable().optional(),
  status: vine.string().maxLength(50).nullable().optional(),
  notes: vine
    .array(
      vine.object({
        title: vine.string().nullable().optional(),
        content: vine.string(),
        tag: vine.string().nullable().optional(),
      })
    )
    .maxLength(50)
    .optional(),
  fields: vine
    .object({
      theory: vine.string().nullable().optional(),
      impact: vine.string().nullable().optional(),
      resources: vine.string().nullable().optional(),
    })
    .optional(),
})
