import React from 'react';
import { useState } from 'react';
import { View, Modal, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import api from '@/services/axiosInstance';
import type { AlertItem } from '@/app/stationList';
import DeleteButton from './DeleteButton';
import { useRouter } from 'expo-router';


type AlertModalProps = {
  setIsPopupVisible: (isPopupVisible: boolean) => void;
  isPopupVisible: boolean;
  alertItem?: AlertItem;
  setAlertItems: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  buttonStatus: string;
  userId: number;
};

// 駅データの型定義
interface Station {
    stationId: number;
    stationName: string;
    lineName: string;
    prefName: string;
}


const AlertModal = ({
  setIsPopupVisible,
  isPopupVisible,
  alertItem,
  setAlertItems,
  buttonStatus,
  userId
}: AlertModalProps) => {

    const [selectedTime, setSelectedTime] = useState(new Date());
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const router = useRouter();

    const onSearchInput = async (text: string) => {
        setSearchKeyword(text);

        if (!text.trim()) {
            setSearchResults([]);
            setSelectedStation(null);
            return;
        }

        try{
            const response = await api.get('/getStations', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                params: { name: text }
                });
                const stations: Station[] = response.data;
                setSearchResults(stations);
        }catch(error){
            console.error("検索エラー: error" + error);
        }
            
    }

    const onTimeChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || selectedTime;
        if (currentDate instanceof Date) {            
            setSelectedTime(currentDate);            
        } else {            
            console.error('Invalid date selected');
        }
    }

    const setSelectedInfo = (item: Station) => {
        setSearchKeyword(`${item.stationName} (${item.lineName}: ${item.prefName})`);
        setSelectedStation({ stationId: item.stationId, stationName: item.stationName, lineName: item.lineName, prefName: item.prefName });
    }

    // アラート登録
    const insertAlert = async () => {
        if (selectedStation) {
    
            setSearchKeyword('');
            setSearchResults([]);
            setSelectedStation(null);
            setIsPopupVisible(false);
            
            // const alertTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            try{
                const response = await api.post('/insertAlert', {
                    userId: userId,
                    stationId: selectedStation.stationId,
                    // alertTime: alertTime,
                    active: true
                },{
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });
                setAlertItems((prevItems: AlertItem[]) => [
                    ...prevItems,
                    { alertId: response.data.alertId, stationId: response.data.stationId, stationName: response.data.stationName, lineName: response.data.lineName, prefName: response.data.prefName
                        // , alertTime: alertTime
                        , active: true, lat: response.data.lat, lon: response.data.lon},
                ]);
            }catch(error){
                console.error("エラー" +  error);
            }
        } else {
            // 駅が選択されていない場合や一致しない場合のエラーメッセージ
            Alert.alert('駅を選択してください。');
        }
    }

    const modifyAlert = async () => {
        
        let stationId  = alertItem?.stationId;
        if(selectedStation?.stationId){
           stationId =  selectedStation.stationId;
        }

        // let alertTime = formatDateToTimeString(convertTimeStringToDate(alertItem.alertTime));
        // if(selectedTime){
        //     alertTime = formatDateToTimeString(selectedTime);
        // }

        const alertId = alertItem?.alertId;
        const active = alertItem?.active;


        console.log(alertId, stationId, active);
        try{    
            const response = await api.post("/modifyAlert", {
                alertId,
                stationId,
                active
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }    
            });
            if(response.status == 200){
                Alert.alert("変更しました");
                setIsPopupVisible(false);
                router.push("/stationList");
            }else{
                Alert.alert("変更失敗");
            }
        }catch(error){
            console.error(error);
        }
    }

    const convertTimeStringToDate = (timeString: string): Date => {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        const now = new Date();
        now.setHours(hours);
        now.setMinutes(minutes);
        now.setSeconds(seconds || 0); // 秒がない場合は 0
        now.setMilliseconds(0); // ミリ秒もリセット
        return now;
      };

    const formatDateToTimeString = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
      };

  return (
    <Modal visible={isPopupVisible} animationType="fade" transparent={true}>
      <View style={styles.popupOverlay}>
        <View style={styles.popup}>
          <Text style={styles.alertText}>
            {buttonStatus === '登録' ? 'アラート登録' : 'アラート変更'}
          </Text>
          <View style={styles.sectionWrapper}>
            {/* <Text style={styles.sectionLabel}>アラーム時間を設定</Text>
            <View style={styles.pickerContainer}>
                <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
                style={{ width: 200 }} // DateTimePickerに直接幅を指定
                />
            </View> */}

            <Text style={styles.sectionLabel}>降車駅</Text>
            </View>
          <TextInput
            style={styles.input}
            value={searchKeyword}
            onChangeText={onSearchInput}
            placeholder="駅名を入力"
          />
          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item: AlertItem) => item.alertId?.toString()}
              style={styles.resultsList}
              renderItem={({ item }: { item: AlertItem }) => (
                <TouchableOpacity onPress={() => setSelectedInfo(item)} style={styles.resultItem}>
                    <Text>{item.stationName} ({item.lineName} {item.prefName})</Text>
                </TouchableOpacity>        
              )}
            />
          )}  
            <TouchableOpacity onPress = { () => { buttonStatus === '登録' ? insertAlert() : modifyAlert() } } style = { styles.modalButton } >
                <Text style = { styles.buttonText }>
                    { buttonStatus === "登録" ? '登録する' : '変更する'}
                </Text>
            </TouchableOpacity>
            {buttonStatus == '変更' && (
            <DeleteButton alertId = { alertItem?.alertId } setIsPopupVisible = {setIsPopupVisible}/>
            )}
            <TouchableOpacity
                onPress={() => setIsPopupVisible(false)}
                style={styles.cancelButton}
                >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    popupOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // 少し濃い目のオーバーレイでフォーカスアップ
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    popup: {
      backgroundColor: '#fff',
      borderRadius: 16,
      width: '100%',
      maxWidth: 360,
      paddingVertical: 24,
      paddingHorizontal: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      alignItems: 'stretch',
    },
    alertText: {
      fontSize: 22,
      fontWeight: '700',
      color: '#212121',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#bbb',
      borderRadius: 10,
      marginBottom: 30,
      fontSize: 16,
      color: '#212121',
      backgroundColor: '#fefefe',
    },
    resultsList: {
      maxHeight: 140,
      marginBottom: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ddd',
      backgroundColor: '#fafafa',
    },
    resultItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    modalButton: {
      backgroundColor: '#2962ff',
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 7,
      alignItems: 'center',
      shadowColor: '#2962ff',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    buttonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 18,
    },
    cancelButton: {
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#aaa',
      backgroundColor: '#fff',
    },
    cancelButtonText: {
      fontSize: 16,
      color: '#555',
    },
    sectionWrapper: {
        alignItems: 'center', // 子要素（テキストやピッカー）を中央寄せ
        marginVertical: 12,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 8,
        marginTop: 16,
        textAlign: 'center',
    },
    pickerContainer: {
        backgroundColor: '#fefefe',
        borderRadius: 12,
        padding: 12,
        borderColor: '#ccc',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 20,
        alignItems: 'center', 
    },
});
  

export default AlertModal;
