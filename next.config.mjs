/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features if needed
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
    
    // Images configuration for Firebase storage
    images: {
        domains: [
            'lh3.googleusercontent.com', // For Google profile images
            'firebasestorage.googleapis.com' // For Firebase storage
        ]
    },

    // Environment variables that will be exposed to the browser
    env: {
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        MONGODB_URI: process.env.MONGODB_URI
    }
};

export default nextConfig;
