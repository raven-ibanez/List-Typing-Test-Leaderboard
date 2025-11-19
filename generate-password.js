const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Admin Password Hash Generator\n');
console.log('This script will generate a secure bcrypt hash for your admin password.\n');

rl.question('Enter your new admin password: ', (password) => {
  if (!password || password.trim().length === 0) {
    console.log('❌ Password cannot be empty!');
    rl.close();
    return;
  }
  
  // Generate hash with 10 salt rounds
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('❌ Error generating hash:', err);
      rl.close();
      return;
    }
    
    console.log('\n✅ Password hash generated successfully!\n');
    console.log('Add this to your .env file or server.js:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
    console.log('Or set it as an environment variable:\n');
    console.log(`set ADMIN_PASSWORD_HASH=${hash}\n`);
    console.log('⚠️  Keep this hash secure and never commit it to version control!\n');
    
    rl.close();
  });
});

