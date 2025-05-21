import { View, Text, Button, Modal } from 'react-native';
import { TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import api from '@/services/axiosInstance';
import { useRouter, Link } from 'expo-router';
import { Alert } from 'react-native';
import styles from '@/components/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

type returnProps = {
    returnText: string[]
  };

export default function LoginView({ returnText }: returnProps) {
    const [userName, setUserName] = useState<string>('');
    const [isRegistUser, setIsRegistUser] = useState<boolean>(false);
    const router = useRouter();
    const [logText, setLogText] = useState(); 

    useEffect(() => {
        console.log(returnText);
        const checkToken = async () => {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                // トークンがあればstationListに遷移
                router.replace("/stationList");
            }
        };
        checkToken();
    }, []);

    const loginByUserName = async() => {
        if(userName.trim() === ''){
            Alert.alert("ユーザーネームを入力して下さい");
            return;
        }

        try{
            const loginResult = await api.post("/login", {
                userName: userName
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            if(loginResult.status == 200){
                const token = loginResult.data.token;                
                await AsyncStorage.setItem("authToken", token);
                router.push('/stationList');
            }else if(loginResult.status == 401){
                Alert.alert("ユーザーネームが一致しません");
            }else{
                Alert.alert("ログイン失敗");
            }
        }catch(error){
            console.error(error);
        }
    }

    const registUser = async() => {
        if(userName.trim() === ''){
            Alert.alert("ユーザーネームを入力して下さい");
            return;
        }

        try{
            const registResult = await api.post("/registUser", {
                userName: userName
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            if(registResult.status == 201){
                setIsRegistUser(false);
                setTimeout(() => {
                    router.push('/stationList');
                }, 500);
            }else if (registResult.status == 409){
                Alert.alert("ユーザーネームが重複しています");
            }else{
                Alert.alert("登録に失敗しました");
            }

        }catch(error){
            console.error(error);
        }
    }

  return (
    <View style = {styles.container}>
      <Text>ログイン</Text>
      <TextInput style = {styles.input}  value = { userName } onChangeText = { setUserName } placeholder='ユーザーネームを入力' />
      {returnText.map((msg, i) => (
                    <Text key={i}>{msg}</Text>
                ))}
      <Button title = "ログイン" onPress = {loginByUserName} />
      <Button title = "ユーザー登録はこちら" onPress = {() => setIsRegistUser(true)} />
      <Modal visible = {isRegistUser} animationType = "fade" transparent={true}>
        <View style = {styles.popupOverlay}>
            <View style = {styles.popup}>
                <Text>ユーザー登録</Text>
                <TextInput style = {styles.input} value = { userName } onChangeText = { setUserName } placeholder='ユーザーネームを入力' />
                <View style = {styles.registArea}>
                    <Button title = "閉じる" onPress = {() => setIsRegistUser(false)} />
                    <Button title = "登録" onPress = {registUser} />
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}