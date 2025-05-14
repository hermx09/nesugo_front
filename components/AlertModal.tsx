import React from 'react';
import { useState } from 'react';
import { View, Modal, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import api from '@/services/axiosInstance';
import type { AlertItem } from '@/app/stationList';
import DeleteButton from './DeleteButton';


type AlertModalProps = {
  setIsPopupVisible: (isPopupVisible: boolean) => void;
  isPopupVisible: boolean,
  setAlertItems: (alertItem: AlertItem[]) => void;
  buttonStatus: string;
  selectedAlertId: number;
};

// 駅データの型定義
interface Station {
    stationId: string;
    stationName: string;
    lineName: string;
    prefName: string;
}


const AlertModal = ({
  setIsPopupVisible,
  isPopupVisible,
  setAlertItems,
  buttonStatus,
  selectedAlertId
}: AlertModalProps) => {

    const [selectedTime, setSelectedTime] = useState(new Date());
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);

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
            
            const alertTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            try{
                const response = await api.post('/insertAlert', {
                    userId: 1,
                    stationId: selectedStation.stationId,
                    alertTime: alertTime,
                    active: true
                },{
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });
                setAlertItems((prevItems: AlertItem[]) => [
                    ...prevItems,
                    { alertId: response.data.alertId, stationName: selectedStation.stationName, lineName: selectedStation.lineName, prefName: selectedStation.prefName, alertTime: alertTime, active: true},
                ]);
            }catch(error){
                console.error("エラー" +  error);
            }
        } else {
            // 駅が選択されていない場合や一致しない場合のエラーメッセージ
            Alert.alert('駅を選択してください。');
        }
    }

    const modifyAlert = () => {

    }

  return (
    <Modal visible={isPopupVisible} animationType="fade" transparent={true}>
      <View style={styles.popupOverlay}>
        <View style={styles.popup}>
          <Text style={styles.alertText}>
            {buttonStatus === '登録' ? 'アラート登録' : 'アラート変更'}
          </Text>
          {buttonStatus == '変更' && (
            <DeleteButton alertId = { selectedAlertId } />
          )}
          <Text>アラーム時間を設定</Text>
          <DateTimePicker value={selectedTime} mode="time" display="default" onChange={onTimeChange} />
          <Text>降車駅</Text>
          <TextInput
            style={styles.input}
            value={searchKeyword}
            onChangeText={onSearchInput}
            placeholder="駅名を入力"
          />
          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.stationId}
              style={styles.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedInfo(item)} style={styles.resultItem}>
                  <Text>{item.stationName} ({item.lineName} {item.prefName})</Text>
                </TouchableOpacity>
              )}
            />
          )}          
          <TouchableOpacity onPress = { buttonStatus === '登録' ? insertAlert : modifyAlert} style = { styles.modalButton }>
            <Text style = { styles.buttonText }>
                { buttonStatus === "登録" ? '登録する' : '変更する'}
            </Text>
          </TouchableOpacity>
          <Button title="キャンセル" onPress={() => setIsPopupVisible(false)} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  resultsList: {
    maxHeight: 120, // リストの最大高さを制限
    width: '80%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingVertical: 5,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AlertModal;
