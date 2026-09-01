import UserSetting from '#models/user_setting'
import type { HttpContext } from '@adonisjs/core/http'
import { aiSuggestValidator } from '#validators/ai_suggest'
import SubscriptionService from '#services/subscription_service'
import env from '#start/env'
import encryption from '@adonisjs/core/services/encryption'
import logger from '@adonisjs/core/services/logger'

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

interface GeminiPart {
  text?: string
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

function buildPrompt(input: {
  name: string
  area: string | null
  status: string | null
  notes: { title: string | null; content: string }[]
  fields: { theory: string | null; impact: string | null; resources: string | null }
}): string {
  const notesText = input.notes
    .map((n, i) => `${i + 1}. ${n.title ? `**${n.title}** — ` : ''}${n.content}`)
    .join('\n')

  const fieldsText = [
    input.fields.theory ? `- Teorías actuales: ${input.fields.theory}` : '',
    input.fields.impact ? `- Impacto actual: ${input.fields.impact}` : '',
    input.fields.resources ? `- Otros elementos actuales: ${input.fields.resources}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `
Soy un pasante registrando actividades en mi bitácora de trabajo. Ayúdame a completar el cuadro de registro de la pasantía.

ACTIVIDAD: ${input.name}
ÁREA O DEPARTAMENTO: ${input.area || 'No especificada'}
ESTADO: ${input.status || 'No especificado'}
${fieldsText ? `\nCAMPOS YA ESCRITOS (respétalos y solo mejóralos si es necesario):\n${fieldsText}` : ''}
${notesText ? `\nNOTAS DE LA ACTIVIDAD (usa estas notas como la fuente principal de información):\n${notesText}` : '\nNOTAS DE LA ACTIVIDAD: (no hay notas)'}

Responde ÚNICAMENTE con un objeto JSON con esta forma exacta (sin texto adicional, sin markdown):
{
  "theory": "Teorías aprendidas en mis estudios que apliqué en esta actividad, con autor entre paréntesis si se conoce",
  "learnings": "Nuevos aprendizajes: conocimientos, habilidades prácticas o habilidades de manejo de emociones adquiridas, redactado en primera persona",
  "impact": "Qué me impresionó o impactó de esta actividad, en primera persona",
  "resources": "Otros elementos a considerar: errores corregidos, decisiones, pendientes, enlaces"
}

Reglas:
- Todo en español, primera persona del singular, pasado.
- Si una nota no aporta para un campo, deja ese campo con texto breve y útil.
- No inventes autores de teorías; si no hay evidencia, describe el concepto sin atribuir autor.
`.trim()
}

export default class AiSuggestController {
  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(aiSuggestValidator)

    const plan = await SubscriptionService.getPlanFor(user.id)
    if (!user.isAdmin && !plan.canUseAi) {
      return response.forbidden({
        message:
          'El autocompletado con IA está disponible en el plan Pro. Actualiza por $3 (pago único) para usarlo.',
        code: 'AI_NOT_AVAILABLE',
      })
    }

    const settings = await UserSetting.query().where('userId', user.id).first()
    const encryptedKey = settings?.geminiApiKey ?? null
    if (!encryptedKey) {
      return response.forbidden({
        message:
          'Configura tu API key de Google Gemini en Ajustes para usar el autocompletado con IA.',
        code: 'AI_KEY_MISSING',
      })
    }

    let apiKey: string
    try {
      apiKey = encryption.decrypt(encryptedKey) ?? ''
      if (!apiKey) throw new Error('empty key')
    } catch (error) {
      logger.error({ error }, 'Failed to decrypt gemini api key')
      return response.badRequest({
        message: 'La API key de Gemini configurada no es válida. Vuelve a configurarla en Ajustes.',
        code: 'AI_KEY_INVALID',
      })
    }

    const prompt = buildPrompt({
      name: data.name,
      area: data.area ?? null,
      status: data.status ?? null,
      notes: (data.notes ?? []).map((n) => ({
        title: n.title ?? null,
        content: n.content,
      })),
      fields: {
        theory: data.fields?.theory ?? null,
        impact: data.fields?.impact ?? null,
        resources: data.fields?.resources ?? null,
      },
    })

    const model = env.get('GEMINI_MODEL', 'gemini-2.0-flash')

    let gemini: Response
    try {
      gemini = await fetch(
        `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.5,
            },
          }),
        }
      )
    } catch (error) {
      logger.error({ error }, 'Failed to reach Gemini API')
      return response.badGateway({
        message: 'No se pudo conectar con el servicio de IA. Intenta de nuevo.',
        code: 'AI_NETWORK_ERROR',
      })
    }

    if (!gemini.ok) {
      logger.error({ status: gemini.status }, 'Gemini API error')
      return response.badGateway({
        message:
          'El servicio de IA respondió con un error. Verifica tu API key o intenta de nuevo.',
        code: 'AI_PROVIDER_ERROR',
      })
    }

    let payload: GeminiResponse
    try {
      payload = (await gemini.json()) as GeminiResponse
    } catch (error) {
      logger.error({ error }, 'Invalid Gemini response')
      return response.badGateway({
        message: 'El servicio de IA respondió con un formato inválido. Intenta de nuevo.',
        code: 'AI_PROVIDER_ERROR',
      })
    }

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    let suggestion: { theory?: string; learnings?: string; impact?: string; resources?: string }
    try {
      suggestion = JSON.parse(text)
    } catch (error) {
      logger.error({ error, text }, 'Gemini returned non-JSON output')
      return response.badGateway({
        message: 'El servicio de IA devolvió una respuesta inválida. Intenta de nuevo.',
        code: 'AI_PROVIDER_ERROR',
      })
    }

    const normalize = (value: unknown): string | null => {
      if (typeof value !== 'string') return null
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }

    return serialize({
      suggestion: {
        theory: normalize(suggestion.theory),
        learnings: normalize(suggestion.learnings),
        impact: normalize(suggestion.impact),
        resources: normalize(suggestion.resources),
      },
    })
  }
}
