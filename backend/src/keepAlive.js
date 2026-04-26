import https from 'https';

/**
 * Self-pinging mechanism to prevent Render free tier from sleeping.
 * Render puts services to sleep after 15 minutes of inactivity.
 * This script pings the service every 14 minutes.
 */
export function startKeepAlive() {
  const url = process.env.BACKEND_SELF_URL || 'https://api.bazari.site/api/health';
  
  console.log(`📡 Keep-Alive system started for: ${url}`);

  // Ping every 14 minutes (14 * 60 * 1000 ms)
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`🔔 Keep-alive ping sent. Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`⚠️ Keep-alive ping failed: ${err.message}`);
    });
  }, 14 * 60 * 1000);
}
