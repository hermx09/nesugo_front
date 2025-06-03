import { View, Modal, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import api from '@/services/axiosInstance';
import { useRouter } from 'expo-router';
import { removeTargetLocation } from '@/services/addTargetLocation';

type deleteProps = {
    alertId?: number;
    setIsPopupVisible: (isPopupVisible: boolean) => void;
}

const DeleteButton = ({ alertId, setIsPopupVisible }: deleteProps) => {

    const router = useRouter();
    const deleteAlert = async(alertId?: number) => {
        if(!alertId){
            return Alert.alert("削除失敗");
        }
        console.log("削除するId = " + alertId);
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
            //Alert.alert("削除しました");
            removeTargetLocation(Number(alertId));
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
      marginVertical: 12,
    },
    deleteButton: {
      backgroundColor: '#d32f2f', // 落ち着いた赤（Material Red 700）
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 7,
      alignItems: 'center',
      shadowColor: '#b00020',     // 赤系の影
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
      width: '100%',
      maxWidth: 360,
    },
    deleteText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 18,
      letterSpacing: 1,
    },
});
  
  