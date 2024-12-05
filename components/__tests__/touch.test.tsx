import { renderHook, act } from "@testing-library/react";
import { useTouchPointerType } from "../touch";

describe("useTouchPointerType", () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns false when pointer type is not coarse", () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => useTouchPointerType());
    expect(result.current).toBe(false);
  });

  it("returns true when pointer type is coarse", () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => useTouchPointerType());
    expect(result.current).toBe(true);
  });

  it("updates state when pointer type changes", () => {
    let matches = false;

    const addEventListenerMock = jest.fn((_, callback) => {
      // Simulate the change event
      callback({ matches: false });
    });

    const removeEventListenerMock = jest.fn();

    matchMediaMock.mockReturnValue({
      matches,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useTouchPointerType());

    // Initial state
    expect(result.current).toBe(false);

    // Trigger the change event
    act(() => {
      matches = true; // Change the pointer type
      addEventListenerMock.mock.calls[0][1]({ matches });
    });

    // Verify updated state
    expect(result.current).toBe(true);
  });
});
