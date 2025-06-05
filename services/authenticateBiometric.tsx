import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

const authenticateBiometric = async () => {

    const supportResult = await LocalAuthentication.supportedAuthenticationTypesAsync();
    alert(supportResult);

    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
        Alert.alert("最初");
        return false;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
        Alert.alert("次");
        return false;
    }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "認証を促すメッセージ",
    cancelLabel: "キャンセルラベル",
    fallbackLabel: "認証失敗時のメッセージ",
    disableDeviceFallback: false,
  });
  if (result.success) {
    alert("認証成功");
  } else {
    LocalAuthentication.cancelAuthenticate();
    alert("認証失敗");
  }

  return result.success;
};

export default authenticateBiometric;