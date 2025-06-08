import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { startLocationTracking } from '@/services/LocationService';
import api from '@/services/axiosInstance';
import { AlertItemsComponent } from '@/components/AlertItemsComponent';
//import DateTimePicker, { DateTimePickerEvent} from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import LogoutComponent from '@/components/LogoutComponent';
import AlertModal from '@/components/AlertModal';
import { addTargetLocation, getTargetLocations, removeTargetLocation, removeAllTargetLocations } from '@/services/addTargetLocation';

// アラートアイテムの型定義
export type AlertItem = {
    alertId: number;
    stationId: number;
    stationName: string;
    lineName: string;
    prefName: string;
    // alertTime: string;
    active: boolean;
    lat: number;
    lon: number;
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
    //const [selectedAlertId, setSelectedAlertId] = useState(0);
    const [selectedAlert, setSelectedAlert] = useState<AlertItem>();

    useEffect(() => {
        startLocationTracking((msg) => {
        });
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

    const modifyPopup = (alertItem: AlertItem) => {
        console.log("変更" + selectedAlert);
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
                // alertTime: item.alertTime,
                active: item.active,
                lat: item.lat,
                lon: item.lon
            }));
            removeAllTargetLocations();
            for(const alert of alerts){
                if(alert.active){
                  await addTargetLocation(Number(alert.alertId), alert.lat, alert.lon);
                }                
            }
            console.log(alerts);
            const targets = await getTargetLocations();
            console.log(targets);
            setAlertItems(alerts);
        }catch(error){
            console.error(error);
        }
    }

    return (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.buttonWrapper}>
              <LogoutComponent />
            </View>
            <TouchableOpacity style={styles.alertButton} onPress={insertPopup} activeOpacity={0.7}>
              <Text style={styles.alertButtonText}>アラート登録</Text>
            </TouchableOpacity>
          </View>
      
          <AlertModal
            setIsPopupVisible={setIsPopupVisible}
            isPopupVisible={isPopupVisible}
            alertItem={selectedAlert}
            setAlertItems={setAlertItems}
            buttonStatus={buttonStatus}
            userId = {userId}
          />
      
          <AlertItemsComponent
            alertItems={alertItems}
            userId={userId}
            setButtonStatus={setButtonStatus}
            setIsPopupVisible={setIsPopupVisible}
            modifyPopup={modifyPopup}
          />
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        padding: 12,
        marginTop: 20,
        alignItems: 'center',
      },
      buttonWrapper: {
        flex: 1,
        marginRight: 5,
      },
      alertButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginLeft: 5,
        alignItems: 'center',
        justifyContent: 'center',
      },
      alertButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
      },
});