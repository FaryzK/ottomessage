/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
    
    images: {
        domains: [
            'lh3.googleusercontent.com',
            'firebasestorage.googleapis.com'
        ]
    },

    env: {
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        MONGODB_URI: process.env.MONGODB_URI
    },

    webpack: (config, { isServer }) => {
        // Handle server-side packages
        if (isServer) {
            config.externals = [...config.externals,
                'puppeteer-extra',
                'puppeteer-extra-plugin-stealth',
                'chrome-aws-lambda',
                'node-gyp'
            ];
        } else {
            // Client-side fallbacks
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                canvas: false,
                encoding: false,
                'utf-8-validate': false,
                'bufferutil': false
            };
        }

        // Add rules to handle different file types
        config.module.rules.push(
            {
                test: /\.cs$/,
                use: 'ignore-loader'
            },
            {
                test: /\.node$/,
                use: 'ignore-loader'
            }
        );

        // Ignore warnings from these modules
        config.ignoreWarnings = [
            { module: /node_modules\/puppeteer-extra/ },
            { module: /node_modules\/clone-deep/ },
            { module: /node_modules\/merge-deep/ },
            { module: /node_modules\/venom-bot/ },
            { module: /node_modules\/node-gyp/ }
        ];

        return config;
    }
};

export default nextConfig;
