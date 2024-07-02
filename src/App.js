import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Kalendorius from './Kalendorius/Kalendorius';
import NavBar from './NavBar/NavBar';
import colors from './colors';
import Login from './Login/Login';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  function componentDidMount() {
    document.documentElement.style.setProperty('--lightBlue', colors.lightBlue);
    document.documentElement.style.setProperty('--orange', colors.orange);
    document.documentElement.style.setProperty('--brown', colors.brown);
    document.documentElement.style.setProperty('--green', colors.green);
    document.documentElement.style.setProperty('--darkGreen', colors.darkGreen);
    document.documentElement.style.setProperty('--darkBlue', colors.darkBlue);
    document.documentElement.style.setProperty('--sand', colors.sand);
    document.documentElement.style.setProperty('--darkSand', colors.darkSand);
    document.documentElement.style.setProperty('--sky', colors.sky);
    document.documentElement.style.setProperty('--grey', colors.grey);
  }

  componentDidMount();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/kalendorius" element={isAuthenticated ? <Kalendorius /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
