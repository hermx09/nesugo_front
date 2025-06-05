import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

const authenticateBiometric = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) {
    return false;
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '生体認証でログイン',
    fallbackLabel: 'パスコードを使う',
  });

  return result.success;
};

export default authenticateBiometric;