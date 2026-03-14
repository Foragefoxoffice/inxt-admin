const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const KnowledgeBase = require('../backend/models/KnowledgeBase');

async function checkKB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const total = await KnowledgeBase.countDocuments();
    console.log(`Total documents in KnowledgeBase: ${total}`);

    const sample = await KnowledgeBase.findOne();
    if (sample) {
      console.log('Sample document:');
      console.log(`- Title: ${sample.title}`);
      console.log(`- SourceModel: ${sample.sourceModel}`);
      console.log(`- Language: ${sample.language}`);
      console.log(`- Embedding Length: ${sample.embedding ? sample.embedding.length : 'N/A'}`);
    } else {
      console.log('No documents found in KnowledgeBase');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkKB();
