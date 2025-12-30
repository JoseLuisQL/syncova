/**
 * Setup file for Jest tests
 * This file runs before each test file
 */

// Increase timeout for async tests
jest.setTimeout(10000);

// Mock console.log/error to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clean up after all tests
afterAll(async () => {
  // Add any cleanup logic here
});
