import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

const authenticateBiometric = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) {
    Alert.alert('この端末は生体認証に対応していません');
    return false;
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    Alert.alert('生体認証が設定されていません');
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '生体認証でログイン',
    fallbackLabel: 'パスコードを使う',
  });

  if (!result.success) {
    Alert.alert('認証に失敗しました');
  }

  return result.success;
};

export default authenticateBiometric;