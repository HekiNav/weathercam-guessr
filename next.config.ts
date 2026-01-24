
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();


const nextConfig = {
	/* config options here */
	allowedDevOrigins: ["test.hekinav.dev"]
};

export default nextConfig;


