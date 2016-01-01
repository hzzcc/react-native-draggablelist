/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var Page = require('./page/index');

var Example = React.createClass({
  render: function() {
    return (
        <View style={styles.container}>
          <Page />
        </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
});

AppRegistry.registerComponent('Example', () => Example);
