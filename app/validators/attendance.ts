import vine from '@vinejs/vine'

export const checkInValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const checkOutValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
