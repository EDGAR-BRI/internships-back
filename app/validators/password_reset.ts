import vine from '@vinejs/vine'

/**
 * Validator to use when requesting a password reset link
 */
export const forgotPasswordValidator = vine.create({
  email: vine.string().email().maxLength(254),
})

/**
 * Validator to use when submitting a new password
 */
export const resetPasswordValidator = vine.create({
  token: vine.string().minLength(32),
  password: vine.string().minLength(8).maxLength(32),
  passwordConfirmation: vine.string().minLength(8).maxLength(32).sameAs('password'),
})
