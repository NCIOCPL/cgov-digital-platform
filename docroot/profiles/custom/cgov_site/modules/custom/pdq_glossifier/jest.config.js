module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '\\.dom\\.js$',
  ],
  roots: ['<rootDir>/js/ckeditor5_plugins/glossifier/src'],
  coverageThreshold: {
    global: {
      lines: 85,
    },
  },
};
