/**
 * Abstract base for mapping for CURIE-style identifiers (e.g. EFO:0002067) to links.
 */
export default class Curie {
  private originalCurie = "";
  private extractedPrefix = "";
  private extractedId = "";

  constructor(curie: string) {
    this.originalCurie = curie;

    // This part is intended to be used by all subclasses to break the given CURIE identifier to
    // prefix and identifier parts. If the given string isn't a valid CURIE, the prefix and id
    // contain empty strings. Only split on the first colon in case the ID contains one.
    const parts = curie.split(/:(.+)/);
    if (parts.length >= 2) {
      this.extractedPrefix = parts[0];
      this.extractedId = parts[1];
    } else {
      this.extractedPrefix = "";
      this.extractedId = "";
    }
  }

  /**
   * Return the prefix of the CURIE.
   */
  get prefix(): string {
    return this.extractedPrefix;
  }

  /**
   * Return the identifier part of the CURIE.
   */
  get id(): string {
    return this.extractedId;
  }

  /**
   * Return true if the CURIE has a valid format.
   */
  get isValid(): boolean {
    return Boolean(this.extractedPrefix && this.extractedId);
  }

  /**
   * Return the original CURIE string.
   */
  get curie(): string {
    return this.originalCurie;
  }

  /**
   * Return the URL for the CURIE. This varies for different CURIE-based systems, so just return an
   * empty string for this abstract class. Concrete subclasses have their own mapping schemes.
   */
  get url(): string {
    return "";
  }
}
