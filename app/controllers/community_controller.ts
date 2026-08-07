import User from '#models/user'
import Note from '#models/note'
import Attendance from '#models/attendance'
import NoteComment from '#models/note_comment'
import NoteReaction from '#models/note_reaction'
import UserSetting from '#models/user_setting'
import AttendanceProgressService from '#services/attendance_progress_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommunityController {
  private assertPublicAccess(user: User) {
    if (!user.profilePublic) {
      return {
        error: true,
        message: 'Habilita tu perfil público en los ajustes para acceder a la comunidad',
      }
    }
    return { error: false }
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      initials: user.initials,
    }
  }

  async ranking({ auth, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return serialize({ error: denied.message, ranking: [] })
    }

    const users = await User.query().orderBy('fullName', 'asc')
    const settingsByUser = new Map<number, UserSetting | null>()
    for (const u of users) {
      const s = await UserSetting.query().where('userId', u.id).first()
      settingsByUser.set(u.id, s)
    }

    const ranking = []
    for (const u of users) {
      const attendances = await Attendance.query().where('user_id', u.id).orderBy('date', 'asc')
      const settings = settingsByUser.get(u.id) ?? null
      let completedDays = 0
      let completedHours = 0
      let onSiteDays = 0
      let remoteDays = 0
      let streak = 0
      const dayMap = new Map<string, number>()

      for (const a of attendances) {
        const day = AttendanceProgressService.countCompletedDay(a, settings)
        const hours = AttendanceProgressService.computeDayHours(a, settings)
        completedDays += day
        completedHours += hours
        if (day > 0) {
          if (a.mode === 'remote') remoteDays += day
          else onSiteDays += day
          dayMap.set(a.date.toSQLDate()!, day)
        }
      }

      const dates = Array.from(dayMap.keys()).sort().reverse()
      let lastDate: string | null = null
      for (const d of dates) {
        if (lastDate === null) {
          lastDate = d
          streak = 1
          continue
        }
        const prev: Date = new Date(lastDate + 'T00:00:00')
        prev.setDate(prev.getDate() - 1)
        if (prev.toISOString().slice(0, 10) === d) {
          streak++
          lastDate = d
        } else {
          break
        }
      }

      ranking.push({
        user: this.publicUser(u),
        completedDays: Math.round(completedDays * 10) / 10,
        completedHours: Math.round(completedHours * 10) / 10,
        onSiteDays: Math.round(onSiteDays * 10) / 10,
        remoteDays: Math.round(remoteDays * 10) / 10,
        attendanceCount: attendances.length,
        streak,
        position: 0,
      })
    }

    ranking.sort((a, b) => b.completedHours - a.completedHours)
    ranking.forEach((r, i) => (r.position = i + 1))

    return serialize({ ranking })
  }

  async notes({ auth, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return serialize({ error: denied.message, notes: [] })
    }

    const publicUsers = await User.query().where('profile_public', true)
    const publicIds = publicUsers.map((u) => u.id)
    const userMap = new Map(publicUsers.map((u) => [u.id, u]))

    const notes = await Note.query()
      .whereIn('user_id', publicIds)
      .preload('comments', (q) => q.preload('user').orderBy('created_at', 'asc'))
      .preload('reactions', (q) => q.preload('user'))
      .orderBy('created_at', 'desc')
      .limit(60)

    const data = notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      tag: n.tag,
      date: n.date,
      createdAt: n.createdAt,
      user:
        n.userId !== me.id
          ? this.publicUser(userMap.get(n.userId)!)
          : { ...this.publicUser(me), mine: true },
      comments: n.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: this.publicUser(userMap.get(c.userId) ?? c.user),
        mine: c.userId === me.id,
      })),
      reactions: this.reactionsFor(n.reactions, me.id),
    }))

    return serialize({ notes: data })
  }

  private reactionsFor(reactions: NoteReaction[], meId: number) {
    const grouped = new Map<string, { emoji: string; count: number; reacted: boolean }>()
    for (const r of reactions) {
      const entry = grouped.get(r.emoji) ?? { emoji: r.emoji, count: 0, reacted: false }
      entry.count++
      if (r.userId === meId) entry.reacted = true
      grouped.set(r.emoji, entry)
    }
    return Array.from(grouped.values()).sort((a, b) => b.count - a.count)
  }

  async toggleReaction({ auth, params, request, serialize, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return response.badRequest({ message: denied.message })
    }

    const communityValidator = await import('#validators/community')
    const { emoji } = await request.validateUsing(communityValidator.reactionValidator)

    const note = await Note.query()
      .where('id', params.id)
      .whereIn('user_id', User.query().select('id').where('profile_public', true))
      .first()

    if (!note) {
      return response.notFound({ message: 'Nota no encontrada' })
    }

    const existing = await NoteReaction.query()
      .where('note_id', note.id)
      .where('user_id', me.id)
      .where('emoji', emoji)
      .first()

    if (existing) {
      await existing.delete()
    } else {
      await NoteReaction.create({ noteId: note.id, userId: me.id, emoji })
    }

    const reactions = await NoteReaction.query().where('note_id', note.id).preload('user')
    const noteReactions = reactions.filter((r) => r.noteId === note.id)

    return serialize({
      reactions: this.reactionsFor(noteReactions, me.id),
    })
  }

  private async statsFor(user: User, settings: UserSetting | null) {
    const attendances = await Attendance.query().where('user_id', user.id).orderBy('date', 'asc')
    let completedDays = 0
    let completedHours = 0
    let onSiteDays = 0
    let remoteDays = 0
    for (const a of attendances) {
      const day = AttendanceProgressService.countCompletedDay(a, settings)
      completedDays += day
      completedHours += AttendanceProgressService.computeDayHours(a, settings)
      if (day > 0) {
        if (a.mode === 'remote') remoteDays += day
        else onSiteDays += day
      }
    }
    return {
      completedDays: Math.round(completedDays * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      onSiteDays: Math.round(onSiteDays * 10) / 10,
      remoteDays: Math.round(remoteDays * 10) / 10,
      attendanceCount: attendances.length,
    }
  }

  async search({ auth, request, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return serialize({ error: denied.message, users: [] })
    }

    const q = String(request.input('q', '')).trim().slice(0, 100)
    if (!q) {
      return serialize({ users: [] })
    }

    const users = await User.query()
      .where('full_name', 'like', `%${q}%`)
      .orWhere('email', 'like', `%${q}%`)
      .orderBy('fullName', 'asc')
      .limit(20)

    const results = []
    for (const u of users) {
      const base = {
        id: u.id,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        initials: u.initials,
        isPrivate: !u.profilePublic,
      }
      if (u.profilePublic) {
        const settings = await UserSetting.query().where('userId', u.id).first()
        const stats = await this.statsFor(u, settings)
        const notesCount = await Note.query().where('user_id', u.id).count('* as total')
        results.push({
          ...base,
          isPrivate: false,
          stats,
          notesCount: Number(notesCount[0].$extras.total ?? 0),
        })
      } else {
        results.push(base)
      }
    }

    return serialize({ users: results })
  }

  async publicProfile({ auth, params, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return serialize({ error: denied.message, user: null })
    }

    const user = await User.query().where('id', params.id).first()
    if (!user) {
      return serialize({ user: null })
    }

    if (!user.profilePublic) {
      return serialize({
        user: this.publicUser(user),
        isPrivate: true,
      })
    }

    const settings = await UserSetting.query().where('userId', user.id).first()
    const stats = await this.statsFor(user, settings)

    const notes = await Note.query()
      .where('user_id', user.id)
      .preload('comments', (q) => q.preload('user').orderBy('created_at', 'asc'))
      .preload('reactions', (q) => q.preload('user'))
      .orderBy('created_at', 'desc')
      .limit(30)

    return serialize({
      user: this.publicUser(user),
      stats,
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        tag: n.tag,
        date: n.date,
        createdAt: n.createdAt,
        comments: n.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          user: this.publicUser(c.user),
          mine: c.userId === me.id,
        })),
        reactions: this.reactionsFor(n.reactions, me.id),
      })),
    })
  }

  async addComment({ auth, params, request, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return serialize({ error: denied.message })
    }

    const communityValidator = await import('#validators/community')
    const { content } = await request.validateUsing(communityValidator.commentValidator)

    const note = await Note.query()
      .where('id', params.id)
      .whereIn('user_id', User.query().select('id').where('profile_public', true))
      .first()

    if (!note) {
      return serialize({ error: 'Nota no encontrada' })
    }

    const comment = await NoteComment.create({
      noteId: note.id,
      userId: me.id,
      content: content.trim(),
    })

    await comment.load('user')

    return serialize({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: this.publicUser(comment.user),
        mine: true,
      },
    })
  }

  async deleteComment({ auth, params, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return response.badRequest({ message: denied.message })
    }

    const comment = await NoteComment.query().where('id', params.id).where('user_id', me.id).first()
    if (!comment) {
      return response.notFound({ message: 'Comentario no encontrado' })
    }

    await comment.delete()
    return response.noContent()
  }
}
