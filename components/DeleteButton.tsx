import { View, Modal, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import api from '@/services/axiosInstance';
import { useRouter } from 'expo-router';

type deleteProps = {
    alertId: number;
    setIsPopupVisible: (isPopupVisible: boolean) => void;
}

const DeleteButton = ({ alertId, setIsPopupVisible }: deleteProps) => {

    const router = useRouter();
    const deleteAlert = async(alertId: number) => {
        console.log(alertId);
        const response = await api.post("/deleteAlert", {
            alertId: alertId
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if(response.status == 200){
            Alert.alert("削除しました");
            setIsPopupVisible(false);
            router.push("/stationList");
        }else{
            Alert.alert("削除失敗");
        }
    }

    return (
        <View style = {styles.deleteButtonContainer}>
            <TouchableOpacity onPress = {() => deleteAlert(alertId)} style = {styles.deleteButton}>
                <Text style = {styles.deleteText}>削除</Text>
            </TouchableOpacity>
        </View>
    );
}

export default DeleteButton;

const styles = StyleSheet.create({
    deleteButtonContainer: {
      alignItems: 'center',
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e53935', // 赤系の警告カラー
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    deleteText: {
      color: '#fff',      
      fontWeight: '600',
      fontSize: 16,
    },
});