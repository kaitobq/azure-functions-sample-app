import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions"
import { app } from "@azure/functions"
import * as swaggerJsdoc from "swagger-jsdoc"

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
        url: `http://localhost:7071`,
        description: "Local development server",
      },
    ],
  },
  apis: ["./src/functions/**/*.ts"],
}

const swaggerSpec = swaggerJsdoc(options)

export const swaggerUI = app.http("swagger", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (
    _request: HttpRequest,
    _context: InvocationContext,
  ): Promise<HttpResponseInit> => {
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
