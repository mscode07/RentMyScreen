import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI. Add it to .env.local or your deployment environment.");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClient() {
  if (!global.mongoClientPromise) {
    global.mongoClientPromise = new MongoClient(uri!, options).connect();
  }

  return global.mongoClientPromise;
}
