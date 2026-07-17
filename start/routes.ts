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

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
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
        router.get('/', [controllers.Attendances, 'index'])
        router.post('check-in', [controllers.Attendances, 'checkIn'])
        router.post('check-out', [controllers.Attendances, 'checkOut'])
      })
      .prefix('attendances')
      .as('attendances')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
