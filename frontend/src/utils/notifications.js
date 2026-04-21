import messaging from '@react-native-firebase/messaging';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                  authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    return getFcmToken();
  }
}

async function getFcmToken() {
  const token = await messaging().getToken();
  return token;
}

export async function registerDeviceToken(apiClient) {
  const token = await getFcmToken();
  if (token && apiClient) {
    await apiClient.post('/users/device-token', { deviceToken: token });
  }
}