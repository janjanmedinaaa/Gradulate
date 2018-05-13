import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';

import Subjects from './Components/Subjects';
import Grades from './Components/Grades';

export default class App extends Component {
  render() {
    return (
      <StackItems />
    );
  }
}

const StackItems =  StackNavigator({
  Subjects: {screen: Subjects,
    navigationOptions: {headerVisible: false}
  },
  Grades: {screen: Grades,
    navigationOptions: {headerVisible: false}
  },
},
{
  headerVisible: false, headerMode: 'none',
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
