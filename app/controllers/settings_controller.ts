import UserSetting from '#models/user_setting'
import type { HttpContext } from '@adonisjs/core/http'
import { updateSettingsValidator } from '#validators/user_setting'
import UserSettingTransformer from '#transformers/user_setting_transformer'
import CacheService from '#services/cache_service'

export default class SettingsController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const cacheKey = CacheService.userKey(user.id, 'settings')

    const cached = await CacheService.get(cacheKey)
    if (cached) {
      return serialize(cached)
    }

    const settings = await UserSetting.query().where('userId', user.id).first()

    if (!settings) {
      return serialize({ settings: null })
    }

    const payload = {
      settings: new UserSettingTransformer(settings).toObject(),
    }
    await CacheService.set(cacheKey, payload)
    return serialize(payload)
  }

  async update({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateSettingsValidator)

    const settings = await UserSetting.updateOrCreate(
      { userId: user.id },
      {
        startDate: data.startDate,
        endDate: data.endDate,
        skippedWeeks: data.skippedWeeks ?? null,
        workType: data.workType ?? null,
        workHoursPerDay: data.workHoursPerDay ?? null,
        daysPerWeek: data.daysPerWeek ?? null,
      }
    )

    await CacheService.invalidateUser(user.id)

    return serialize({
      settings: UserSettingTransformer.transform(settings),
    })
  }
}
