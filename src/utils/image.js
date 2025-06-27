/**
 * 图片处理工具
 */

// 图片服务器基础路径
const IMAGE_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:20001'  // 开发环境，和后端API同端口
  : 'http://localhost:20001'  // 生产环境，实际部署时需要修改为真实域名

// 可能的图片访问路径前缀
const IMAGE_PATH_PREFIXES = [
  '',           // 直接路径
  '/api',       // API路径
  '/file',      // 文件路径  
  '/upload',    // 上传路径
  '/resource'   // 资源路径
]

/**
 * 处理图片URL，确保图片能正确显示
 * @param {string} imageUrl 原始图片URL
 * @returns {string} 处理后的完整图片URL
 */
export function formatImageUrl(imageUrl) {
  if (!imageUrl) {
    console.warn('formatImageUrl: 图片URL为空')
    return ''
  }
  
  console.log('formatImageUrl 原始URL:', imageUrl)
  
  // 如果已经是完整的URL（包含http/https），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('formatImageUrl 完整URL，直接返回:', imageUrl)
    return imageUrl
  }
  
  // 如果是相对路径，添加基础路径
  if (imageUrl.startsWith('/')) {
    const result = IMAGE_BASE_URL + imageUrl
    console.log('formatImageUrl 相对路径处理结果:', result)
    return result
  }
  
  // 如果是crmebimage开头的路径，尝试多种可能的路径前缀
  if (imageUrl.startsWith('crmebimage')) {
    // 首先尝试最常见的路径：直接加到根路径下
    const result = IMAGE_BASE_URL + '/' + imageUrl
    console.log('formatImageUrl crmebimage路径处理结果:', result)
    return result
  }
  
  // 其他情况也添加基础路径
  const result = IMAGE_BASE_URL + '/' + imageUrl
  console.log('formatImageUrl 其他情况处理结果:', result)
  return result
}

/**
 * 获取默认图片
 * @param {string} type 图片类型 (banner, product, avatar等)
 * @returns {string} 默认图片URL
 */
export function getDefaultImage(type = 'default') {
  const defaultImages = {
    banner: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7ovabmkq3lm748L3RleHQ+Cjwvc3ZnPgo=',
    product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7llYblk4Hlm748L3RleHQ+Cjwvc3ZnPgo=',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCI+5aS05YOP5Zu+PC90ZXh0Pgo8L3N2Zz4K',
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7pu5jorq3lm74=</svg>'
  }
  
  return defaultImages[type] || defaultImages.default
}

/**
 * 获取多种可能的图片URL列表
 * @param {string} imageUrl 原始图片URL
 * @returns {Array} 可能的图片URL数组
 */
export function getPossibleImageUrls(imageUrl) {
  if (!imageUrl) return []
  
  const urls = []
  
  // 如果是完整URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    urls.push(imageUrl)
    return urls
  }
  
  // 对于crmebimage路径，生成多种可能的URL
  if (imageUrl.startsWith('crmebimage')) {
    IMAGE_PATH_PREFIXES.forEach(prefix => {
      urls.push(IMAGE_BASE_URL + prefix + '/' + imageUrl)
    })
  } else {
    // 其他路径
    IMAGE_PATH_PREFIXES.forEach(prefix => {
      const url = imageUrl.startsWith('/') 
        ? IMAGE_BASE_URL + prefix + imageUrl 
        : IMAGE_BASE_URL + prefix + '/' + imageUrl
      urls.push(url)
    })
  }
  
  return urls
} 