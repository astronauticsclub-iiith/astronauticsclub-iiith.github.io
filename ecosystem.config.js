module.exports = {
  apps: [
    {
      name: "astronautics",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 80",
      cwd: "/root/astronauticsclub-iiith.github.io",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
