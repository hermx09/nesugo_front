import { Stack } from 'expo-router';
import HeaderComponent from '@/components/HeaderComponent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import LoginView from './loginView';
import Index from '.';
import styles from '@/components/Styles';
import StationList from './stationList';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderComponent />
        <Stack screenOptions = {{ headerShown: false }}/>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
