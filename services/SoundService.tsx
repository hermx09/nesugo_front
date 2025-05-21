import { Audio } from 'expo-av';
import { log } from './LogService'; // 追加

let sound: Audio.Sound | null = null;

export const playSound = async () => {
  try {
    // オーディオ設定（バックグラウンドやサイレントモード対応）
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
    });

    // 既存の sound を解放
    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }

    // 音声ファイル読み込み
    const { sound: newSound } = await Audio.Sound.createAsync(
      require('../assets/sounds/startsound.mp3')
    );

    sound = newSound;

    // 再生ステータス確認用ログ
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        if (status.isPlaying) {
          log('✅ 再生中'); // UIにも出す
        } else {
          log('⏸ 停止状態'); // UIにも出す
        }
      } else if (status.error) {
        log(`❌ 再生エラー: ${status.error}`); // UIにも出す
      }
    });

    // 再生開始
    await sound.playAsync();
  } catch (e: any) {
    console.error('🔊 Sound error:', e);
    log(`🔊 Sound error: ${e.message || e}`);
  }
};
