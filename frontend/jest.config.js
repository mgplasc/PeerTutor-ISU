module.exports = {
  preset: 'react-native',
  setupFiles: ['./__mocks__/setup.js'],
  moduleNameMapper: {
    'react-native-vector-icons/(.*)': '<rootDir>/__mocks__/react-native-vector-icons.js',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
};