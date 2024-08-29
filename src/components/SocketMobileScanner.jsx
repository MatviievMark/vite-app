import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const SocketMobileScanner = ({ onScannedCode }) => {
  const [status, setStatus] = useState('Initializing...');
  const [capture, setCapture] = useState(null);

  useEffect(() => {
    initializeScanner();
    return () => {
      if (capture) {
        capture.close().catch(console.error);
      }
    };
  },);

  const initializeScanner = async () => {
    try {
      const appInfo = {
        appId: 'web:com.example.socketmobilepoc',
        developerId: 'your-developer-id',
        appKey: 'your-app-key'
      };

      const newCapture = new window.SocketMobile.Capture();
      setCapture(newCapture);

      await newCapture.open(appInfo, eventNotification);
      setStatus('Capture opened. Waiting for device...');
    } catch (error) {
      setStatus(`Error initializing: ${error.message}`);
    }
  };

  const eventNotification = async (event) => {
    if (event.id === window.SocketMobile.CaptureEventIds.DeviceArrival) {
      try {
        const newCaptureDevice = new window.SocketMobile.Capture();
        await newCaptureDevice.openDevice(event.value.guid, capture);
        setStatus('Device connected. Ready to scan.');
      } catch (error) {
        setStatus(`Error opening device: ${error.message}`);
      }
    } else if (event.id === window.SocketMobile.CaptureEventIds.DecodedData) {
      const scannedData = new TextDecoder().decode(event.value.data);
      onScannedCode(scannedData);
    }
  };

  return (
    <div>
      <h2>Socket Mobile Scanner</h2>
      <p>{status}</p>
    </div>
  );
};

SocketMobileScanner.propTypes = {
  onScannedCode: PropTypes.func.isRequired,
};

export default SocketMobileScanner;