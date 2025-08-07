
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={<Auth />} />
        <Route path='/' element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;