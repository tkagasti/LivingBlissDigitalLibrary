import { describe, expect, it } from "vitest";
import { localizeStudyDigits, resolveStudyLanguage } from "./ShlokaStudyPanel";

describe("preferred shloka study language", () => {
  it("recognises Odia preferences", () => {
    expect(resolveStudyLanguage("Odia")).toBe("Odia");
    expect(resolveStudyLanguage("ଓଡ଼ିଆ")).toBe("Odia");
  });

  it("recognises Hindi and falls back to English", () => {
    expect(resolveStudyLanguage("हिन्दी")).toBe("Hindi");
    expect(resolveStudyLanguage("Sanskrit and English")).toBe("English");
  });

  it("uses native digits for Hindi and Odia study labels", () => {
    expect(localizeStudyDigits("2.47", "Hindi")).toBe("२.४७");
    expect(localizeStudyDigits("2.47", "Odia")).toBe("୨.୪୭");
  });
});
