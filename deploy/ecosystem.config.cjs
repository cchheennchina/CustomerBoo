const path = require("path");

const appDir = path.join(__dirname, "..");
const port = process.env.PORT || 3000;

module.exports = {
  apps: [
    {
      name: "customer-butler",
      cwd: appDir,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${port}`,
      env: {
        NODE_ENV: "production",
        PORT: String(port),
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      error_file: path.join(appDir, "logs/pm2-error.log"),
      out_file: path.join(appDir, "logs/pm2-out.log"),
      merge_logs: true,
      time: true,
    },
  ],
};
