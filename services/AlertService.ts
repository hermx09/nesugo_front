import api from './axiosInstance';
import { AlertItem } from '@/app/StationList'; // 型は適宜移動か定義を共通化

export const getUserAlerts = async (userId: number): Promise<AlertItem[]> => {
  try {
    const response = await api.get("/getUserAlerts", {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      params: {
        "userId": userId
      }
    });

    return response.data.map((item: AlertItem) => ({
      alertId: item.alertId,
      stationName: item.stationName,
      lineName: item.lineName,
      prefName: item.prefName,
      active: item.active
    }));
  } catch (error) {
    console.error("getUserAlerts error:", error);
    return [];
  }
};
