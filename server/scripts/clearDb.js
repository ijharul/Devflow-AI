const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const clearDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI not found in .env');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      console.log(`Clearing collection: ${collection.collectionName}...`);
      await collection.deleteMany({});
    }

    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err.message);
    process.exit(1);
  }
};

clearDatabase();
