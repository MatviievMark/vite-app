import { useState } from 'react';
import { useZxing } from 'react-zxing';
import PropTypes from 'prop-types';

const PhoneScanner = ({ onScannedCode }) => {
  const [error, setError] = useState('');

  const { ref } = useZxing({
    onDecodeResult(result) {
      onScannedCode(result.getText());
    },
    onError(error) {
      setError(error.message);
    },
  });

  return (
    <div>
      <h2>Phone Camera Scanner</h2>
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <video ref={ref} style={{ width: '100%' }} />
      </div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p>Position the barcode within the camera view to scan.</p>
    </div>
  );
};

PhoneScanner.propTypes = {
  onScannedCode: PropTypes.func.isRequired,
};

export default PhoneScanner;