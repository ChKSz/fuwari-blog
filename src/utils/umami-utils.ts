// Umami Analytics 工具函数
// 用于获取文章和网站的浏览量数据

// 你的 Umami share URL ID
const UMAMI_SHARE_ID = 'DHrKnEICFrgNDMxE';
const UMAMI_BASE_URL = 'https://us.umami.is';

// 缓存对象，用于存储已获取的数据
const statsCache: Record<string, { data: any; timestamp: number }> = {};

// 缓存过期时间（5分钟）
const CACHE_EXPIRY = 5 * 60 * 1000;

// 获取 Umami 网站 ID 和 token
async function getUmamiAuth() {
  // 检查缓存中是否有有效的认证信息
  const cacheKey = 'umami-auth';
  const cached = statsCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data;
  }
  
  const response = await fetch(`${UMAMI_BASE_URL}/api/share/${UMAMI_SHARE_ID}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Umami auth: ${response.statusText}`);
  }
  const data = await response.json();
  
  // 缓存认证信息
  statsCache[cacheKey] = {
    data: {
      websiteId: data.websiteId,
      token: data.token
    },
    timestamp: Date.now()
  };
  
  return statsCache[cacheKey].data;
}

// 获取指定页面的统计数据
export async function getPageStats(path: string) {
  try {
    // 检查缓存中是否有有效的数据
    const cacheKey = `page-stats-${path}`;
    const cached = statsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data;
    }
    
    const { websiteId, token } = await getUmamiAuth();
    
    // 确保路径以 / 结尾（根据你的配置）
    const normalizedPath = path.endsWith('/') ? path : `${path}/`;
    
    const url = `${UMAMI_BASE_URL}/api/websites/${websiteId}/stats?startAt=0&endAt=${Date.now()}&unit=hour&timezone=Asia/Hong_Kong&url=${encodeURIComponent(normalizedPath)}&compare=false`;
    
    const response = await fetch(url, {
      headers: {
        'x-umami-share-token': token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    const result = {
      pageviews: data.pageviews?.value || 0,
      visits: data.visits?.value || 0
    };
    
    // 缓存结果
    statsCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching page stats:', error);
    // 返回默认值以避免页面崩溃
    return {
      pageviews: 0,
      visits: 0
    };
  }
}

// 获取网站总统计数据
export async function getSiteStats() {
  try {
    // 检查缓存中是否有有效的数据
    const cacheKey = 'site-stats';
    const cached = statsCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data;
    }
    
    const { websiteId, token } = await getUmamiAuth();
    
    const url = `${UMAMI_BASE_URL}/api/websites/${websiteId}/stats?startAt=0&endAt=${Date.now()}&unit=day&timezone=Asia/Hong_Kong&compare=false`;
    
    const response = await fetch(url, {
      headers: {
        'x-umami-share-token': token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch site stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    const result = {
      pageviews: data.pageviews?.value || 0,
      visits: data.visits?.value || 0
    };
    
    // 缓存结果
    statsCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching site stats:', error);
    // 返回默认值以避免页面崩溃
    return {
      pageviews: 0,
      visits: 0
    };
  }
}