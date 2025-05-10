import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HeaderComponent = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Nesugo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2c3e50',
    padding: 16,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Androidでのシャドウ
  },
  title: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
});

export default HeaderComponent;
