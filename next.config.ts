import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
	/* config options here */
};

export default nextConfig;
