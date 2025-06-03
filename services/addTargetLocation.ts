import * as SecureStore from 'expo-secure-store';

type TargetLocation = {
    alertId: number;
    lat: number;
    lon: number;
}

const LOCATIONS_KEY = 'target_locations';

export const addTargetLocation = async (
    alertId: number,
    lat: number,
    lon: number,
) => {
    const existing = await SecureStore.getItemAsync(LOCATIONS_KEY);
    const locations: TargetLocation[] = existing ? JSON.parse(existing) : [];

    const index = locations.findIndex((loc) => loc.alertId === alertId);
    if (index === -1){ // 見つからない場合は null を返す
        const newLocation: TargetLocation = {
            alertId: alertId,
            lat,
            lon,
        };
        locations.push(newLocation);
    }else{
        locations[index] = { alertId, lat, lon };
    }
  
  await SecureStore.setItemAsync(LOCATIONS_KEY, JSON.stringify(locations));
};

export const getTargetLocations = async (): Promise<TargetLocation[]> => {
  const data = await SecureStore.getItemAsync(LOCATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const removeTargetLocation = async (alertId: number) => {
  const existing = await SecureStore.getItemAsync(LOCATIONS_KEY);
  const locations: TargetLocation[] = existing ? JSON.parse(existing) : [];

  const updated = locations.filter((loc) => loc.alertId !== alertId);

  await SecureStore.setItemAsync(LOCATIONS_KEY, JSON.stringify(updated));
};

export const updateTargetLocation = async (
    alertId: number,
    lat: number,
    lon: number
  ): Promise<TargetLocation | null> => {
    const existing = await SecureStore.getItemAsync(LOCATIONS_KEY);
    let locations: TargetLocation[] = existing ? JSON.parse(existing) : [];
  
    const index = locations.findIndex((loc) => loc.alertId === alertId);
    if (index === -1) return null; // 見つからない場合は null を返す
  
    locations[index] = { alertId, lat, lon };
  
    await SecureStore.setItemAsync(LOCATIONS_KEY, JSON.stringify(locations));
  
    return locations[index];
};

export const removeAllTargetLocations = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(LOCATIONS_KEY);
};