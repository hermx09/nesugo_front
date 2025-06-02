import { View, Text, Button, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import api from '@/services/axiosInstance';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';
import axios from 'axios';
import { startLocationTracking } from '@/services/LocationService';
import { setLogCallback } from '@/services/LogService';

type returnProps = {
  returnText: string[];
};

export default function LoginView({ returnText }: returnProps) {
  const [userName, setUserName] = useState<string>('');
  const [isRegistUser, setIsRegistUser] = useState<boolean>(false);
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

  const loginByUserName = async () => {
    if (userName.trim() === '') {
      Alert.alert('ユーザーネームを入力して下さい');
      return;
    }

    try {
      const loginResult = await api.post(
        '/login',
        { userName },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (loginResult.status === 200) {
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
    }

    try {
      const registResult = await api.post(
        '/registUser',
        { userName },
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
          router.push('/stationList');
        }, 500);
      } else if (registResult.status === 409) {
        Alert.alert('ユーザーネームが重複しています');
      } else {
        Alert.alert('登録に失敗しました');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder="ユーザーネームを入力"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {returnText.map((msg, i) => (
        <Text key={i} style={styles.logText}>
          {msg}
        </Text>
      ))}
      <TouchableOpacity style={styles.button} onPress={loginByUserName}>
        <Text style={styles.buttonText}>ログイン</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setIsRegistUser(true)}>
        <Text style={styles.buttonText}>ユーザー登録はこちら</Text>
      </TouchableOpacity>

      <Modal visible={isRegistUser} animationType="fade" transparent={true}>
        <View style={styles.popupOverlay}>
          <View style={styles.popup}>
            <Text style={styles.modalTitle}>ユーザー登録</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="ユーザーネームを入力"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <Button title="閉じる" onPress={() => setIsRegistUser(false)} />
              <Button title="登録" onPress={registUser} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
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
    borderRadius: 12,
    padding: 20,
    elevation: 4,
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
    gap: 10,
    marginTop: 20,
  },
});
