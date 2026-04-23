import { Queue } from 'bullmq'

export const REPO_SYNC_QUEUE_NAME = 'repo-sync'
export const REPO_SYNC_JOB_NAME = 'index-repository'

export type RepoSyncJobPayload = {
  repositoryId: number
  organizationId: number
  sshKeyId: number | null
}

let repoSyncQueue: Queue<RepoSyncJobPayload> | null = null

function getRedisConnectionOptions() {
  const redisUrl = process.env.REDIS_URL?.trim()

  if (!redisUrl) {
    throw new Error('REDIS_URL is required to enqueue repository sync jobs')
  }

  return {
    url: redisUrl,
    maxRetriesPerRequest: null,
  }
}

function getRepoSyncQueue() {
  if (!repoSyncQueue) {
    repoSyncQueue = new Queue<RepoSyncJobPayload>(REPO_SYNC_QUEUE_NAME, {
      connection: getRedisConnectionOptions(),
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 200,
        attempts: 3,
      },
    })
  }

  return repoSyncQueue
}

export async function enqueueRepoSyncJob(payload: RepoSyncJobPayload) {
  const queue = getRepoSyncQueue()
  const job = await queue.add(REPO_SYNC_JOB_NAME, payload)
  return job
}
