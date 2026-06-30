/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Upload dokumen LHEK lewat Server Action — naikkan dari default 1 MB.
    serverActions: { bodySizeLimit: "10mb" },
  },
}
export default nextConfig
