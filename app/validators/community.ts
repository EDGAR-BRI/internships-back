import vine from '@vinejs/vine'

export const commentValidator = vine.create({
  content: vine.string().trim().minLength(1).maxLength(1000),
})

export const reactionValidator = vine.create({
  emoji: vine.string().trim().minLength(1).maxLength(16),
})
