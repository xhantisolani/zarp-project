import './App.css';
import Header from './components/Header';
import { SendTransaction } from './components/sendTransaction';
import SwapTokens from './components/swapTokens';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <Header /> {}
        <Routes>
          <Route path="/" element={<SwapTokens />} />
          <Route path="/transfertokens" element={<SendTransaction />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
