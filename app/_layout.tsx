import { Stack } from 'expo-router';
import HeaderComponent from '@/components/HeaderComponent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderComponent />
        <Stack screenOptions = {{ headerShown: false , gestureEnabled: false}}/>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
