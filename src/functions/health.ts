import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: アプリケーションのヘルスチェック
 *     description: アプリケーションの状態を確認するためのエンドポイント
 *     responses:
 *       200:
 *         description: アプリケーションが正常に動作中
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
export const healthCheck = app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    context.log("Health check function processed a request.")

    return {
      status: 200,
      jsonBody: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
      },
    }
  },
})
