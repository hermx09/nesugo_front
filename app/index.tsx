import StationList from './stationList';
import HeaderComponent from '@/components/HeaderComponent';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginView from './loginView';
import { View, Text } from 'react-native';

export default function Index() {
  return (
    <LoginView />  
  );
}
