require("dotenv").config();

const nextConfig = {
  reactStrictMode: true,
  env: {
    IPFS_PROJECT_ID: process.env.IPFS_PROJECT_ID,
    IPFS_PROJECT_SECRET: process.env.IPFS_PROJECT_SECRET,
    PROJECT_ID: process.env.PROJECT_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
  },
};

module.exports = nextConfig;
