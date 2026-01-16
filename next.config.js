/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Serve static HTML files from public directory
    async rewrites() {
        return [
            {
                source: '/pages/:path*',
                destination: '/pages/:path*',
            },
        ];
    },
    // Enable standalone output for Vercel
    output: 'standalone',
};

module.exports = nextConfig;
