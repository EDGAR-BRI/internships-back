import type UserSetting from '#models/user_setting'
import { BaseTransformer } from '@adonisjs/core/transformers'
import encryption from '@adonisjs/core/services/encryption'

function maskKey(encryptedKey: string | null): string | null {
  if (!encryptedKey) return null
  let key: string | null = null
  try {
    key = encryption.decrypt(encryptedKey)
  } catch {
    return '••••••••'
  }
  if (!key) return null
  if (key.length <= 8) return '••••••••'
  return `••••${key.slice(-4)}`
}

export default class UserSettingTransformer extends BaseTransformer<UserSetting> {
  toObject() {
    const obj = this.pick(this.resource, [
      'id',
      'userId',
      'startDate',
      'endDate',
      'ci',
      'tutorName',
      'skippedWeeks',
      'workType',
      'workHoursPerDay',
      'daysPerWeek',
      'workStartTime',
      'workEndTime',
      'workMorningEndTime',
      'workAfternoonStartTime',
      'createdAt',
      'updatedAt',
    ])

    return {
      ...obj,
      geminiApiKey: maskKey(this.resource.geminiApiKey),
    }
  }
}
