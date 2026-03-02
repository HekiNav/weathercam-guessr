
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();


const nextConfig = {
	/* config options here */
	allowedDevOrigins: ["test.hekinav.dev"],
	images: {
		remotePatterns: [
			{
				hostname: "weathercam.digitraffic.fi"
			}
		]
	}
};

export default nextConfig;


