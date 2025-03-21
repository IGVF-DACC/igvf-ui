/**
 * Data use limitations can come in the form of a string for the limitation and an array of strings
 * for the modifiers, but they can also come as a summary -- a single string that includes both the
 * limitation and the modifiers. This function decomposes the summary into its separate limitation
 * and modifiers. If no modifiers exist, the modifiers array is empty. If `summary` is empty, the
 * limitation is an empty string and the modifiers array is empty.
 * @param summary Data-use limitation summary that includes limitation and modifiers
 * @returns limitation and modifiers as separate strings
 */
export function decomposeDataUseLimitationSummary(summary: string = ""): {
  limitation: string;
  modifiers: string[];
} {
  if (summary) {
    const [limitation, modifiers] = summary.split("-");
    return { limitation, modifiers: modifiers ? modifiers.split(",") : [] };
  }
  return { limitation: "", modifiers: [] };
}
