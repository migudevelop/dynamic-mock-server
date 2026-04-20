/**
 * Example route definition for user by ID
 */
module.exports = {
  id: "get-user-by-id",
  url: "/api/users/:id",
  method: "GET",
  responses: [
    {
      id: "success",
      status: 200,
      body: { id: 1, name: "John Doe", email: "john@example.com" },
    },
    {
      id: "not-found",
      status: 404,
      body: { error: "User not found" },
    },
  ],
};
