import './App.css';
import Header from './components/Header';
import { SendTransaction } from './components/sendTransaction';
import SwapTokens from './components/swapTokens';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Import the Navigate component

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/swaptokens" element={<SwapTokens />} />
          <Route path="/transfertokens" element={<SendTransaction />} />
          <Route path="/" element={<Navigate to="/swaptokens" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
