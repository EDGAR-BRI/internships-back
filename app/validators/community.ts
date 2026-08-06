import vine from '@vinejs/vine'

export const commentValidator = vine.create({
  content: vine.string().trim().minLength(1).maxLength(1000),
})
