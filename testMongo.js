require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to Atlas!");
  } catch (err) {
    console.error("❌ Mongo Error:", err.message);
  } finally {
    await client.close();
  }
}

run();