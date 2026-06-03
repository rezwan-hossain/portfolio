module.exports = {
  apps: [
    {
      name: "nextjs-app",
      cwd: "/var/www/myapp/portfolio",

      script: "npm",
      args: "start",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,

      max_memory_restart: "700M",
      restart_delay: 5000,

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NODE_OPTIONS: "--max-old-space-size=1536",
      },

      out_file: "/var/www/myapp/logs/output.log",
      error_file: "/var/www/myapp/logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
