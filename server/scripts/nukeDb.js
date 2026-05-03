const mongoose = require('mongoose');
require('dotenv').config();

const nuke = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      console.log(`Dropping collection: ${collection.collectionName}`);
      await collection.drop();
    }

    console.log('Database Nuked! Everything is cleared.');
    process.exit(0);
  } catch (err) {
    console.error('Error nuking DB:', err.message);
    process.exit(1);
  }
};

nuke();
