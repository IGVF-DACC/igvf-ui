import facetRegistry from "../facet-registry";

describe("facet registry lookups", () => {
  Object.entries(facetRegistry).forEach(([name, section]) => {
    it(`${name} returns custom, null, and standard components`, () => {
      const customField = Object.keys(section.components).find(
        (field) => section.components[field] !== null
      );
      expect(customField).toBeDefined();
      expect(section.lookup(customField as string)).toBe(
        section.components[customField as string]
      );

      const nullField = "test_null_component";
      (section.components as Record<string, unknown>)[nullField] = null;

      try {
        expect(section.lookup(nullField)).toBeNull();
      } finally {
        delete section.components[nullField];
      }

      expect(section.lookup("test_unregistered_field")).toBe(section.standard);
    });
  });
});
