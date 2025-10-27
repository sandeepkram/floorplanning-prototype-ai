import { defaults } from "ts-jest/presets";

export default {
  ...defaults,
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true }] },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  globals: {
    "ts-jest": {
      useESM: true,
      diagnostics: { ignoreCodes: [151002] },
    },
  },
};
