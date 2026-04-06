/**
 * Establishes the global context for the application. This holds information usable at any level
 * of the application.
 */
import { createContext } from "react";

type GlobalContextType = {
  site: { title: string };
  page: { title: string };
  linkReload: {
    isEnabled: boolean;
    setIsEnabled: (isEnabled: boolean) => void;
  };
  darkMode: { enabled: boolean };
};

// Add more sub-objects to the global context if they make sense.
const GlobalContext = createContext<GlobalContextType>({
  site: { title: "" },
  page: { title: "" },
  linkReload: {
    isEnabled: false,
    setIsEnabled: () => {},
  },
  darkMode: { enabled: false },
});

export default GlobalContext;
