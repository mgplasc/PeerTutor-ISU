// __mocks__/react-native-vector-icons.js
// Prevents Jest from crashing on icon imports
const React = require('react');
const { View } = require('react-native');
const Icon = (props) => React.createElement(View, props);
module.exports = Icon;
module.exports.default = Icon;
