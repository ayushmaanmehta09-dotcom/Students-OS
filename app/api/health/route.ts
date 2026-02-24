import { withErrorHandling } from "@/lib/api-route";
import { json } from "@/lib/response";

export const GET = withErrorHandling(async () => {
  return json({
    ok: true,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? "0.1.0"
  });
});
