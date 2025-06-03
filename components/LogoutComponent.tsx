import { View, Button, Modal, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';

const LogoutComponent = () => {

	const [logoutActive, setLogoutActive] = useState<boolean>(false);
	const router = useRouter();

	const logout = async () => {
		await AsyncStorage.removeItem('authToken');
		router.replace("/")
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutActive(true)}>
				<Text style={styles.logoutButtonText}>ログアウト</Text>
			</TouchableOpacity>
			<Modal visible={logoutActive} animationType="fade" transparent>
				<TouchableWithoutFeedback onPress={() => setLogoutActive(false)}>
					<View style={styles.modalOverlay}>
						<TouchableWithoutFeedback onPress={() => { /* 中身タップは閉じないように無効化 */ }}>
							<View style={styles.modalContent}>
								<Text style={styles.modalText}>ログアウトしますか？</Text>
								<View style={styles.buttonContainer}>
									<TouchableOpacity style={styles.modalButton} onPress={logout}>
										<Text style={styles.buttonText}>はい</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.modalButton} onPress={() => setLogoutActive(false)}>
										<Text style={styles.buttonText}>いいえ</Text>
									</TouchableOpacity>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View>
	);
}
export default LogoutComponent;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center', // 縦方向中央
		alignItems: 'center',     // 横方向中央
		backgroundColor: '#f0f0f0', // 背景色（任意）
	},
	logoutButton: {
		backgroundColor: '#a9a9a9',
		paddingVertical: 14,
		paddingHorizontal: 30,
		borderRadius: 8,
	},
	logoutButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: 280,
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
	},
	modalText: {
		fontSize: 18,
		marginBottom: 20,
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 10,
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
