import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Sound from './SoundService';
import { log } from './LogService';
import { getTargetLocations } from './addTargetLocation';
import { requestNotificationPermission } from '@/lib/notifications';
import { sendAlarmNotification } from '@/lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';
import { removeAllTargetLocations } from './addTargetLocation';

// タスク名を決める
const LOCATION_TASK_NAME = 'background-location-task';
let taskDefined = false;

// タスクを定義
export const defineLocationTask = () => {
	if(taskDefined){
		return;
	}
	TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
	  //log("エラー発生: " + error.message);
	  return;
	}
	//log("バックグラウンドタスク実行");
  
	if (data) {
	  const { locations } = data as { locations: Location.LocationObject[] };
	  const location = locations[0];
  
	  if (location) {
		const { latitude, longitude } = location.coords;
		//log(`現在地: ${latitude}, ${longitude}`);
		
		const targets = await getTargetLocations();
		log(`📍 監視対象数: ${targets.length}`);
		console.log("監視ログ" + targets.length);
		for(const target of targets){
			const distance = calculateDistance(latitude, longitude, target.lat, target.lon);
			if (distance < 0.5) {
			await sendAlarmNotification();
			log("アラーム鳴動！");
			}else{
				console.log("距離遠い");
			}
		}
	  }
	}
  });
  taskDefined = true;
}
  
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // 地球の半径 (km)

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    // ハーサインの公式
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 距離 (km)
};

// アプリ起動時に位置情報の追跡を開始する関数
export const startLocationTracking = async (onLog: (msg: string) => void) => {
	//onLog("開始");
	const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      removeAllTargetLocations();
      return;
    }
	Sound.loadSound();
	// try {
	//   const { status: alwaysStatus } = await Location.requestAlwaysPermissionAsync();
	//   onLog("常に位置情報許可チェック完了");
	//   if (alwaysStatus !== 'granted') {
	// 	onLog("常に位置情報の許可が必要です");
	// 	alert("常に位置情報の許可が必要です。設定から許可してください。");
	// 	return;
	//   }
	// } catch (error) {
	//   onLog(`エラー: ${error}`);
	//   return;
	// }
	requestNotificationPermission();
  
	const { status } = await Location.requestForegroundPermissionsAsync();
	if (status !== 'granted') {
	  //onLog("フォアグラウンド位置情報の許可が必要です");
	  alert("フォアグラウンド位置情報の許可が必要です。設定から許可してください。");
	  return;
	}
  
	const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
	if (bgStatus !== 'granted') {
	  //onLog("バックグラウンド位置情報の許可が必要です");
	  Alert.alert(
		"位置情報の許可が必要です",
		"バックグラウンド位置情報の許可が必要です。設定から許可してください。",
		[
		  {
			text: "キャンセル",
			style: "cancel"
		  },
		  {
			text: "設定を開く",
			onPress: () => {
			  Linking.openSettings(); // ユーザーを設定画面に送る
			}
		  }
		]
	  );
	  return;
	}
  
	const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
	if (!isTaskDefined) {
	  //onLog("タスクが未定義です");
	  return;
	}
  
	const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
	//onLog(`✅ hasStarted: ${hasStarted}`);
	if (!hasStarted) {
	  //onLog("位置情報更新を開始します");
	  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
		accuracy: Location.Accuracy.High,
		distanceInterval: 10,
		showsBackgroundLocationIndicator: true,
		foregroundService: {
		  notificationTitle: '位置情報追跡中',
		  notificationBody: '降車駅を監視しています。',
		  notificationColor: '#FF0000',
		},
		activityType: Location.ActivityType.OtherNavigation,
  		pausesUpdatesAutomatically: false,
	  });
	}
	// setInterval(async () => {
	// 	const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
	// 	if (!hasStarted) {
	// 		console.warn("バックグラウンドタスクが停止しています。再起動を試みます。");
	// 		await startLocationTracking(() => {});
	// 	}
	// }, 1000 * 60 * 10); // 10分ごとにチェック

  };
  