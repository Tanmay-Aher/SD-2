import bcrypt from "bcrypt";

async function run() {
  const password = "Tanmay123"; // 👈 your NEW password
  const hash = await bcrypt.hash(password, 10);
  console.log("NEW HASH:", hash);
}

run();