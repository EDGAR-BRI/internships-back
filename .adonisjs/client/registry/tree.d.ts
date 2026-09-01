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
      update: typeof routes['profile.profile.update']
      changePassword: typeof routes['profile.profile.change_password']
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
  subscription: {
    subscription: {
      show: typeof routes['subscription.subscription.show']
      requestUpgrade: typeof routes['subscription.subscription.request_upgrade']
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
  ai: {
    aiSuggest: {
      store: typeof routes['ai.ai_suggest.store']
    }
  }
  admin: {
    adminUsers: {
      index: typeof routes['admin.admin_users.index']
      summary: typeof routes['admin.admin_users.summary']
      show: typeof routes['admin.admin_users.show']
      updateRole: typeof routes['admin.admin_users.update_role']
      assignSubscription: typeof routes['admin.admin_users.assign_subscription']
      destroy: typeof routes['admin.admin_users.destroy']
    }
    adminPlans: {
      index: typeof routes['admin.admin_plans.index']
      store: typeof routes['admin.admin_plans.store']
      update: typeof routes['admin.admin_plans.update']
      destroy: typeof routes['admin.admin_plans.destroy']
    }
    adminUpgradeRequests: {
      index: typeof routes['admin.admin_upgrade_requests.index']
      approve: typeof routes['admin.admin_upgrade_requests.approve']
      reject: typeof routes['admin.admin_upgrade_requests.reject']
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
  community: {
    community: {
      ranking: typeof routes['community.community.ranking']
      notes: typeof routes['community.community.notes']
      search: typeof routes['community.community.search']
      publicProfile: typeof routes['community.community.public_profile']
      addComment: typeof routes['community.community.add_comment']
      deleteComment: typeof routes['community.community.delete_comment']
      toggleReaction: typeof routes['community.community.toggle_reaction']
      toggleCommentReaction: typeof routes['community.community.toggle_comment_reaction']
    }
  }
}
