/**
 * Example route definition for user by ID
 */
module.exports = {
  id: "get-user-by-id",
  url: "/api/users/:id",
  method: "GET",
  delay: 100,
  responses: [
    {
      id: "success",
      type: "json",
      options: {
        status: 200,
        body: { id: 1, name: "John Doe", email: "john@example.com" },
      },
    },
    {
      id: "not-found",
      type: "json",
      options: {
        status: 404,
        body: { error: "User not found" },
      },
    },
  ],
};
