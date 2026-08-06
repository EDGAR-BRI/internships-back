import User from '#models/user'
import Note from '#models/note'
import Attendance from '#models/attendance'
import NoteComment from '#models/note_comment'
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

    const users = await User.query().where('profile_public', true).orderBy('fullName', 'asc')
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
    }))

    return serialize({ notes: data })
  }

  async publicProfile({ auth, params, serialize }: HttpContext) {
    const me = auth.getUserOrFail()
    const denied = this.assertPublicAccess(me)
    if (denied.error) {
      return serialize({ error: denied.message, user: null })
    }

    const user = await User.query().where('id', params.id).where('profile_public', true).first()
    if (!user) {
      return serialize({ user: null })
    }

    const settings = await UserSetting.query().where('userId', user.id).first()
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

    const notes = await Note.query()
      .where('user_id', user.id)
      .preload('comments', (q) => q.preload('user').orderBy('created_at', 'asc'))
      .orderBy('created_at', 'desc')
      .limit(30)

    return serialize({
      user: this.publicUser(user),
      stats: {
        completedDays: Math.round(completedDays * 10) / 10,
        completedHours: Math.round(completedHours * 10) / 10,
        onSiteDays: Math.round(onSiteDays * 10) / 10,
        remoteDays: Math.round(remoteDays * 10) / 10,
      },
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
