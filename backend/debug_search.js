const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const KnowledgeBase = require('./models/KnowledgeBase');
const { generateEmbedding, cosineSimilarity } = require('./services/aiProvider');

async function debugSearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const message = "tell about company";
    const language = "en";

    console.log(`Generating embedding for: "${message}"...`);
    const questionEmbedding = await generateEmbedding(message);
    console.log(`Question Embedding Length: ${questionEmbedding.length}`);

    const candidates = await KnowledgeBase.find({ language }).lean();
    console.log(`Found ${candidates.length} candidates for language: ${language}`);

    const scored = candidates.map((doc) => ({
      title: doc.title,
      sourceModel: doc.sourceModel,
      score: cosineSimilarity(questionEmbedding, doc.embedding),
      vectorLen: doc.embedding.length
    }));

    console.log('Results (all candidates):');
    scored.forEach(s => {
      console.log(`- [${s.sourceModel}] ${s.title}: score=${s.score.toFixed(4)} (vectorLen=${s.vectorLen})`);
    });

    const THRESHOLD = 0.3;
    const top = scored.filter(s => s.score > THRESHOLD).sort((a,b) => b.score - a.score);

    console.log(`\nFound ${top.length} chunks above threshold ${THRESHOLD}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugSearch();
