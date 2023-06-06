/**
 * This project uses the Tailwind CSS "class" darkMode mode, requiring the ".dark" CSS class on the
 * <html> element to toggle dark mode. This class handles setting the dark mode based on the OS
 * dark-mode setting.
 */
export default class DarkModeManager {
  #isHandlerInstalled = false;
  #handleDarkModeChange;
  #onDarkModeChange = null;

  /**
   * onChangeCallback is an optional function that will be called whenever the current dark mode
   * settings are changed. It takes a boolean as a parameter, `true` representing when dark mode
   * has been switched on, and `false` when dark mode has been switched off.
   */
  constructor(onChangeCallback = null) {
    // handleDarkModeChangeUnbound gets called by the browser event listener, so we must bind it to
    // `this` to provide the class context when called.
    this.#onDarkModeChange = onChangeCallback;
    this.#handleDarkModeChange = this.#handleDarkModeChangeUnbound.bind(this);
  }

  /**
   * Called when the OS notifies us of a dark-mode change. Because this method gets called by the
   * browser with the event context, we have bound this method to `this` to provide the class
   * context when called, through `this.#handleDarkModeChange`.
   * @param {object} event Color scheme event
   */
  #handleDarkModeChangeUnbound(event) {
    if (event.matches) {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
  }

  /**
   * Sets light mode by removing the Tailwind CSS ".dark" class from the <html> element.
   */
  setLightMode() {
    document.documentElement.classList.remove("dark");
    this.#onDarkModeChange && this.#onDarkModeChange(false);
  }

  /**
   * Sets dark mode by adding the Tailwind CSS ".dark" class to the <html> element.
   */
  setDarkMode() {
    document.documentElement.classList.add("dark");
    this.#onDarkModeChange && this.#onDarkModeChange(true);
  }

  /**
   * Adds the ".dark" Tailwind CSS class to the <html> element if the current OS dark mode is on.
   */
  setCurrentDarkMode() {
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
  }

  isDarkMode() {
    return Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  }

  /**
   * Installs the dark-mode event listener. Normally, call this once when the <App> component
   * mounts.
   */
  installDarkModeListener() {
    if (!this.#isHandlerInstalled) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", this.#handleDarkModeChange);
      this.#isHandlerInstalled = true;
    }
  }

  /**
   * Removes the dark-mode event listener. Normally, call this once when the <App> component
   * unmounts.
   */
  removeDarkModeListener() {
    if (this.#isHandlerInstalled) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", this.#handleDarkModeChange);
      this.#isHandlerInstalled = false;
    }
  }
}
