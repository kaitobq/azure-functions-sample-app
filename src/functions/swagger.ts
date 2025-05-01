import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import swaggerJsdoc from "swagger-jsdoc"
import { config } from "../config/env"

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Azure Functions API",
      version: "1.0.0",
      description: "Azure Functions API Documentation",
    },
    servers: [
      {
        url: "http://localhost:7071",
        description: "Local development server",
      },
    ],
  },
  apis: ["./src/functions/**/*.ts"],
}

const swaggerSpec = swaggerJsdoc(options)

const USERNAME = process.env.SWAGGER_BASIC_AUTH_USERNAME
const PASSWORD = process.env.SWAGGER_BASIC_AUTH_PASSWORD

export const swaggerUI = app.http("swagger", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (
    request: HttpRequest,
    _context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (config.appEnv !== "development") {
      return {
        status: 404,
      }
    }

    // Basic認証ヘッダーのチェック
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Swagger UI"',
        },
        body: "Unauthorized",
      }
    }

    // Base64デコードして認証情報を取得
    const base64Credentials = authHeader.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii",
    )
    const [username, password] = credentials.split(":")

    // 認証情報の検証
    if (username !== USERNAME || password !== PASSWORD) {
      return {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Swagger UI"',
        },
        body: "Unauthorized",
      }
    }

    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SwaggerUI" />
        <title>SwaggerUI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              spec: ${JSON.stringify(swaggerSpec)},
              dom_id: '#swagger-ui',
              layout: 'BaseLayout',
              deepLinking: true,
              showExtensions: true,
              showCommonExtensions: true,
            });
          };
        </script>
      </body>
      </html>
    `

    return {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: html,
    }
  },
})
