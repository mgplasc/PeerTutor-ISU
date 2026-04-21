import messaging from '@react-native-firebase/messaging';
import { AxiosInstance } from 'axios';

export async function requestUserPermission(): Promise<string | undefined> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    return getFcmToken();
  }
  return undefined;
}

async function getFcmToken(): Promise<string> {
  const token = await messaging().getToken();
  return token;
}

export async function registerDeviceToken(apiClient: AxiosInstance): Promise<void> {
  const token = await getFcmToken();
  if (token && apiClient) {
    await apiClient.post('/users/device-token', { deviceToken: token });
  }
}