import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const SocketMobileScanner = ({ onScannedCode }) => {
  const [status, setStatus] = useState('Initializing...');
  const [devices, setDevices] = useState([]);
  const [capture, setCapture] = useState(null);

  useEffect(() => {
    const appInfo = {
      appId: 'socketmobile.com.pitmanCreekTest',
      developerId: 'b564acca-1466-ef11-bfe3-000d3a3b1eff',
      appKey: 'MC4CFQDgxV/qKPNqscbNy7HU7qcGTQiKKQIVAI3YLjxeWfjpYKl6QqRGMqpTLBb5'
    };

    const newCapture = new window.SocketMobile.Capture();
    setCapture(newCapture);

    newCapture.open(appInfo, onCaptureEvent)
      .then((result) => {
        console.log("opening Capture result: ", result);
        updateStatus(`opening Capture result: ${result}`);
      })
      .catch((err) => {
        const finalErr = err.error || err;
        let val;
        if (finalErr === window.SocketMobile.SktErrors.ESKT_UNABLEOPENDEVICE) {
          val = "not able to connect to the service, is it running?" + ` ${finalErr}`;
        } else {
          val = `opening Capture error \n ${finalErr.code}: ${finalErr.message}`;
        }
        console.log(val);
        updateStatus(val, finalErr);
      });

    return () => {
      if (newCapture) {
        newCapture.close().catch(console.error);
      }
    };
  }, []);

  const updateStatus = (val, err) => {
    setStatus(val);
    if (err) {
      console.error(err);
    }
  };

  const onCaptureEvent = (e, handle) => {
    const { CaptureEventIds, Capture } = window.SocketMobile;
    if (!e) return;

    switch (e.id) {
      case CaptureEventIds.DeviceArrival:
        const newDevice = new Capture();
        const { guid, name } = e.value;
        newDevice.openDevice(guid, capture)
          .then((result) => {
            updateStatus(`result of opening ${name} : ${result}`);
            setDevices(prevDevices => [...prevDevices, { guid, name, handle: newDevice.clientOrDeviceHandle, device: newDevice }]);
          })
          .catch((err) => {
            updateStatus(`error opening a device: ${err}`);
          });
        break;

      case CaptureEventIds.DeviceRemoval:
        setDevices(prevDevices => {
          const removeDevice = prevDevices.find(d => d.guid === e.value.guid);
          if (!removeDevice) {
            updateStatus(`no matching devices found for ${e.value.name}`);
            return prevDevices;
          }
          removeDevice.device.close()
            .then((result) => {
              updateStatus(`result of closing ${removeDevice.name}: ${result}`);
            })
            .catch((err) => {
              updateStatus(`error closing a device: ${err}`, err);
            });
          return prevDevices.filter(x => x.guid !== removeDevice.guid);
        });
        break;

      case CaptureEventIds.DecodedData:
        const deviceSource = devices.find(d => d.handle === handle);
        if (!deviceSource) {
          updateStatus(`no matching devices found for handle ${handle}`);
        } else {
          const scannedData = String.fromCharCode.apply(null, e.value.data);
          onScannedCode(scannedData);
          updateStatus(`Scanned: ${scannedData}`);
        }
        break;

      default:
        console.log('Unhandled event:', e);
    }
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
    </div>
  );
};

SocketMobileScanner.propTypes = {
  onScannedCode: PropTypes.func.isRequired,
};

export default SocketMobileScanner;