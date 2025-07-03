module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.ts"
  ],
  coverageDirectory: "../coverage",
};

