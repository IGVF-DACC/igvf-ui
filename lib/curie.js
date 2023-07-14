/**
 * Abstract base for mapping for CURIE-style identifiers (e.g. EFO:0002067) to links.
 */
export default class Curie {
  #curie;
  #prefix;
  #id;

  constructor(curie) {
    this.#curie = curie;

    // This part is intended to be used by all subclasses to break the given CURIE identifier to
    // prefix and identifier parts. If the given string isn't a valid CURIE, the prefix and id
    // contain empty strings. Only split on the first colon in case the ID contains one.
    const parts = curie.split(/:(.+)/);
    if (parts.length >= 2) {
      this.#prefix = parts[0];
      this.#id = parts[1];
    } else {
      this.#prefix = "";
      this.#id = "";
    }
  }

  /**
   * Return the prefix of the CURIE.
   */
  get prefix() {
    return this.#prefix;
  }

  /**
   * Return the identifier part of the CURIE.
   */
  get id() {
    return this.#id;
  }

  /**
   * Return true if the CURIE has a valid format.
   */
  get isValid() {
    return Boolean(this.#prefix && this.#id);
  }

  /**
   * Return the original CURIE string.
   */
  get curie() {
    return this.#curie;
  }

  /**
   * Return the URL for the CURIE. This varies for different CURIE-based systems, so just return an
   * empty string for this abstract class. Concrete subclasses have their own mapping schemes.
   */
  get url() {
    return "";
  }
}
