import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Validator to use when editing the profile of the logged-in user
 */
export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().maxLength(100).nullable().optional(),
  avatarUrl: vine.string().trim().maxLength(500).nullable().optional(),
  profilePublic: vine.boolean().optional(),
})

/**
 * Validator to use when changing the password of the logged-in user.
 * `currentPassword` is only required for accounts that already have a
 * password (email signup). Google accounts set their first password here.
 */
export const changePasswordValidator = vine.create({
  currentPassword: vine.string().optional(),
  newPassword: password(),
  passwordConfirmation: password().sameAs('newPassword'),
})
