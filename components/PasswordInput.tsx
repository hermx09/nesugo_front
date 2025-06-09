import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';

export default function PasswordInput() {
  const [password, setPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);

  const handleSubmit = () => {
    Alert.alert('入力したパスワード', password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>パスワード</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          secureTextEntry={secureEntry}
          placeholder="パスワードを入力"
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setSecureEntry(prev => !prev)} style={styles.toggleButton}>
          <Text>{secureEntry ? '表示' : '非表示'}</Text>
        </TouchableOpacity>
      </View>
      <Button title="送信" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  toggleButton: {
    paddingHorizontal: 12,
  },
});
