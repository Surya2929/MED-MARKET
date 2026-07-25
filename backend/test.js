import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://medmarketuser:Abc123456@cluster0.qydtgly.mongodb.net/medmarket?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

try {
  await client.connect();
  console.log("✅ Connected");
} catch (err) {
  console.error(err);
} finally {
  await client.close();
}