const dgram = require('dgram');
const express = require('express');
const cors = require('cors');
const { Meilisearch } = require('meilisearch');
const cron = require('node-cron');

const UDP_PORT = 5005;
const HTTP_PORT = 3001;

// Meilisearch setup
const client = new Meilisearch({
  host: 'http://localhost:7700',
  apiKey: 'mini-elk-master-key',
});
const INDEX_NAME = 'logs';

// Setup Meilisearch index
async function setupMeilisearch() {
  try {
    await client.createIndex(INDEX_NAME, { primaryKey: 'id' });
    const index = client.index(INDEX_NAME);
    await index.updateFilterableAttributes(['level']);
    await index.updateSortableAttributes(['timestamp']);
    console.log(`✅ Meilisearch index '${INDEX_NAME}' is ready.`);
  } catch (error) {
    if (error.code !== 'index_already_exists') {
      console.error('Error setting up Meilisearch:', error);
    } else {
      console.log(`✅ Meilisearch index '${INDEX_NAME}' already exists.`);
    }
  }
}
setupMeilisearch();

// --- UDP INGESTION SERVER ---
const udpServer = dgram.createSocket('udp4');

udpServer.on('error', (err) => {
  console.error(`UDP server error:\n${err.stack}`);
  udpServer.close();
});

udpServer.on('message', async (msg, rinfo) => {
  const logString = msg.toString('utf-8').trim();
  console.log(`Received raw log: ${logString}`);
  
  // Parse unstructured text into JSON using Regex
  // Example: [2026-07-07 11:15:00] ERROR: Auth failed for user_id 402
  const regex = /^\[(.*?)\] (.*?): (.*?) user_id (\d+)/;
  const match = logString.match(regex);
  
  if (match) {
    const logObj = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
      timestamp: new Date(match[1]).toISOString(),
      level: match[2],
      message: match[3],
      userId: parseInt(match[4], 10),
      raw: logString
    };
    
    // Send to Meilisearch
    try {
      await client.index(INDEX_NAME).addDocuments([logObj]);
    } catch (e) {
      console.error("Error inserting to Meilisearch:", e);
    }
  } else {
    console.warn("Failed to parse log line:", logString);
  }
});

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`🚀 UDP Ingestion server listening on ${address.address}:${address.port}`);
});

udpServer.bind(UDP_PORT);


// --- CRON JOB FOR DATA RETENTION (TTL) ---
// Runs every midnight (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
  console.log('Running TTL Cron Job to delete logs older than 7 days...');
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  try {
    const index = client.index(INDEX_NAME);
    
    // Meilisearch does not have direct delete-by-query by date easily without fetching first, 
    // or using filters. Since v1.2, you can use delete documents by filter.
    const filterStr = `timestamp < ${sevenDaysAgo.toISOString()}`;
    const task = await index.deleteDocuments({ filter: filterStr });
    
    console.log(`TTL task scheduled: ${task.taskUid}`);
  } catch (error) {
    console.error('Error running TTL cron job:', error);
  }
});


// --- HTTP API FOR FRONTEND (Optional if frontend talks directly to Meili) ---
const app = express();
app.use(cors());
app.use(express.json());

// We can just expose a route for search config if needed
app.get('/config', (req, res) => {
  res.json({ 
    meilisearchHost: 'http://localhost:7700',
    meilisearchKey: 'mini-elk-master-key'
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`🌐 HTTP API server listening on http://localhost:${HTTP_PORT}`);
});
