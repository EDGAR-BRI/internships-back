/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
    googleAuth: {
      redirect: typeof routes['auth.google_auth.redirect']
      callback: typeof routes['auth.google_auth.callback']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  settings: {
    settings: {
      show: typeof routes['settings.settings.show']
      update: typeof routes['settings.settings.update']
    }
  }
  logEntries: {
    logEntries: {
      index: typeof routes['logEntries.log_entries.index']
      store: typeof routes['logEntries.log_entries.store']
      show: typeof routes['logEntries.log_entries.show']
      update: typeof routes['logEntries.log_entries.update']
      destroy: typeof routes['logEntries.log_entries.destroy']
    }
  }
  notes: {
    notes: {
      index: typeof routes['notes.notes.index']
      store: typeof routes['notes.notes.store']
      show: typeof routes['notes.notes.show']
      update: typeof routes['notes.notes.update']
      destroy: typeof routes['notes.notes.destroy']
    }
  }
  attendances: {
    attendances: {
      index: typeof routes['attendances.attendances.index']
      summary: typeof routes['attendances.attendances.summary']
      checkIn: typeof routes['attendances.attendances.check_in']
      checkOut: typeof routes['attendances.attendances.check_out']
      fullDay: typeof routes['attendances.attendances.full_day']
      partial: typeof routes['attendances.attendances.partial']
      update: typeof routes['attendances.attendances.update']
      destroy: typeof routes['attendances.attendances.destroy']
    }
  }
}
