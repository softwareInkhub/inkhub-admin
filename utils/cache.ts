export async function fetchCacheStats(tableName: string) {
  try {
    // Simulate API call to fetch cache statistics
    // In a real implementation, this would call your backend API
    const response = await fetch(`/api/cache/stats/${tableName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cache stats for ${tableName}`);
    }

    const data = await response.json();
    return {
      totalKeys: data.totalKeys || 0,
      cacheSize: data.cacheSize || 0,
      lastUpdated: data.lastUpdated || null,
      status: data.status || 'unknown',
    };
  } catch (error) {
    // For demo purposes, return mock data
    console.warn(`Mock cache stats for ${tableName}:`, error);
    return {
      totalKeys: Math.floor(Math.random() * 1000) + 100,
      cacheSize: Math.floor(Math.random() * 50) + 10,
      lastUpdated: new Date().toISOString(),
      status: 'active',
    };
  }
}

export async function fetchAllChunks(endpoint: string) {
  try {
    // Simulate API call to fetch all data chunks
    const response = await fetch(`/api/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${endpoint}`);
    }

    const data = await response.json();
    return data.items || data || [];
  } catch (error) {
    // For demo purposes, return mock data
    console.warn(`Mock data for ${endpoint}:`, error);
    return [];
  }
}
