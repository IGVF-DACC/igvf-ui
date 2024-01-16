import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import GlobalContext from "../global-context";
import IndexerState from "../indexer-state";
import SessionContext from "../session-context";
import { useTooltip } from "../tooltip";

describe("Test the expanded IndexerState component", () => {
  it("renders the expanded IndexerState component while indexed", async () => {
    const indexerState = {
      indexingCount: 0,
      isIndexing: false,
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(indexerState),
      })
    );

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <IndexerState />
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    const indexerStateBadge = screen.getByTestId("indexer-state-expanded");
    expect(indexerStateBadge).toBeInTheDocument();
    expect(indexerStateBadge).toHaveTextContent("INDEXED");
  });

  it("renders the expanded IndexerState component while indexing", async () => {
    const indexerState = {
      indexingCount: 40_000,
      isIndexing: true,
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(indexerState),
      })
    );

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <IndexerState />
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    const indexerStateBadge = screen.getByTestId("indexer-state-expanded");
    expect(indexerStateBadge).toBeInTheDocument();
    expect(indexerStateBadge).toHaveTextContent(/^INDEXING 40\.0K$/);
  });

  it("renders an indexed badge if the /indexer-state endpoint returns null", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      })
    );

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <IndexerState />
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    const indexerStateBadge = screen.getByTestId("indexer-state-expanded");
    expect(indexerStateBadge).toBeInTheDocument();
    expect(indexerStateBadge).toHaveTextContent(/^INDEXED$/);
  });
});

describe("Test the collapsed IndexerState component", () => {
  it("renders the collapsed IndexerState component while indexed", async () => {
    const indexerState = {
      indexingCount: 0,
      isIndexing: false,
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(indexerState),
      })
    );

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <IndexerState isCollapsed />
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    expect(screen.getByTestId("indexer-state-collapsed")).toBeInTheDocument();
    expect(
      screen.getByTestId("indexer-state-indexed-icon")
    ).toBeInTheDocument();
  });

  it("renders the collapsed IndexerState component while indexing", async () => {
    const indexerState = {
      indexingCount: 1_000_000_000,
      isIndexing: true,
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(indexerState),
      })
    );

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <IndexerState isCollapsed />
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    const indexerStateBadge = screen.getByTestId("indexer-state-collapsed");
    expect(indexerStateBadge).toBeInTheDocument();
    expect(indexerStateBadge).toHaveTextContent(/^1.0B$/);
  });
});

describe("Test requests to the /indexer-state endpoint subsequent to the initial one", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("requests the indexer state after the interval timer expires", async () => {
    const indexerState = {
      indexingCount: 1,
      isIndexing: true,
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(indexerState),
      })
    );

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <IndexerState />
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    // The initial request happened, and the request icon does not appear.
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("indexer-requesting-icon")).toBeNull();

    // Run the interval timer, then make sure fetch was called a second time, and the request icon
    // appears.
    await act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("indexer-requesting-icon")).toBeInTheDocument();

    // Wait for the timeout to expire, then make sure the request icon disappears.
    await act(() => {
      jest.runOnlyPendingTimers();
    });
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("indexer-requesting-icon")
    );
  });

  it("While in admin mode, it requests the indexer state when clicking the expanded badge button", async () => {
    const indexerState = {
      indexingCount: 2_000_000,
      isIndexing: true,
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(indexerState),
      })
    );
    const sessionProperties = {
      admin: true,
    };

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <SessionContext.Provider value={{ sessionProperties }}>
            <IndexerState />
          </SessionContext.Provider>
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    // The initial request happened, and the request icon does not appear.
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("indexer-requesting-icon")).toBeNull();

    // Click the badge button, then make sure fetch was called a second time, and the request icon
    // appears.
    await act(async () => {
      const badgeButton = screen.getByTestId("indexer-state-button");
      badgeButton.click();
    });
    expect(screen.getByTestId("indexer-requesting-icon")).toBeInTheDocument();

    // Wait for the timeout to expire, then make sure the request icon disappears.
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("indexer-requesting-icon")
    );
  });

  it("While in admin mode, it requests the indexer state when clicking the collapsed badge button", async () => {
    const indexerState = {
      indexingCount: 999_999,
      isIndexing: true,
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(indexerState),
      })
    );
    const sessionProperties = {
      admin: true,
    };

    function IndexerStateTester() {
      const tooltipAttr = useTooltip("indexer-state");

      const globalContext = {
        indexerStateTooltip: tooltipAttr,
      };

      return (
        <GlobalContext.Provider value={globalContext}>
          <SessionContext.Provider value={{ sessionProperties }}>
            <IndexerState isCollapsed />
          </SessionContext.Provider>
        </GlobalContext.Provider>
      );
    }

    await act(async () => render(<IndexerStateTester />));

    // The initial request happened, and the request icon does not appear.
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("indexer-requesting-icon")).toBeNull();

    // Click the badge button, then make sure fetch was called a second time, and the request icon
    // appears.
    await act(async () => {
      const badgeButton = screen.getByTestId("indexer-state-button");
      badgeButton.click();
    });
    expect(screen.getByTestId("indexer-requesting-icon")).toBeInTheDocument();

    // Wait for the timeout to expire, then make sure the request icon disappears.
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("indexer-requesting-icon")
    );
  });
});
