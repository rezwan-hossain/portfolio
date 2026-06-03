module.exports = {
  apps: [
    {
      name: "nextjs-app",
      cwd: "/var/www/myapp/portfolio",

      script: "./node_modules/next/dist/bin/next",
      args: "start",

      instances: 2,
      exec_mode: "cluster",

      autorestart: true,
      watch: false,

      max_memory_restart: "500M",
      restart_delay: 5000,

      out_file: "/var/www/myapp/logs/output.log",
      error_file: "/var/www/myapp/logs/error.log",
      merge_logs: true,
      time: true,

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
