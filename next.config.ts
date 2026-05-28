import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = "schedule";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true
  },
  basePath: isGitHubPages ? `/${repositoryName}` : undefined,
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : undefined,
  trailingSlash: true
};

export default nextConfig;
