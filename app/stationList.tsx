import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { startLocationTracking } from '@/services/LocationService';
import api from '@/services/axiosInstance';
import { AlertItemsComponent } from '@/components/AlertItemsComponent';
import DateTimePicker, { DateTimePickerEvent} from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import * as Sound from '../services/SoundService';
import LogoutComponent from '@/components/LogoutComponent';
import DeleteButton from '@/components/DeleteButton';
import AlertModal from '@/components/AlertModal';

// アラートアイテムの型定義
export type AlertItem = {
    alertId: string;
    stationId: string;
    stationName: string;
    lineName: string;
    prefName: string;
    alertTime: string;
    active: boolean;
}

interface UserToken {
    sub: string;
    exp: number;
    iat: number;
    userId: number;
  }

export default function StationList() {
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
    const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState(0);
    const [buttonStatus, setButtonStatus] = useState('');
    const [selectedAlertId, setSelectedAlertId] = useState(0);
    const [selectedAlert, setSelectedAlert] = useState<AlertItem>();

    useEffect(() => {
        getUserName();
    }, []);

    useEffect(() => {
        if (userId) {
            getUserAlerts();
        }
    }, [userId]);

    const insertPopup = () => {
        setButtonStatus("登録");
        setIsPopupVisible(true);
    }

    const modifyPopup = (alertItem: Alert) => {
        setSelectedAlert(alertItem);
        setButtonStatus("変更");
        setIsPopupVisible(true);
    }

    const getUserName = async() => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
        const decoded = jwtDecode<UserToken>(token);
        setUserName(decoded.sub);
        setUserId(decoded.userId);
        }
    }

    const getUserAlerts = async() => {
        try{
            const response = await api.get("/getUserAlerts", {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                params: {
                    "userId": userId
                }
            });
            const alerts: AlertItem[] = response.data.map((item: AlertItem) => ({
                alertId: item.alertId,
                stationId: item.stationId,
                stationName: item.stationName,
                lineName: item.lineName,
                prefName: item.prefName,
                alertTime: item.alertTime,
                active: item.active
            }));
            setAlertItems(alerts);
        }catch(error){
            console.error(error);
        }
    }

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <View style={{ flex: 1, marginRight: 5 }}>
                    <Button title="アラート登録" onPress={insertPopup} />
                </View>
                <View style={{ flex: 1, marginLeft: 5 }}>
                    <LogoutComponent />
                </View>
            </View>
            <AlertModal setIsPopupVisible = { setIsPopupVisible } isPopupVisible = { isPopupVisible } alertItem = { selectedAlert } setAlertItems = { setAlertItems } buttonStatus = { buttonStatus } selectedAlert = {selectedAlert} />
            <AlertItemsComponent alertItems = { alertItems } userId = { userId } setButtonStatus = { setButtonStatus } setIsPopupVisible = { setIsPopupVisible } modifyPopup = {modifyPopup}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    }
});
