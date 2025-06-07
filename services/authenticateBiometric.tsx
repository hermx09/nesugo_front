import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

const authenticateBiometric = async () => {

    // const supportResult = await LocalAuthentication.supportedAuthenticationTypesAsync();
    // alert(supportResult);

    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
        return false;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
        return false;
    }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "認証を促すメッセージ",
    cancelLabel: "キャンセルラベル",
    fallbackLabel: "認証失敗時のメッセージ",
    disableDeviceFallback: false,
  });
  if (!result.success) {
    LocalAuthentication.cancelAuthenticate();
  }

  return result.success;
};

export default authenticateBiometric;