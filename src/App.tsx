import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import SOS from './pages/SOS';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import Deudas from './pages/Deudas';
import Cave from './pages/Cave';
import Spoons from './pages/Spoons';
import Isochronic from './pages/Isochronic';

export default function App() {
  return (
    <AppProvider>
      <Router basename="/neurodome">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/deudas" element={<Deudas />} />
            <Route path="/cave" element={<Cave />} />
            <Route path="/spoons" element={<Spoons />} />
            <Route path="/isochronic" element={<Isochronic />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </AppProvider>
  );
}
