import type UserSetting from '#models/user_setting'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserSettingTransformer extends BaseTransformer<UserSetting> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'userId',
      'startDate',
      'endDate',
      'skippedWeeks',
      'workType',
      'workHoursPerDay',
      'daysPerWeek',
      'createdAt',
      'updatedAt',
    ])
  }
}
