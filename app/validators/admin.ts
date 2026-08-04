import vine from '@vinejs/vine'

/**
 * Validator for admin role updates.
 */
export const updateRoleValidator = vine.create({
  role: vine.enum(['user', 'admin']),
})
