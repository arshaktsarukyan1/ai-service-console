export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const endpoint = `${config.backendBaseUrl}/internal/ai/provider`

  try {
    return await $fetch<Record<string, unknown>>(endpoint, {
      method: 'GET',
    })
  } catch (error: unknown) {
    const statusCode =
      typeof error === 'object' && error && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode) || 502
        : 502
    const statusMessage = 'Failed to load provider configuration from backend service.'
    const data =
      typeof error === 'object' && error && 'data' in error
        ? (error as { data?: unknown }).data
        : undefined

    throw createError({
      statusCode,
      statusMessage,
      data,
    })
  }
})
