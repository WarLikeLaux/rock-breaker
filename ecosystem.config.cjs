module.exports = {
  apps: [
    {
      name: 'vite-dev',
      script: './scripts/start-dev.sh',
      cwd: './',
      interpreter: 'bash',
      watch: false,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
