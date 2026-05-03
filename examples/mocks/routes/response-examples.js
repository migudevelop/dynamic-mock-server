/**
 * Example routes using different response handlers
 */

// Route with JSON responses
module.exports = [
  {
    id: "get-products",
    url: "/api/products",
    method: "GET",
    responses: [
      {
        id: "success",
        status: 200,
        body: [
          { id: 1, name: "Product 1", price: 99.99 },
          { id: 2, name: "Product 2", price: 149.99 },
        ],
      },
      {
        id: "empty",
        status: 200,
        body: [],
      },
    ],
  },

  // Route with Text responses
  {
    id: "get-health",
    url: "/health",
    method: "GET",
    responses: [
      {
        id: "ok",
        status: 200,
        body: "OK",
        headers: { "Content-Type": "text/plain" },
      },
      {
        id: "error",
        status: 503,
        body: "Service Unavailable",
        headers: { "Content-Type": "text/plain" },
      },
    ],
  },

  // Route with Status-only responses
  {
    id: "delete-product",
    url: "/api/products/:id",
    method: "DELETE",
    responses: [
      {
        id: "success",
        status: 204,
      },
      {
        id: "not-found",
        status: 404,
      },
    ],
  },

  // Route with file-like responses (served via handler)
  {
    id: "get-document",
    url: "/api/documents/:id",
    method: "GET",
    responses: [
      {
        id: "pdf",
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      },
      {
        id: "image",
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      },
    ],
  },

  // Route with dynamic handler responses
  {
    id: "custom-logic",
    url: "/api/custom",
    method: "POST",
    responses: [
      {
        id: "dynamic",
        handler: async (request, reply) => {
          const result = {
            received: request.body,
            timestamp: new Date().toISOString(),
            echo: request.query.echo || "no echo",
          };
          reply.status(200).send(result);
        },
      },
      {
        id: "delayed",
        delay: 2000,
        status: 200,
        body: { message: "This response was delayed by 2 seconds" },
      },
    ],
  },
];
