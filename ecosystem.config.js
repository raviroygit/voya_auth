module.exports = {
  apps: [
    {
      name: "Voya Auth Server", // Application name
      script: "npm", // Run script using npm
      args: "start", // Runs "npm start"
      interpreter: "none", // No additional interpreter needed
      instances: "max", // Use all available CPU cores
      exec_mode: "cluster", // Enable cluster mode for load balancing

      watch: false, // Disable watching for changes (use pm2 restart instead)
      autorestart: true, // Restart the app if it crashes
      max_memory_restart: "1G", // Restart if memory usage exceeds 1GB

      env: {
        NODE_ENV: "development",
        PORT: 8000,
        LOG_LEVEL: "debug",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8001,
        LOG_LEVEL: "info",
      },

      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
    },
  ],
};
