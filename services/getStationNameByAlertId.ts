import api from '@/services/axiosInstance';

export const getAlertNameByAlertId = async (alertId: number): Promise<string | undefined> => {
  try {
    const response = await api.get("/getAlertNameByAlertId", {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      params: {
        alertId: alertId
      }
    });
    return response.data.stationName;
  } catch (e) {
    console.error('❌ getAlertNameByAlertId error', e);
    return undefined;
  }
};
