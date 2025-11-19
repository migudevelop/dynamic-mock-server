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
        type: "json",
        options: {
          status: 200,
          body: [
            { id: 1, name: "Product 1", price: 99.99 },
            { id: 2, name: "Product 2", price: 149.99 },
          ],
        },
      },
      {
        id: "empty",
        type: "json",
        options: {
          status: 200,
          body: [],
        },
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
        type: "text",
        options: {
          status: 200,
          body: "OK",
          contentType: "text/plain",
        },
      },
      {
        id: "error",
        type: "text",
        options: {
          status: 503,
          body: "Service Unavailable",
          contentType: "text/plain",
        },
      },
    ],
  },

  // Route with Status responses
  {
    id: "delete-product",
    url: "/api/products/:id",
    method: "DELETE",
    responses: [
      {
        id: "success",
        type: "status",
        options: {
          status: 204,
        },
      },
      {
        id: "not-found",
        type: "status",
        options: {
          status: 404,
        },
      },
    ],
  },

  // Route with File responses
  {
    id: "get-document",
    url: "/api/documents/:id",
    method: "GET",
    responses: [
      {
        id: "pdf",
        type: "file",
        options: {
          path: "documents/sample.pdf",
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
          },
        },
      },
      {
        id: "image",
        type: "file",
        options: {
          path: "images/sample.jpg",
          status: 200,
          headers: {
            "Content-Type": "image/jpeg",
          },
        },
      },
    ],
  },

  // Route with Middleware responses
  {
    id: "custom-logic",
    url: "/api/custom",
    method: "POST",
    responses: [
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (context) => {
            // Access request data
            const { body, query, params } = context;

            // Custom logic
            const result = {
              received: body,
              timestamp: new Date().toISOString(),
              echo: query.echo || "no echo",
            };

            // Send response
            context.reply.status(200).send(result);
          },
        },
      },
      {
        id: "delayed",
        type: "middleware",
        options: {
          middleware: async (context) => {
            // Simulate delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            context.reply.status(200).send({
              message: "This response was delayed by 2 seconds",
            });
          },
        },
      },
    ],
  },
];
