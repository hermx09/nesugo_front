import React, { useEffect, useState } from 'react';
import {FlatList, TouchableOpacity, View, Text, StyleSheet, Switch, Alert } from 'react-native';
import type { AlertItem } from '@/app/stationList';
import api from '@/services/axiosInstance';
import { getUserAlerts } from '@/services/AlertService';
import { addTargetLocation, getTargetLocations, removeTargetLocation } from '@/services/addTargetLocation';
import * as Haptics from 'expo-haptics';


type AlertProps = {
    userId: number;
    alertItems: AlertItem[];
    setButtonStatus: (status: string) => void;
    setIsPopupVisible: (visible: boolean) => void;
    modifyPopup: (alertId: AlertItem) => void;
}

export const AlertItemsComponent = ({userId, alertItems, setButtonStatus, setIsPopupVisible, modifyPopup}: AlertProps) => {
    const [localAlertItems, setLocalAlertItems] = useState<AlertItem[]>(alertItems);

    useEffect(() => {
        setLocalAlertItems(alertItems);        
    }, [alertItems]);

    

    const toggleAlert = async (alert: AlertItem, alertValue: boolean) => {
        setLocalAlertItems(prevItems => 
            prevItems.map(item => 
                item.alertId === alert.alertId ? { ...item, active: alertValue}: item
            ));
        try{
            const response = await api.post('/toggleAlert', {
                alertId: alert.alertId,
                active: alertValue
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const alerts = await getUserAlerts(userId);
            if(!alertValue){
                removeTargetLocation(Number(alert.alertId));
                console.log(getTargetLocations);
            }else{
                addTargetLocation(Number(alert.alertId), alert.lat, alert.lon);
            }
            setLocalAlertItems(alerts);
        }catch(error){
            console.error("error" + error);
        }
    }

    return (
        <View>
            {/* 登録されたアラート */}
            <FlatList
            data={localAlertItems}
            keyExtractor={(item: AlertItem) => item.alertId.toString()}
            renderItem={({ item }: {item: AlertItem}) => (
                <TouchableOpacity onPress={() => modifyPopup(item)} 
                    onLongPress={async () =>{
                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            modifyPopup(item);
                        }                    }
                    delayLongPress={300}>
                    <View style={styles.alertButton}>
                        <View style={styles.stationContainer}>
                        <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
                            ({item.lineName})({item.prefName})
                        </Text>
                        <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
                            {item.stationName}
                        </Text>
                        </View>
                        {/* <Text style={styles.timeText}>{item.alertTime.slice(0, 5)}</Text> */}
                        <View style={styles.switchContainer}>
                        <Switch
                            value={item.active}
                            onValueChange={(value: boolean) => toggleAlert(item, value)}
                        />
                        </View>
                    </View>
                </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>アラートがありません。</Text>
                </View>
            }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    alertButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,          // さらにゆったり縦余白増し
        paddingHorizontal: 24,
        backgroundColor: '#f0f4f8',  // 優しい淡い青みグレー
        marginBottom: 12,
        borderRadius: 12,
        width: '100%',

        // 影でカードっぽく
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,   // Android用影効果
    },
    itemText: {
        flex: 1,
        fontSize: 17,
        color: '#222',
        fontWeight: '500',      // 少し太めで読みやすく
        lineHeight: 22,
    },
    timeText: {
        marginHorizontal: 14,
        fontSize: 16,
        color: '#444',
        fontWeight: '600',
        minWidth: 50,           // 時間のスペース一定にしてズレ防止
        textAlign: 'center',
    },
    stationContainer: {
        flex: 1,
        flexDirection: 'column',
        marginRight: 18,
    },
    switchContainer: {
        marginLeft: 12,          // スイッチのまわりに余白を
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50
    },
    emptyText: {
        fontSize: 18,
        color: '#888'
    }
});
