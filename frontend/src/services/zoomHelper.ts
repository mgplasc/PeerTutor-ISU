import { Linking, Alert } from 'react-native';

/**
 * Attempts to open a Zoom meeting in the native app, falling back to the web browser.
 * @param meetingId - The generated Zoom meeting ID
 * @param password - The meeting passcode (optional)
 */
export const joinZoomSession = async (meetingId: string, password?: string) => {
  // The custom URL scheme that triggers the native Zoom app
  const zoomAppUrl = `zoomus://zoom.us/join?confno=${meetingId}${password ? `&pwd=${password}` : ''}`;
  
  // The standard web link as a fallback if they don't have the app
  const zoomWebUrl = `https://zoom.us/j/${meetingId}${password ? `?pwd=${password}` : ''}`;

  try {
    // Check if the iPhone/Android knows how to open the Zoom app
    const canOpenApp = await Linking.canOpenURL(zoomAppUrl);

    if (canOpenApp) {
      // Launch the Zoom app directly into the meeting
      await Linking.openURL(zoomAppUrl);
    } else {
      // Launch the phone's web browser as a backup
      await Linking.openURL(zoomWebUrl);
    }
  } catch (error) {
    Alert.alert('Connection Error', 'Unable to launch the meeting. Please try again.');
    console.error('Zoom Deep Link Error:', error);
  }
};