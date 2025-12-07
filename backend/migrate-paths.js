const mongoose = require('mongoose');
require('dotenv').config();

const updatePaths = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Find all users with /app/ in their profile_image path
    const users = await db.collection('users').find({
      profile_image: { $regex: '^/app/' }
    }).toArray();

    console.log(`Found ${users.length} users with /app/ paths`);

    // Update each user
    for (const user of users) {
      const oldPath = user.profile_image;
      const newPath = oldPath.replace('/app/', '');
      
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { profile_image: newPath } }
      );
      
      console.log(`Updated: ${oldPath} -> ${newPath}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updatePaths();
