/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router.get('/debug-env', async () => {
  const env = await import('#start/env')
  return {
    processEnv: {
      FRONTEND_URL: process.env.FRONTEND_URL || null,
      CORS_ORIGINS: process.env.CORS_ORIGINS || null,
      APP_URL: process.env.APP_URL || null,
      NODE_ENV: process.env.NODE_ENV || null,
    },
    adonisEnv: {
      FRONTEND_URL: env.default.get('FRONTEND_URL') || null,
      CORS_ORIGINS: env.default.get('CORS_ORIGINS') || null,
      APP_URL: env.default.get('APP_URL') || null,
    },
    allowedOrigins: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
      .split(',')
      .map((s: string) => s.trim().replace(/\/$/, ''))
      .filter(Boolean),
  }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
        router.post('forgot-password', [controllers.PasswordReset, 'forgot'])
        router.post('reset-password', [controllers.PasswordReset, 'reset'])
        router.get('google/redirect', [controllers.GoogleAuth, 'redirect'])
        router.get('google/callback', [controllers.GoogleAuth, 'callback'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Settings, 'show'])
        router.put('/', [controllers.Settings, 'update'])
      })
      .prefix('account/settings')
      .as('settings')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Subscription, 'show'])
        router.post('upgrade-request', [controllers.Subscription, 'requestUpgrade'])
      })
      .prefix('account/subscription')
      .as('subscription')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.LogEntries, 'index'])
        router.post('/', [controllers.LogEntries, 'store'])
        router.get(':id', [controllers.LogEntries, 'show'])
        router.put(':id', [controllers.LogEntries, 'update'])
        router.delete(':id', [controllers.LogEntries, 'destroy'])
      })
      .prefix('log-entries')
      .as('logEntries')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Notes, 'index'])
        router.post('/', [controllers.Notes, 'store'])
        router.get(':id', [controllers.Notes, 'show'])
        router.put(':id', [controllers.Notes, 'update'])
        router.delete(':id', [controllers.Notes, 'destroy'])
      })
      .prefix('notes')
      .as('notes')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('users', [controllers.AdminUsers, 'index'])
        router.get('summary', [controllers.AdminUsers, 'summary'])
        router.get('users/:id', [controllers.AdminUsers, 'show'])
        router.patch('users/:id/role', [controllers.AdminUsers, 'updateRole'])
        router.put('users/:id/subscription', [controllers.AdminUsers, 'assignSubscription'])
        router.delete('users/:id', [controllers.AdminUsers, 'destroy'])
        router.get('plans', [controllers.AdminPlans, 'index'])
        router.post('plans', [controllers.AdminPlans, 'store'])
        router.put('plans/:id', [controllers.AdminPlans, 'update'])
        router.delete('plans/:id', [controllers.AdminPlans, 'destroy'])
        router.get('upgrade-requests', [controllers.AdminUpgradeRequests, 'index'])
        router.post('upgrade-requests/:id/approve', [controllers.AdminUpgradeRequests, 'approve'])
        router.post('upgrade-requests/:id/reject', [controllers.AdminUpgradeRequests, 'reject'])
      })
      .prefix('admin')
      .as('admin')
      .use(middleware.auth())
      .use(middleware.admin())

    router
      .group(() => {
        router.get('/', [controllers.Attendances, 'index'])
        router.get('summary', [controllers.Attendances, 'summary'])
        router.post('check-in', [controllers.Attendances, 'checkIn'])
        router.post('check-out', [controllers.Attendances, 'checkOut'])
        router.post('full-day', [controllers.Attendances, 'fullDay'])
        router.post('partial', [controllers.Attendances, 'partial'])
        router.put(':id', [controllers.Attendances, 'update'])
        router.delete(':id', [controllers.Attendances, 'destroy'])
      })
      .prefix('attendances')
      .as('attendances')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
