type ExecutePayload = {
  task: string
  input_text: string
  metadata?: Record<string, unknown>
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const payload = await readBody<ExecutePayload>(event)
  const endpoint = `${config.backendBaseUrl}/internal/ai/execute`

  try {
    return await $fetch<Record<string, unknown>>(endpoint, {
      method: 'POST',
      body: payload
    })
  } catch (error: unknown) {
    const statusCode = typeof error === 'object' && error && 'statusCode' in error
      ? Number((error as { statusCode?: number }).statusCode) || 502
      : 502
    const statusMessage = 'Failed to execute AI task via backend service.'
    const data = typeof error === 'object' && error && 'data' in error
      ? (error as { data?: unknown }).data
      : undefined

    throw createError({
      statusCode,
      statusMessage,
      data
    })
  }
})
