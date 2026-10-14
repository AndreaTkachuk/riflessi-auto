import { describe, expect, it } from "vitest";
import { slugify } from "./slug.js";

describe("slugify", () => {
  it.each([
    ["Alfa Romeo", "alfa-romeo"],
    ["Citroën", "citroen"],
    ["Škoda Octavia", "skoda-octavia"],
    ["Mercedes-Benz Classe A", "mercedes-benz-classe-a"],
    ["  Fiat   500  ", "fiat-500"],
    ["Fiat 500e (2024)", "fiat-500e-2024"],
    ["DS 3 Crossback E-Tense", "ds-3-crossback-e-tense"],
    ["Land Rover Range Rover Evoque", "land-rover-range-rover-evoque"],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("returns an empty string when nothing is left", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("keeps an already valid slug unchanged", () => {
    expect(slugify("giulia-quadrifoglio")).toBe("giulia-quadrifoglio");
  });
});
