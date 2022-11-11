module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["**/tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "none", // to demonstrate Netflify functions
      },
    ],
    // Makes it harder to accidentally fire off a promise without waiting for it.
    "@typescript-eslint/no-floating-promises": "error",
  },
  ignorePatterns: ["node_modules", "dist", "*.js", "*.jsx"],
};
