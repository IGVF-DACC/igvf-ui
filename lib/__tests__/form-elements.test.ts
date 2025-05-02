import { generateButtonClasses } from "../form-elements";

describe("Test generateButtonClasses", () => {
  it("should return the correct classes for primary button with default size", () => {
    const result = generateButtonClasses();
    expect(result).toBe(
      "items-center justify-center border font-semibold leading-none px-4 rounded text-sm h-8 [&>svg]:h-4 [&>svg]:w-4 bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled"
    );
  });

  it("should return the correct classes for secondary button with default size", () => {
    const result = generateButtonClasses("secondary");
    expect(result).toBe(
      "items-center justify-center border font-semibold leading-none px-4 rounded text-sm h-8 [&>svg]:h-4 [&>svg]:w-4 bg-button-secondary border-button-secondary text-button-secondary fill-button-secondary disabled:bg-button-secondary-disabled disabled:border-button-secondary-disabled disabled:text-button-secondary-disabled disabled:fill-button-secondary-disabled"
    );
  });

  it("should return the correct classes for primary button with size 'lg'", () => {
    const result = generateButtonClasses("primary", "lg");
    expect(result).toBe(
      "items-center justify-center border font-semibold leading-none px-6 rounded text-base h-10 [&>svg]:h-5 [&>svg]:w-5 bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled"
    );
  });

  it("should return the correct classes with the hasIconOnly option", () => {
    const result = generateButtonClasses("primary", "lg", true);
    expect(result).toBe(
      "items-center justify-center border font-semibold leading-none px-3 rounded form-element-height-lg [&>svg]:h-5 [&>svg]:w-5 bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled"
    );
  });

  it("should return the correct classes with the hasIconCircleOnly option", () => {
    const result = generateButtonClasses("primary", "lg", false, true);
    expect(result).toBe(
      "items-center justify-center border font-semibold leading-none p-3 rounded-full [&>svg]:h-5 [&>svg]:w-5 bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled"
    );
  });
});
