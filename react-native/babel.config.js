module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      // Enable `import { CONVEX_URL } from "env";` for accessing .env variables
      'moduleName': 'env',
    }],
  ],
};
