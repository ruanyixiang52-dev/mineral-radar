/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.EXPORT ? { output: "export", distDir: "dist", images: { unoptimized: true } } : {}),
};

export default nextConfig;
