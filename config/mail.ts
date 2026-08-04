import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

/**
 * Mail configuration using the Resend HTTP API.
 * https://resend.com/docs
 */
const mailConfig = defineConfig({
  default: 'resend',

  mailers: {
    resend: transports.resend({
      key: env.get('RESEND_API_KEY', ''),
      baseUrl: env.get('RESEND_BASE_URL', 'https://api.resend.com'),
    }),
  },
})

export default mailConfig
