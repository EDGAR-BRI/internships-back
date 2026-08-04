import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import SubscriptionService from '#services/subscription_service'

export default class NewAccountController {
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const userCount = await User.query().count('* as total').first()
    const role = userCount && Number(userCount.$extras.total) === 0 ? 'admin' : 'user'

    const user = await User.create({ fullName, email, password, role })
    await SubscriptionService.assignPlan(user.id, 'free')
    const token = await User.accessTokens.create(user)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}
