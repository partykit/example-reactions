/** @type {import('next').NextConfig} */
const nextConfig = () => {
  const rewrites = async () => [
    {
      source: "/partykit/:path*",
      //destination: "http://localhost:1999/:path*",
      destination: "https://example-reactions.jevakallio.partykit.dev/:path*",
    },
  ];

  return {
    rewrites,
  };
};

module.exports = nextConfig;
