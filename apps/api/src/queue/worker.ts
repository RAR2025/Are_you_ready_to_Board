import { Worker } from 'bullmq'
import {
  REPO_SYNC_JOB_NAME,
  REPO_SYNC_QUEUE_NAME,
  type RepoSyncJobPayload,
} from './repo-sync-queue.js'

const redisUrl = process.env.REDIS_URL?.trim()

if (!redisUrl) {
  throw new Error('REDIS_URL is required to run the repository sync worker')
}

const worker = new Worker<RepoSyncJobPayload>(
  REPO_SYNC_QUEUE_NAME,
  async (job) => {
    if (job.name !== REPO_SYNC_JOB_NAME) {
      throw new Error(`Unsupported job name: ${job.name}`)
    }

    const { repositoryId, organizationId, sshKeyId } = job.data

    // Worker scaffold: Agent 1 integration consumes this payload in a follow-up change.
    console.log('Received repository sync job', {
      jobId: job.id,
      repositoryId,
      organizationId,
      sshKeyId,
    })
  },
  {
    connection: {
      url: redisUrl,
      maxRetriesPerRequest: null,
    },
  },
)

worker.on('completed', (job) => {
  console.log('Repository sync job completed', { jobId: job.id })
})

worker.on('failed', (job, error) => {
  console.error('Repository sync job failed', { jobId: job?.id, error })
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await worker.close()
    process.exit(0)
  })
}

console.log('Repository sync worker is running')
