import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Sound from './SoundService';

// タスク名を決める
const LOCATION_TASK_NAME = 'background-location-task';

// タスクを定義
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      const { latitude, longitude } = location.coords;
      console.log('現在地:', latitude, longitude);
    
    // 距離を計算してアラームを鳴らす
        const distance = calculateDistance(latitude, longitude, 35.744, 139.640);
        if (distance < 0.5) {  // 例えば0.5km以内
            Sound.playSound();
            console.log("yo");
        }else{
          console.log("no");
        }
    }
  }
});

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
export const startLocationTracking = async () => {
  console.log("スタート");
  const { status } = await Location.requestForegroundPermissionsAsync();
  console.log("最初" + status);
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  console.log("次" + bgStatus);

  if (status !== 'granted' || bgStatus !== 'granted') {
    console.error('位置情報の許可が必要です');
    alert("位置情報の許可が必要です。設定から許可してください。");
    return;
  }

  const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
  if (!isTaskDefined) {
    console.error('タスクが未定義です');
    return;
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // 10秒ごとに更新
      distanceInterval: 10, // 10メートル移動ごとに更新
      showsBackgroundLocationIndicator: true, // iOSだけ
      foregroundService: {
        notificationTitle: '位置情報追跡中',
        notificationBody: '降車駅を監視しています。',
        notificationColor: '#FF0000',
      },
    });
  }
};
