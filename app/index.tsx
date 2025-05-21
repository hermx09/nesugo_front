import LoginView from './loginView';
import '@/services/LocationService';
import { startLocationTracking } from '@/services/LocationService';
import { setLogCallback } from '@/services/LogService';
import { useEffect, useState } from 'react';

export default function Index() {
	const [returnText, setReturnText] = useState<string[]>([]);
	useEffect(() => {
		// コンポーネントマウント時に位置情報追跡開始
		startLocationTracking((msg) => {
		  setReturnText((prev) => [...prev, msg]);
		});
		setLogCallback((msg) => {
			setReturnText((prev) => [...prev, msg]);
		});
	  }, []);
  return (
    <LoginView returnText={returnText}/>  
  );
}
