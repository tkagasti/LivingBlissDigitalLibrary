import { describe, expect, it } from "vitest";
import { devanagariToOdia } from "./gita-repository";

describe("Gita repository script presentation", () => {
  it("renders Sanskrit commentary in Odia script without leaving Devanagari characters", () => {
    const odia = devanagariToOdia("श्रीमद्भगवद्गीता 1.१ धर्मक्षेत्रे कुरुक्षेत्रे");
    expect(odia).toBe("ଶ୍ରୀମଦ୍ଭଗଵଦ୍ଗୀତା ୧.୧ ଧର୍ମକ୍ଷେତ୍ରେ କୁରୁକ୍ଷେତ୍ରେ");
    expect(odia).not.toMatch(/[ऀ-ॿ]/u);
  });
});
