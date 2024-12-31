/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignore .cs files
    config.resolve.extensions = config.resolve.extensions.filter(ext => ext !== '.cs');
    
    // Ignore node-gyp files
    config.externals = [...(config.externals || []), 'node-gyp', 'venom-bot'];

    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;
