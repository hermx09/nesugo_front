import React, { useEffect, useState } from 'react';
import {FlatList, TouchableOpacity, View, Text, StyleSheet, Switch, Alert } from 'react-native';
import type { AlertItem } from '@/app/stationList';
import api from '@/services/axiosInstance';
import { getUserAlerts } from '@/services/AlertService';


type AlertProps = {
    userId: number;
    alertItems: AlertItem[];
    setButtonStatus: (status: string) => void;
    setIsPopupVisible: (visible: boolean) => void;
    modifyPopup: (alertId: number) => void;
}

export const AlertItemsComponent = ({userId, alertItems, setButtonStatus, setIsPopupVisible, modifyPopup}: AlertProps) => {
    const [localAlertItems, setLocalAlertItems] = useState<AlertItem[]>(alertItems);

    useEffect(() => {
        setLocalAlertItems(alertItems);        
    }, [alertItems]);

    

    const toggleAlert = async (alertId: string, alertValue: boolean) => {
        setLocalAlertItems(prevItems => 
            prevItems.map(item => 
                item.alertId === alertId ? { ...item, active: alertValue}: item
            ));
        try{
            const response = await api.post('/toggleAlert', {
                alertId: alertId,
                active: alertValue
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const alerts = await getUserAlerts(userId);
            setLocalAlertItems(alerts);
        }catch(error){
            console.error("error" + error);
        }
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const editAlert = (item: AlertItem) => {
        console.log(item);
    }

    return (
        <View>
            {/* 登録されたアラート */}
            <FlatList
            data={localAlertItems}
            keyExtractor={(item: AlertItem) => item.alertId}
            renderItem={({ item }) => (
                <TouchableOpacity onPress = {() => modifyPopup(item.alertId)}>
                    <View style = {styles.alertButton}>
                        <View style = {styles.stationContainer}>
                        <Text style = {styles.itemText} numberOfLines={1} ellipsizeMode="tail">({item.lineName})({item.prefName})</Text>
                        <Text style = {styles.itemText} numberOfLines={1} ellipsizeMode="tail">{item.stationName}</Text>
                    </View>
                    <Text style = {styles.timeText}>{ item.alertTime.slice(0, 5) }</Text>
                    <Switch value = { item.active } onValueChange = {(value) => toggleAlert(item.alertId, value)} />
                    </View>
                </TouchableOpacity>
            )}
            ListEmptyComponent={<Text>アラートがありません。</Text>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
        alertButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: 'lightgray',
            marginBottom: 5,
            borderRadius: 5,
            width: '100%'
        },
        itemText: {
            flex: 1
        },
        timeText: {
            marginHorizontal: 10
        },
        stationContainer: {
            flex: 1,
            flexDirection: 'column',
            marginRight: 10
        }
    }
)