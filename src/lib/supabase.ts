import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if environment variables are set and valid
const isConfigured = supabaseUrl && supabaseKey && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseKey !== 'your_supabase_anon_key_here'

if (!isConfigured) {
  console.warn('⚠️ Supabase environment variables not configured. Using mock client.')
  console.warn('Please update your .env.local file with actual Supabase credentials.')
}

// Logging configuration
const ENABLE_LOGGING = process.env.NODE_ENV === 'development' || process.env.SUPABASE_LOGGING === 'true'

// Create a proxy to intercept and log all method calls
const createLoggingProxy = (client: any, tableName?: string, operation?: string) => {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const originalMethod = target[prop]
      
      if (typeof originalMethod === 'function') {
        return function (...args: any[]) {
          const result = originalMethod.apply(target, args)
          
          // Log database operations
          if (ENABLE_LOGGING && ['select', 'insert', 'update', 'delete', 'upsert'].includes(String(prop))) {
            const startTime = Date.now()
            console.group(`🔍 Supabase Query: ${tableName || 'unknown'}.${String(prop)}`)
            console.log('📊 Arguments:', args)
            console.log('⏰ Timestamp:', new Date().toISOString())
            
            // If result has a promise-like structure, log when it completes
            if (result && typeof result.then === 'function') {
              result
                .then((data: any) => {
                  const duration = Date.now() - startTime
                  console.log('✅ Success:', {
                    data: data.data,
                    count: data.data?.length,
                    error: data.error,
                    duration: `${duration}ms`
                  })
                  console.groupEnd()
                  return data
                })
                .catch((error: any) => {
                  const duration = Date.now() - startTime
                  console.error('❌ Error:', {
                    error,
                    duration: `${duration}ms`
                  })
                  console.groupEnd()
                  throw error
                })
            } else {
              console.groupEnd()
            }
          }
          
          // Log storage operations
          if (ENABLE_LOGGING && ['upload', 'remove', 'move'].includes(String(prop))) {
            console.group(`📁 Supabase Storage: ${operation || 'unknown'}.${String(prop)}`)
            console.log('📊 Arguments:', args)
            console.log('⏰ Timestamp:', new Date().toISOString())
            
            if (result && typeof result.then === 'function') {
              result
                .then((data: any) => {
                  console.log('✅ Storage Success:', data)
                  console.groupEnd()
                  return data
                })
                .catch((error: any) => {
                  console.error('❌ Storage Error:', error)
                  console.groupEnd()
                  throw error
                })
            } else {
              console.groupEnd()
            }
          }
          
          // For chaining methods, return a new proxy
          if (result && typeof result === 'object' && result !== target) {
            return createLoggingProxy(result, tableName, operation)
          }
          
          return result
        }
      }
      
      return originalMethod
    }
  })
}

// Create mock client for development when credentials aren't set
const mockClient = {
  from: (tableName: string) => {
    const mockQuery = {
      select: (...args: any[]) => {
        if (ENABLE_LOGGING) {
          console.log(`🎭 Mock Query: ${tableName}.select`, args)
        }
        return Promise.resolve({ data: [], error: null })
      },
      insert: (...args: any[]) => {
        if (ENABLE_LOGGING) {
          console.log(`🎭 Mock Query: ${tableName}.insert`, args)
        }
        return Promise.resolve({ data: [], error: null })
      },
      update: (...args: any[]) => {
        if (ENABLE_LOGGING) {
          console.log(`🎭 Mock Query: ${tableName}.update`, args)
        }
        return Promise.resolve({ data: [], error: null })
      },
      delete: (...args: any[]) => {
        if (ENABLE_LOGGING) {
          console.log(`🎭 Mock Query: ${tableName}.delete`, args)
        }
        return Promise.resolve({ data: [], error: null })
      },
      eq: () => mockQuery,
      neq: () => mockQuery,
      gt: () => mockQuery,
      gte: () => mockQuery,
      lt: () => mockQuery,
      lte: () => mockQuery,
      like: () => mockQuery,
      ilike: () => mockQuery,
      in: () => mockQuery,
      order: () => mockQuery,
      limit: () => mockQuery,
      range: () => mockQuery,
      single: () => mockQuery,
      maybeSingle: () => mockQuery,
    }
    return mockQuery
  },
  storage: {
    from: (bucket: string) => ({
      upload: (...args: any[]) => {
        if (ENABLE_LOGGING) {
          console.log(`🎭 Mock Storage: ${bucket}.upload`, args)
        }
        return Promise.resolve({ error: new Error('Supabase not configured') })
      },
      remove: (...args: any[]) => {
        if (ENABLE_LOGGING) {
          console.log(`🎭 Mock Storage: ${bucket}.remove`, args)
        }
        return Promise.resolve({ error: new Error('Supabase not configured') })
      },
      getPublicUrl: (path: string) => {
        if (ENABLE_LOGGING) {
          console.log(`🎭 Mock Storage: ${bucket}.getPublicUrl`, path)
        }
        return { data: { publicUrl: '/placeholder-image.jpg' } }
      }
    })
  }
} as any

// Create the real Supabase client with logging
const createLoggedSupabaseClient = () => {
  const baseClient = createClient<Database>(supabaseUrl, supabaseKey)
  
  if (!ENABLE_LOGGING) {
    return baseClient
  }
  
  // Override the from method to capture table name and add logging
  const originalFrom = baseClient.from.bind(baseClient)
  baseClient.from = function(tableName: string) {
    const query = originalFrom(tableName)
    return createLoggingProxy(query, tableName)
  }
  
  // Override storage methods to add logging
  const originalStorage = baseClient.storage
  const originalFromMethod = originalStorage.from.bind(originalStorage)
  originalStorage.from = function(bucket: string) {
    const storageApi = originalFromMethod(bucket)
    return createLoggingProxy(storageApi, undefined, `storage.${bucket}`)
  }
  
  return baseClient
}

export const supabase = isConfigured 
  ? createLoggedSupabaseClient()
  : mockClient

export default supabase