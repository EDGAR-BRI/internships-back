import UserSetting from '#models/user_setting'
import type { HttpContext } from '@adonisjs/core/http'
import { updateSettingsValidator } from '#validators/user_setting'
import UserSettingTransformer from '#transformers/user_setting_transformer'
import CacheService from '#services/cache_service'
import encryption from '@adonisjs/core/services/encryption'

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

    let geminiApiKey: string | null | undefined
    if (data.geminiApiKey !== undefined) {
      geminiApiKey = data.geminiApiKey.trim() ? encryption.encrypt(data.geminiApiKey.trim()) : null
    }

    const payload: Record<string, unknown> = {
      startDate: data.startDate,
      endDate: data.endDate,
      skippedWeeks: data.skippedWeeks ?? null,
      workType: data.workType ?? null,
      workHoursPerDay: data.workHoursPerDay ?? null,
      daysPerWeek: data.daysPerWeek ?? null,
      workStartTime: data.workStartTime ?? null,
      workEndTime: data.workEndTime ?? null,
      workMorningEndTime: data.workMorningEndTime ?? null,
      workAfternoonStartTime: data.workAfternoonStartTime ?? null,
      geminiApiKey,
    }
    if (data.ci !== undefined) {
      payload.ci = data.ci
    }
    if (data.tutorName !== undefined) {
      payload.tutorName = data.tutorName
    }

    const settings = await UserSetting.updateOrCreate({ userId: user.id }, payload)

    await CacheService.invalidateUser(user.id)

    return serialize({
      settings: UserSettingTransformer.transform(settings),
    })
  }
}
