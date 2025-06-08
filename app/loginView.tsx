import { View, Text, Button, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useEffect } from 'react';
import api from '@/services/axiosInstance';
import { useRouter } from 'expo-router';
import { Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';
import axios from 'axios';
import { startLocationTracking } from '@/services/LocationService';
import authenticateBiometric from '@/services/authenticateBiometric';
import { setLogCallback } from '@/services/LogService';
import * as SecureStore from 'expo-secure-store';

type returnProps = {
  returnText: string[];
};

export default function LoginView({ returnText }: returnProps) {
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRegistUser, setIsRegistUser] = useState<boolean>(false);
  //const [isEnableAuth, setIsEnableAuth] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    console.log(returnText);
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        router.replace('/stationList');
      }
    };
    checkToken();
  }, []);

  const loginByUserName = async (isEnableAuth: boolean) => {
	//Alert.alert("最初" + isEnableAuth);
    if (userName.trim() === '') {
      Alert.alert('ユーザーネームを入力して下さい');
      return;
    }else if (!isEnableAuth && password.trim() === '') {
		// Alert.alert("中は" + isEnableAuth);
		Alert.alert('パスワードを入力して下さい');
		return;
	}

    try {
      const loginResult = await api.post(
        '/login',
        { userName, password, isEnableAuth },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (loginResult.status === 200) {
		if(!isEnableAuth){
			addUserName(userName);
		}
        startLocationTracking((msg) => {
        });
        console.log("ログイン結果" + loginResult);
        const token = loginResult.data.token;
        await AsyncStorage.setItem('authToken', token);
        router.push('/stationList');
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Alert.alert('ユーザーネームが一致しません');
        } else {
          Alert.alert('ログイン失敗');
          console.error('Axios error:', error);
        }
      } else {
        Alert.alert('予期しないエラーが発生しました');
        console.error('Unknown error:', error);
      }
    }
  };

  const registUser = async () => {
    if (userName.trim() === '') {
      Alert.alert('ユーザーネームを入力して下さい');
      return;
    }else if (password.trim() === '') {
		Alert.alert('パスワードを入力して下さい');
		return;
	}

    try {
      const registResult = await api.post(
        '/registUser',
        { userName, password },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (registResult.status === 200) {
        setIsRegistUser(false);
        const token = registResult.data.token;
        if (token) {
            await AsyncStorage.setItem('authToken', token);
          } else {
            console.error('トークンが取得できませんでした');
            return;
          } 
        setTimeout(() => {
			addUserName(userName);
          router.push('/stationList');
        }, 500);
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(error);
        Alert.alert('ユーザーネームが重複しています');
      } else {
        console.log(error);
        Alert.alert('エラーが発生しました');
      }
    }
  };

  const getUser = async () => {
    if (userName.trim() === '') {
      Alert.alert('ユーザーネームを入力して下さい');
      return;
    }
	if(!isUserNameSaved){
		Alert.alert('ユーザーネームが違います');
		return
	}
    try {
      const result = await api.post(
        '/getUser',
        { userName },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (result.status === 200) {
        if(await authenticateBiometric()){
			//setIsEnableAuth(true);
			await loginByUserName(true);
		}else{
			Alert.alert("生体認証失敗");
		}
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Alert.alert('ユーザーネームが一致しません');
        } else {
          Alert.alert('ログイン失敗');
          console.error('Axios error:', error);
        }
      } else {
        Alert.alert('予期しないエラーが発生しました');
        console.error('Unknown error:', error);
      }
    }
  };

  const getSavedUserNames = async () => {
	const json = await SecureStore.getItemAsync('savedUserNames');
	return json ? JSON.parse(json): [];
  }

  const addUserName = async (userName: string) =>{
	const savedNames = await getSavedUserNames();
	if(!savedNames.includes(userName)){
		savedNames.push(userName);
		await SecureStore.setItemAsync('savedUserNames', JSON.stringify(savedNames));
	}
  } 

  const isUserNameSaved = async (userName: string) => {
	const savedNames = await getSavedUserNames();
	return savedNames.includes(userName);
  }

  return (
	<TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
    <View style={styles.container}>
      <Image
          source={require('../assets/images/mainIcon.png')}
          style={ styles.image }
      />
      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder="ユーザーネームを入力"
        autoCapitalize="none"
        autoCorrect={false}
		returnKeyType="done"
      />
	  <TextInput
			style={styles.input}
			value={password}
			onChangeText={setPassword}
			placeholder="パスワードを入力"
			autoCapitalize="none"
			autoCorrect={false}
			returnKeyType="done"
			secureTextEntry={true}
			onFocus={getUser}
		/>
      {returnText.map((msg, i) => (
        <Text key={i} style={styles.logText}>
          {msg}
        </Text>
      ))}
      <TouchableOpacity style={styles.button} onPress={() => loginByUserName(false)}>
        <Text style={styles.buttonText}>ログイン</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setIsRegistUser(true)}>
        <Text style={styles.buttonText}>ユーザー登録はこちら</Text>
      </TouchableOpacity>

      <Modal visible={isRegistUser} animationType="fade" transparent={true}>
      <TouchableWithoutFeedback onPress={() => {
				Keyboard.dismiss();
				setIsRegistUser(false);
	  		}
		}>
		<View style={styles.popupOverlay}>
		<TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
			<View style={styles.popup}>
			<Text style={styles.modalTitle}>ユーザー登録</Text>
			<TextInput
				style={styles.input}
				value={userName}
				onChangeText={setUserName}
				placeholder="ユーザーネームを入力"
				autoCapitalize="none"
				autoCorrect={false}
				returnKeyType="done"
			/>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				placeholder="パスワードを入力"
				autoCapitalize="none"
				autoCorrect={false}
				returnKeyType="done"
				secureTextEntry={true}
			/>
			<View style={styles.modalButtons}>
				<TouchableOpacity style={styles.modalButtonCancel} onPress={() => setIsRegistUser(false)}>
					<Text style={styles.modalButtonText}>キャンセル</Text>
				</TouchableOpacity>
        		<TouchableOpacity style={styles.modalButtonRegister} onPress={registUser}>
          			<Text style={styles.modalButtonText}>登録</Text>
        		</TouchableOpacity>
      		</View>
			</View>
			</TouchableWithoutFeedback>
		</View>
		</TouchableWithoutFeedback>
		</Modal>
		</View>
	</TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
	paddingBottom: 250,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
  },
  logText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4682B4',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 16,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonRegister: {
    flex: 1,
    backgroundColor: '#4682B4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
});
