declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'development' | 'production' | 'test'
      DEBUG_NAME: string
      PORT: string
      RUN_BATCH_SCHEDULE: 'Y' | 'N'
    }
  }
}

export {}
