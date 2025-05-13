import LoginView from './loginView';
import '@/services/LocationService';
import { startLocationTracking } from '@/services/LocationService';
import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    startLocationTracking();
  }, []);
  return (
    <LoginView />  
  );
}
