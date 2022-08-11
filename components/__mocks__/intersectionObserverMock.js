/**
 * This oddly seems needed to avoid some `fireEvent` failures (but not all of them).
 */

// https://stackoverflow.com/questions/57008341/jest-testing-react-component-with-react-intersection-observer#answer-61493088
global.IntersectionObserver = class IntersectionObserver {
  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};
