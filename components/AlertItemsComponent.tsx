import React, { useEffect, useState } from 'react';
import {FlatList, TouchableOpacity, View, Text, StyleSheet, Switch, Alert } from 'react-native';
import type { AlertItem } from '@/app/(tabs)/stationList';
import api from '@/services/axiosInstance';

type AlertProps = {
    alertItems: AlertItem[];
}

export const AlertItemsComponent = ({alertItems}: AlertProps) => {
    const [localAlertItems, setLocalAlertItems] = useState<AlertItem[]>(alertItems);

    useEffect(() => {
        setLocalAlertItems(alertItems);
        console.log("ローカル = " + localAlertItems);
    }, [alertItems]);

    const [isAlertEnabled, setIsAlertEnabled] = useState(true);

    const toggleAlert = async (alertId: string, alertValue: boolean) => {
        setLocalAlertItems(prevItems => 
            prevItems.map(item => 
                item.id === alertId ? { ...item, isAlertEnabled: alertValue}: item
            ));
        try{
            const response = await api.get('/insertAlert', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        }catch(error){
            console.error("検索エラー: error" + error);
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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => editAlert(item)}>
                    <View style = {styles.alertButton}>
                    <Text style = {styles.itemText} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                    <Text style = {styles.timeText}>{ currentTime }</Text>
                    <Switch value = { item.isAlertEnabled } onValueChange = {(value) => toggleAlert(item.id, value)} />
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
        }
    }
)