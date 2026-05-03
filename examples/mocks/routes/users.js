/**
 * Example route definition
 */
module.exports = {
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    {
      id: "success",
      status: 200,
      body: [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
      ],
    },
    {
      id: "empty",
      status: 200,
      body: [],
    },
    {
      id: "error",
      status: 500,
      body: { error: "Internal server error" },
    },
  ],
};
