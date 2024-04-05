'use strict'

module.exports = [
  {
    name: 'Image Classification',
    script: './dist/bin/www.js',
    instances: 0,
    exec_mode: 'cluster',
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  },
]
