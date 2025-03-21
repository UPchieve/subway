const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  setupFiles: [
    "<rootDir>/server/tests/mocks-setup.ts",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/server/tests/custom-matchers.ts",
  ],
  watchPathIgnorePatterns: ["globalConfig"],
  roots: ["<rootDir>/server"],
  coveragePathIgnorePatterns: [
    "<rootDir>/server/models",
    "<rootDir>/database/seeds",
    "<rootDir>/server/constants"
  ],
  testPathIgnorePatterns: ["<rootDir>/server/tests/database"],
  transform: tsjPreset.transform,
  runner: "groups",
}
