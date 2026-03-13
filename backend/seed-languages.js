const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Language = require('./models/Language');

dotenv.config();

const languages = [
  { name: 'English', code: 'EN', isActive: true },
  { name: 'Thai', code: 'TH', isActive: true },
  { name: 'Hindi', code: 'HI', isActive: true },
  { name: 'Spanish', code: 'ES', isActive: true },
  { name: 'French', code: 'FR', isActive: true },
  { name: 'Japanese', code: 'JA', isActive: true }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Wipe old countries if any (optional, but good for clean start)
    // await mongoose.connection.collection('countries').drop().catch(() => {});

    for (const l of languages) {
      const exists = await Language.findOne({ code: l.code });
      if (!exists) {
        await Language.create(l);
        console.log(`Created language: ${l.name}`);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
