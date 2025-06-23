import { redis } from './redis';

const PRIORITY_KEY = 'systemload:priority';
const PROGRESS_KEY_PREFIX = 'systemload:progress:'; // e.g., systemload:progress:orders

export async function getPriorityList() {
  const data = await redis.get(PRIORITY_KEY);
  return data ? JSON.parse(data) : [];
}

export async function setPriorityList(priorityList: string[]) {
  await redis.set(PRIORITY_KEY, JSON.stringify(priorityList));
}

export async function getLastKey(resource: string) {
  const data = await redis.get(PROGRESS_KEY_PREFIX + resource);
  return data ? JSON.parse(data) : null;
}

export async function setLastKey(resource: string, lastKey: any) {
  await redis.set(PROGRESS_KEY_PREFIX + resource, JSON.stringify(lastKey));
}

export async function clearProgress(resource: string) {
  await redis.del(PROGRESS_KEY_PREFIX + resource);
}

// --- Live Progress ---
export async function setLiveProgress(resource: string, progress: any) {
  await redis.set(PROGRESS_KEY_PREFIX + resource + ':live', JSON.stringify(progress));
}

export async function getLiveProgress(resource: string) {
  const data = await redis.get(PROGRESS_KEY_PREFIX + resource + ':live');
  return data ? JSON.parse(data) : null;
}

export async function getAllLiveProgress(resources: string[]) {
  const result: Record<string, any> = {};
  for (const resource of resources) {
    result[resource] = await getLiveProgress(resource);
  }
  return result;
} 