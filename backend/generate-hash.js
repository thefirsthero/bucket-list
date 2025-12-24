// Helper script to generate a bcrypt password hash
// Usage: node generate-hash.js yourpassword

const bcrypt = require("bcrypt");

const password = process.argv[2];

if (!password) {
  console.error("Usage: node generate-hash.js yourpassword");
  process.exit(1);
}

bcrypt
  .hash(password, 10)
  .then((hash) => {
    console.log("\nPassword hash generated:");
    console.log(hash);
    console.log("\nUse this hash in your SQL INSERT statement");
  })
  .catch((err) => {
    console.error("Error generating hash:", err);
    process.exit(1);
  });
