import dns from "dns";

// Force Google + Cloudflare DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected");

  const users = await User.find({}, { email: 1, role: 1, _id: 0 });

  console.log(users);

  process.exit();
} catch (err) {
  console.log(err);
  process.exit(1);
}