/**
 * Example routes suite with error scenarios
 */
module.exports = {
  id: "errors",
  routes: {
    "get-users": "error",
    "get-user-by-id": "not-found",
  },
};
