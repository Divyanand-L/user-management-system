const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://divyanandlodha0:gBuI8YYq1eEkH3N1@cluster0.9lqpp.mongodb.net/user_management?retryWrites=true&w=majority&appName=Cluster0';

// Indian states and their major cities
const locations = [
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'] },
  { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { state: 'Delhi', cities: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'] },
  { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'] }
];

// Sample first names
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Anvi', 'Kavya', 'Anika', 'Pari', 'Sara', 'Myra',
  'Rohan', 'Karan', 'Rahul', 'Amit', 'Vikram', 'Ravi', 'Suresh', 'Prakash', 'Anil', 'Rajesh',
  'Priya', 'Neha', 'Pooja', 'Anjali', 'Sneha', 'Kavita', 'Ritu', 'Swati', 'Deepika', 'Shweta'
];

// Sample last names
const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Nair', 'Rao', 'Joshi',
  'Mehta', 'Desai', 'Agarwal', 'Kulkarni', 'Iyer', 'Menon', 'Pillai', 'Shetty', 'Kapoor', 'Malhotra',
  'Chopra', 'Banerjee', 'Das', 'Bose', 'Chatterjee', 'Ghosh', 'Mukherjee', 'Roy', 'Sen', 'Dutta'
];

// Function to download image from URL and save locally
async function downloadImage(url, filename) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const uploadsDir = path.join(__dirname, 'uploads', 'profile-images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    const writer = fs.createWriteStream(filepath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filename));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download image: ${error.message}`);
    return null;
  }
}

// Function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate random phone number
function generatePhoneNumber() {
  const prefix = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85'];
  return `${getRandomElement(prefix)}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

// Function to generate random pincode
function generatePincode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to generate user data
async function generateUserData(index) {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
  const location = getRandomElement(locations);
  const city = getRandomElement(location.cities);
  
  // Use RandomUser.me API for diverse profile images
  const imageUrl = `https://i.pravatar.cc/300?img=${index}`;
  const filename = `profile-${Date.now()}-${index}.jpg`;
  
  console.log(`Downloading image for ${name}...`);
  const downloadedFilename = await downloadImage(imageUrl, filename);
  
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  return {
    name,
    email,
    password: hashedPassword,
    phone: generatePhoneNumber(),
    address: `${Math.floor(Math.random() * 500) + 1}, ${getRandomElement(['MG Road', 'Main Street', 'Park Avenue', 'Station Road', 'Gandhi Nagar', 'Nehru Street'])}`,
    city,
    state: location.state,
    country: 'India',
    pincode: generatePincode(),
    profile_image: downloadedFilename ? `uploads/profile-images/${downloadedFilename}` : null,
    role: index <= 5 ? 'admin' : 'user' // First 5 users will be admins
  };
}

// Main function to populate users
async function populateUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // console.log('Clearing existing users...');
    // await User.deleteMany({});
    // console.log('Existing users cleared.');

    console.log('Generating and inserting 50 users...');
    const users = [];
    
    for (let i = 1; i <= 50; i++) {
      console.log(`\nGenerating user ${i}/50...`);
      const userData = await generateUserData(i);
      users.push(userData);
      
      // Insert in batches of 10 to avoid memory issues
      if (i % 10 === 0) {
        console.log(`Inserting batch of 10 users...`);
        await User.insertMany(users.splice(0, 10));
        console.log(`Batch inserted successfully!`);
      }
    }

    // Insert any remaining users
    if (users.length > 0) {
      console.log(`Inserting final batch of ${users.length} users...`);
      await User.insertMany(users);
      console.log(`Final batch inserted successfully!`);
    }

    console.log('\n✅ Successfully populated 50 users!');
    console.log('📊 Summary:');
    console.log('   - Total users: 50');
    console.log('   - Admins: 5');
    console.log('   - Regular users: 45');
    console.log('   - All users have profile images');
    console.log('   - Default password for all: Password123!');
    console.log('\n🔐 Sample login credentials:');
    const sampleUser = await User.findOne({ role: 'user' });
    const sampleAdmin = await User.findOne({ role: 'admin' });
    if (sampleUser) console.log(`   User: ${sampleUser.email} / Password123!`);
    if (sampleAdmin) console.log(`   Admin: ${sampleAdmin.email} / Password123!`);

  } catch (error) {
    console.error('❌ Error populating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the script
populateUsers();
