import UserSetting from '#models/user_setting'
import type { HttpContext } from '@adonisjs/core/http'
import { updateSettingsValidator } from '#validators/user_setting'
import UserSettingTransformer from '#transformers/user_setting_transformer'

export default class SettingsController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const settings = await UserSetting.query().where('userId', user.id).first()

    if (!settings) {
      return serialize({ settings: null })
    }

    return serialize({
      settings: UserSettingTransformer.transform(settings),
    })
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
      }
    )

    return serialize({
      settings: UserSettingTransformer.transform(settings),
    })
  }
}
