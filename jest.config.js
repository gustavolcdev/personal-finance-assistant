// jest.config.js
export default {
  testEnvironment: 'node',
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/?(*.)+(test|spec).js"
  ],
  extensionsToTreatAsEsm: ['.js'],
  testPathIgnorePatterns: [
    "/node_modules/",
  ],
};
