const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Language = require('./models/Language');
const NewsletterIssue = require('./models/NewsletterIssue');

const seedNewsletters = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const enLang = await Language.findOne({ code: 'EN' });
    if (!enLang) {
      console.log('English language not found');
      process.exit(1);
    }

    // Update existing newsletters with dummy images and authors
    const dummyImages = [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-2581f3e995ce?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585829365294-bb8c6f045b88?q=80&w=2070&auto=format&fit=crop'
    ];

    const issues = await NewsletterIssue.find();
    for (let i = 0; i < issues.length; i++) {
      issues[i].featuredImage = dummyImages[i % dummyImages.length];
      issues[i].author = 'InnoXtract Content Team';
      await issues[i].save();
    }

    console.log(`Updated ${issues.length} newsletter issues with images and authors`);

    // Add one more issue if we have fewer than 2
    if (issues.length < 3) {
      await NewsletterIssue.create({
        title: 'Quarterly Tech Roundup - April 2026',
        description: 'A comprehensive look at the technological advancements and strategic partnerships formed in the first quarter of 2026.',
        featuredImage: dummyImages[2],
        author: 'Technical Division',
        issueDate: new Date('2026-04-01'),
        status: 'sent',
        languageId: enLang._id,
        documents: [
          {
            name: 'Q1_2026_Tech_Roundup.pdf',
            url: '/uploads/docs/sample.pdf',
            size: 4500000,
            mimeType: 'application/pdf'
          }
        ]
      });
      console.log('Added a new newsletter issue');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedNewsletters();
