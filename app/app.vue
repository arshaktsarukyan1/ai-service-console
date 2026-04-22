<script setup lang="ts">
type TaskOption = {
  value: string
  label: string
}

type ExecutePayload = {
  task: string
  input_text: string
  metadata: Record<string, unknown>
}

type ProviderResponse = {
  active_provider?: string
  default_model?: string
}

const api_url = ref('/api/ai/execute')
const provider_api_url = '/api/ai/provider'
const selected_task = ref('information_preparation')
const input_text = ref('Summarize: FastAPI is a modern web framework.')
const metadata_text = ref('{\n  "language": "en"\n}')
const response_text = ref('')
const request_error = ref('')
const provider_error = ref('')
const is_loading = ref(false)
const is_loading_provider = ref(false)
const response_time_ms = ref<number | null>(null)
const active_provider = ref('Unknown')
const default_model = ref('Unknown')

const task_options: TaskOption[] = [
  { value: 'information_preparation', label: 'Information Preparation' },
  { value: 'information_structuring', label: 'Information Structuring' },
  { value: 'voice_assistant', label: 'Voice Response' },
]

const available_tasks = computed(() => task_options.map(({ label }) => label))

const is_healthy = computed(() => !request_error.value && !provider_error.value)
const status_label = computed(() => (is_healthy.value ? 'Healthy' : 'Needs attention'))

const load_provider = async (): Promise<void> => {
  provider_error.value = ''
  is_loading_provider.value = true

  try {
    const response = await $fetch<ProviderResponse>(provider_api_url, {
      method: 'GET',
    })

    active_provider.value = (response.active_provider || 'Unknown').toString()
    default_model.value = (response.default_model || 'Unknown').toString()
  } catch (error) {
    active_provider.value = 'Unknown'
    default_model.value = 'Unknown'
    provider_error.value = error instanceof Error ? error.message : 'Failed to load provider.'
  } finally {
    is_loading_provider.value = false
  }
}

const parse_metadata = (): Record<string, unknown> => {
  const parsed_json = JSON.parse(metadata_text.value)
  if (parsed_json && typeof parsed_json === 'object' && !Array.isArray(parsed_json))
    return parsed_json as Record<string, unknown>
  throw new Error('Metadata must be a JSON object.')
}

const execute_task = async (): Promise<void> => {
  request_error.value = ''
  is_loading.value = true
  response_time_ms.value = null

  const start_time = performance.now()

  try {
    const metadata = parse_metadata()
    const payload: ExecutePayload = {
      task: selected_task.value,
      input_text: input_text.value.trim(),
      metadata,
    }

    if (!payload.input_text) throw new Error('Input text is required.')

    const response = await $fetch<Record<string, unknown>>(api_url.value, {
      method: 'POST',
      body: payload,
    })

    response_text.value = JSON.stringify(response, null, 2)
  } catch (error) {
    const fallback_message = 'Request failed.'
    if (error instanceof Error) {
      request_error.value = error.message || fallback_message
    } else {
      request_error.value = fallback_message
    }

    response_text.value = ''
  } finally {
    response_time_ms.value = Math.round(performance.now() - start_time)
    is_loading.value = false
  }
}

onMounted(async () => {
  await load_provider()
})
</script>

<template>
  <div class="page">
    <NuxtRouteAnnouncer />

    <main class="container">
      <h1>AI Service Interface</h1>

      <section class="top-cards">
        <article class="card">
          <h2>Service Status</h2>
          <p :class="['status', { healthy: is_healthy }]">{{ status_label }}</p>
          <p class="hint" v-if="response_time_ms !== null">
            Last request: {{ response_time_ms }} ms
          </p>
        </article>

        <article class="card">
          <h2>Active Provider</h2>
          <p class="provider-name">{{ active_provider }}</p>
          <p class="hint">Model: {{ default_model }}</p>
          <p v-if="provider_error" class="error hint">{{ provider_error }}</p>
          <p v-else-if="is_loading_provider" class="hint">Loading provider...</p>
        </article>

        <article class="card">
          <h2>Available Tasks</h2>
          <ul>
            <li v-for="task in available_tasks" :key="task">{{ task }}</li>
          </ul>
        </article>
      </section>

      <section class="card form-card">
        <h2>Execute AI Task</h2>
        <label for="api-url">Endpoint</label>
        <input id="api-url" v-model="api_url" type="text" />

        <label for="task">Select Task Type</label>
        <select id="task" v-model="selected_task">
          <option v-for="option in task_options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <label for="input-text">Input Text</label>
        <textarea
          id="input-text"
          v-model="input_text"
          rows="4"
          placeholder="Enter input data or text here..."
        />

        <label for="metadata-json">Metadata (JSON Object)</label>
        <textarea id="metadata-json" v-model="metadata_text" rows="5" />

        <button :disabled="is_loading" @click="execute_task">
          {{ is_loading ? 'Executing...' : 'Execute Task' }}
        </button>
      </section>

      <section class="bottom-cards">
        <article class="card response-card">
          <h2>AI Response</h2>
          <p v-if="request_error" class="error">{{ request_error }}</p>
          <pre v-else-if="response_text">{{ response_text }}</pre>
          <p v-else class="hint">Run a request to view the response.</p>
        </article>

        <article class="card">
          <h2>Provider Configuration</h2>
          <ul>
            <li><strong>Provider:</strong> {{ active_provider }}</li>
            <li><strong>Model:</strong> {{ default_model }}</li>
            <li><strong>Endpoint:</strong> {{ api_url }}</li>
            <li><strong>Status:</strong> {{ is_loading ? 'Executing request' : 'Ready' }}</li>
          </ul>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  background: #f4f6fb;
  color: #1f2937;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  padding: 28px;
}

.container {
  max-width: 1180px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 18px;
  font-size: 30px;
}

h2 {
  font-size: 18px;
  margin: 0 0 14px;
}

.top-cards,
.bottom-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.bottom-cards {
  grid-template-columns: 2fr 1fr;
}

.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

label {
  font-size: 14px;
  font-weight: 600;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  background: #fff;
  color: inherit;
}

textarea {
  resize: vertical;
}

button {
  width: fit-content;
  margin-top: 4px;
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

ul {
  margin: 0;
  padding-left: 18px;
}

li {
  margin-bottom: 6px;
}

.status {
  margin: 4px 0 0;
  font-weight: 700;
  color: #b91c1c;
}

.status.healthy {
  color: #059669;
}

.provider-name {
  font-size: 30px;
  font-weight: 700;
  margin: 2px 0;
}

.hint {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.response-card pre {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  line-height: 1.45;
  overflow-x: auto;
  max-height: 380px;
}

.error {
  margin: 0;
  color: #b91c1c;
  font-weight: 600;
}

@media (max-width: 980px) {
  .top-cards,
  .bottom-cards {
    grid-template-columns: 1fr;
  }

  .page {
    padding: 14px;
  }
}
</style>
