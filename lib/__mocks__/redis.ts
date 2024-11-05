// __mocks__/redis.ts

/**
 * Mock the "redis" module.
 */
export const createClient = jest.fn().mockReturnValue({
  on: jest.fn(),
  connect: jest.fn(),
  get: jest.fn().mockImplementation(() => {
    return Promise.resolve(null);
  }),
  set: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
});
