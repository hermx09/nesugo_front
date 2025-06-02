import * as Notifications from 'expo-notifications';

// 通知の表示スタイル設定（フォアグラウンド時にも表示）
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
  
      // ✅ iOS 17以降で必要なプロパティ
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

// iOS用の許可リクエスト（初回だけ必要）
export const requestNotificationPermission = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }
}

export const sendAlarmNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '降車アラーム',
        body: '目的地に近づいています！',
        sound: 'startsound.caf',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
}