import "./App.css";
import Header from "./components/Header";
import { SendTransaction } from "./components/sendTransaction";
import SwapTokens from "./components/swapTokens";
import { ScreenBack } from "./index";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; // Import the Navigate component
import { NavLink } from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <div>
          <Header />
          <Routes>
            <Route path="/swaptokens" element={<SwapTokens />} />
            <Route path="/transfertokens" element={<SendTransaction />} />
            <Route path="/" element={<Navigate to="/swaptokens" />} />
          </Routes>
        </div>
        <ScreenBack />
      </Router>
    </div>
  );
}

export default App;
