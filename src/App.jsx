import { useState } from 'react';
import SocketMobileScanner from './components/SocketMobileScanner';
import PhoneScanner from './components/PhoneScanner';

function App() {
  const [scanMethod, setScanMethod] = useState(null);
  const [scannedCode, setScannedCode] = useState(null);

  const handleScanMethodSelect = (method) => {
    setScanMethod(method);
    setScannedCode(null); // Reset scanned code when changing methods
  };

  const handleScannedCode = (code) => {
    setScannedCode(code);
    // We're not resetting scanMethod here to keep the scanner active
  };

  const handleScanAgain = () => {
    setScannedCode(null);
    // Keep the current scan method active
  };

  return (
    <div className="App">
      <h1>Barcode Scanner</h1>
      {!scanMethod && (
        <div>
          <button onClick={() => handleScanMethodSelect('phone')}>Scan with Phone</button>
          <button onClick={() => handleScanMethodSelect('scanner')}>Scan with Socket Mobile</button>
        </div>
      )}
      {scanMethod === 'phone' && (
        <PhoneScanner onScannedCode={handleScannedCode} />
      )}
      {scanMethod === 'scanner' && (
        <SocketMobileScanner onScannedCode={handleScannedCode} />
      )}
      {scannedCode && (
        <div>
          <h2>Scanned Code:</h2>
          <p>{scannedCode}</p>
          <button onClick={handleScanAgain}>Scan Again</button>
        </div>
      )}
      {scanMethod && (
        <button onClick={() => handleScanMethodSelect(null)}>Change Scan Method</button>
      )}
    </div>
  );
}

export default App;