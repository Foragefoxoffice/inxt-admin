const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Country = require('./models/Country');
const User = require('./models/User');
const Blog = require('./models/Blog');
const News = require('./models/News');
const Career = require('./models/Career');
const Newsletter = require('./models/Newsletter');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Country.deleteMany({}),
      User.deleteMany({}),
      Blog.deleteMany({}),
      News.deleteMany({}),
      Career.deleteMany({}),
      Newsletter.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create countries
    const countries = await Country.insertMany([
      { name: 'United States', code: 'USA', isActive: true },
      { name: 'United Kingdom', code: 'GBR', isActive: true },
      { name: 'India', code: 'IND', isActive: true },
      { name: 'Australia', code: 'AUS', isActive: true },
      { name: 'Canada', code: 'CAN', isActive: true }
    ]);
    console.log('✅ Countries seeded:', countries.length);

    const usa = countries.find(c => c.code === 'USA');
    const uk = countries.find(c => c.code === 'GBR');
    const ind = countries.find(c => c.code === 'IND');

    // Create admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@cms.com',
      password: 'admin123',
      role: 'admin'
    });

    const editor = await User.create({
      name: 'Content Editor',
      email: 'editor@cms.com',
      password: 'editor123',
      role: 'editor'
    });
    console.log('✅ Users seeded');

    // Seed sample blogs
    await Blog.insertMany([
      {
        title: 'Getting Started with Multi-Country CMS',
        slug: 'getting-started-multi-country-cms',
        content: '<p>Welcome to our multi-country content management system. This platform allows you to manage content across multiple regions seamlessly.</p>',
        category: 'Technology',
        status: 'published',
        author: 'Super Admin',
        countryId: usa._id,
        publishDate: new Date()
      },
      {
        title: 'Best Practices for Global Content Strategy',
        slug: 'best-practices-global-content-strategy',
        content: '<p>Managing content across countries requires a consistent yet localized approach. Here are the best practices our team follows.</p>',
        category: 'Strategy',
        status: 'published',
        author: 'Content Editor',
        countryId: uk._id,
        publishDate: new Date()
      },
      {
        title: 'Digital Transformation in 2026',
        slug: 'digital-transformation-2026',
        content: '<p>The digital landscape continues to evolve rapidly. Here is what businesses need to know about the transformation happening in 2026.</p>',
        category: 'Business',
        status: 'draft',
        author: 'Super Admin',
        countryId: ind._id
      }
    ]);
    console.log('✅ Blogs seeded');

    // Seed sample news
    await News.insertMany([
      {
        title: 'Annual Tech Conference 2026',
        slug: 'annual-tech-conference-2026',
        content: '<p>Join us for our annual technology conference featuring industry leaders and innovators.</p>',
        category: 'event',
        eventDate: new Date('2026-06-15'),
        eventLocation: 'San Francisco, CA',
        status: 'published',
        countryId: usa._id
      },
      {
        title: 'Company Expands to New Markets',
        slug: 'company-expands-new-markets',
        content: '<p>We are excited to announce our expansion into three new international markets this quarter.</p>',
        category: 'news',
        status: 'published',
        countryId: uk._id
      }
    ]);
    console.log('✅ News seeded');

    // Seed sample careers
    const jobs = await Career.insertMany([
      {
        title: 'Senior Full-Stack Developer',
        slug: 'senior-full-stack-developer-usa',
        department: 'Engineering',
        location: 'New York, NY',
        type: 'full-time',
        experience: '5+ years',
        description: '<p>We are looking for an experienced full-stack developer to join our growing team.</p>',
        requirements: ['React', 'Node.js', 'MongoDB', '5+ years experience'],
        benefits: ['Health insurance', 'Remote work', '401k'],
        status: 'open',
        countryId: usa._id
      },
      {
        title: 'Content Marketing Manager',
        slug: 'content-marketing-manager-uk',
        department: 'Marketing',
        location: 'London, UK',
        type: 'full-time',
        experience: '3+ years',
        description: '<p>Lead our content marketing strategy across UK and European markets.</p>',
        status: 'open',
        countryId: uk._id
      }
    ]);
    console.log('✅ Careers seeded');

    // Seed newsletter subscribers
    await Newsletter.insertMany([
      { email: 'user1@example.com', name: 'Alice Johnson', status: 'active', countryId: usa._id },
      { email: 'user2@example.com', name: 'Bob Smith', status: 'active', countryId: usa._id },
      { email: 'user3@example.com', name: 'Charlie Brown', status: 'unsubscribed', countryId: uk._id },
      { email: 'user4@example.com', name: 'Diana Prince', status: 'active', countryId: ind._id },
      { email: 'user5@example.com', name: 'Edward Norton', status: 'active', countryId: uk._id }
    ]);
    console.log('✅ Newsletter subscribers seeded');

    console.log('\n🎉 SEED COMPLETE!');
    console.log('=================');
    console.log('Admin login:  admin@cms.com  /  admin123');
    console.log('Editor login: editor@cms.com /  editor123');
    console.log('=================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
