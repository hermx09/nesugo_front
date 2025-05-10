import { Audio } from 'expo-av';

export const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/startsound.mp3')
    );
    await sound.playAsync();
}