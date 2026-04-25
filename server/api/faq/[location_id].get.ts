export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const locationId = getRouterParam(event, 'location_id')

  if (!locationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Location id is required.',
    })
  }

  const endpoint = `${config.backendBaseUrl}/faq/${locationId}`

  try {
    return await $fetch<Record<string, unknown>>(endpoint, {
      method: 'GET',
    })
  } catch (error: unknown) {
    const statusCode =
      typeof error === 'object' && error && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode) || 502
        : 502
    const statusMessage = 'Failed to load FAQ details from backend service.'
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
