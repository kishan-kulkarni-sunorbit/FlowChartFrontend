// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loginpage from './pages/Loginpage/Loginpage';
import FlowchartList from './component/FlowchartList/FlowchartList'; // 👈 import this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loginpage />} />
        <Route path="/flowcharts" element={<FlowchartList />} /> {/* 👈 new route */}
      </Routes>
    </Router>
  );
}

export default App;
