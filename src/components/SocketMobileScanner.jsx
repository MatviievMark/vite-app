import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const SocketMobileScanner = ({ onScannedCode }) => {
  const [status, setStatus] = useState('Initializing...');
  const [devices, setDevices] = useState([]);
  const [capture, setCapture] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState('');

  useEffect(() => {
    const appInfo = {
      appId: 'web:septest.socketmobile.com',
      developerId: 'b564acca-1466-ef11-bfe3-000d3a3b1eff',
      appKey: 'MCwCFAleTyXtocjddfguG8DY0G+j4M62AhQU2xAzGFsRqLIhOpUBJbQCmHDbQg=='
    };

    const newCapture = new window.SocketMobile.Capture();
    setCapture(newCapture);

    newCapture.open(appInfo, onCaptureEvent)
      .then((result) => {
        console.log("Opening Capture result: ", result);
        updateStatus(`Capture initialized successfully. Waiting for device...`);
      })
      .catch((err) => {
        const finalErr = err.error || err;
        let errorMessage;
        if (finalErr === window.SocketMobile.SktErrors.ESKT_UNABLEOPENDEVICE) {
          errorMessage = "Unable to connect to the Capture service. Is Socket Mobile Companion running?";
        } else {
          errorMessage = `Error initializing Capture: ${finalErr.code}: ${finalErr.message}`;
        }
        console.error(errorMessage);
        updateStatus(errorMessage, true);
      });

    return () => {
      if (newCapture) {
        newCapture.close().catch(console.error);
      }
    };
  }, []);

  const updateStatus = (message, isError = false) => {
    setStatus(message);
    if (isError) {
      console.error("ERROR: ", message);
    } else {
      console.log("STATUS: ", message);
    }
  };

  const onCaptureEvent = (e) => {
    const { CaptureEventIds, Capture } = window.SocketMobile;
    if (!e) return;

    switch (e.id) {
      case CaptureEventIds.DeviceManagerArrival:
        updateStatus("Device Manager detected. Waiting for device connection...");
        break;

      case CaptureEventIds.DeviceArrival:
        updateStatus(`Device detected: ${e.value.name}. Attempting to open...`);
        const newDevice = new Capture();
        const { guid, name } = e.value;
        newDevice.openDevice(guid, capture)
          .then(() => {
            updateStatus(`Device ${name} opened successfully`);
            setDevices(prevDevices => [...prevDevices, { guid, name, handle: newDevice.clientOrDeviceHandle, device: newDevice }]);
          })
          .catch((err) => {
            updateStatus(`Error opening device ${name}: ${err}`, true);
          });
        break;

      case CaptureEventIds.DeviceRemoval:
        updateStatus(`Device disconnected: ${e.value.name}. Cleaning up...`);
        setDevices(prevDevices => {
          const removeDevice = prevDevices.find(d => d.guid === e.value.guid);
          if (!removeDevice) {
            updateStatus(`No matching devices found for ${e.value.name}`, true);
            return prevDevices;
          }
          removeDevice.device.close()
            .then(() => {
              updateStatus(`Device ${removeDevice.name} closed successfully`);
            })
            .catch((err) => {
              updateStatus(`Error closing device ${removeDevice.name}: ${err}`, true);
            });
          return prevDevices.filter(x => x.guid !== removeDevice.guid);
        });
        break;

      case CaptureEventIds.DecodedData:
        updateStatus('Decoded data received');
        const scannedData = arrayToString(e.value.data);
        setScannedBarcode(scannedData);
        onScannedCode(scannedData);
        updateStatus(`Data received from scanner: ${scannedData}`);
        break;

      case CaptureEventIds.Error:
        updateStatus(`Capture error occurred: ${e.value}`, true);
        break;

      default:
        console.log('Unhandled event:', e);
    }
  };

  const arrayToString = (array) => {
    return array.map(byte => String.fromCharCode(byte)).join('');
  };

  return (
    <div>
      <h2>Socket Mobile Scanner</h2>
      <p>Status: {status}</p>
      <h3>Connected Devices:</h3>
      <ul>
        {devices.map(device => (
          <li key={device.guid}>{device.name}</li>
        ))}
      </ul>
      {devices.length === 0 && <p>No devices connected</p>}
      <p>Scanned Barcode: <span>{scannedBarcode}</span></p>
    </div>
  );
};

SocketMobileScanner.propTypes = {
  onScannedCode: PropTypes.func.isRequired,
};

export default SocketMobileScanner;