import mongoose from "mongoose";

// Cached across hot reloads in dev and across invocations of a warm
// serverless function in production.
const globalForMongoose = globalThis as unknown as {
    mongooseConn?: Promise<typeof mongoose>;
};

export function connectDb(): Promise<typeof mongoose> {
    if (!globalForMongoose.mongooseConn) {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not set");
        }
        globalForMongoose.mongooseConn = mongoose
            .connect(uri, { serverSelectionTimeoutMS: 5000 })
            .catch((err) => {
                // Allow the next request to retry instead of caching a rejection.
                globalForMongoose.mongooseConn = undefined;
                throw err;
            });
    }
    return globalForMongoose.mongooseConn;
}
