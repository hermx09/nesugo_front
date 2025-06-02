import { Audio } from 'expo-av';
import { log } from './LogService'; // 追加

let sound: Audio.Sound | null = null;

export const loadSound = async () => {
    if (!sound) {
      const { sound: loadedSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/startsound.mp3')
      );
      sound = loadedSound;
  
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });
  
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.isPlaying) {
            log('✅ 再生中');
          } else {
            log('⏸ 停止状態');
          }
        } else if (status.error) {
          log(`❌ 再生エラー: ${status.error}`);
        }
      });
    }
  };
  
  export const playSound = async () => {
    try {
      if (!sound) {
        await loadSound();
      }
      await sound?.replayAsync();
    } catch (e: any) {
      console.error('🔊 Sound error:', e);
      log(`🔊 Sound error: ${e.message || e}`);
    }
  };