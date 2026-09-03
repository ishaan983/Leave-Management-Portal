/**
 * One-off utility to grant administrator rights to an existing account.
 *
 * Usage:   node scripts/make-admin.js someone@example.com
 *
 * The account must already exist — register through the normal /register
 * page first, then run this to change its role.
 */
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user');

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.error(`No account found for ${email}. Register it first, then re-run.`);
  } else {
    console.log(`${user.name} <${user.email}> is now an admin.`);
    console.log('Log out and log back in so the new role is issued in your token.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});