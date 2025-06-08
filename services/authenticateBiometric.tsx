import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

const authenticateBiometric = async () => {

    const supportResult = await LocalAuthentication.supportedAuthenticationTypesAsync();
    //Alert.alert("サポートされてるタイプ" + supportResult);

    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
        //Alert.alert("次" + compatible);
        return false;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
        //Alert.alert("最後" + enrolled);
        return false;
    }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "生体認証でログイン",
    cancelLabel: "キャンセル",
    // fallbackLabel: "パスコードを使用",
    // disableDeviceFallback: true,
  });
  //Alert.alert("結果は" + JSON.stringify(result));
  if (!result.success) {
    LocalAuthentication.cancelAuthenticate();
  }

  return result.success;
};

export default authenticateBiometric;