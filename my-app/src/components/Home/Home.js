import React, {useContext, useState}from 'react';
import './Home.css'; 
import { Link } from 'react-router-dom';
import ThemeContext from '../ThemeContext';
import '../../index.css';
import '../../styles/App.css';
import ModoClaro from '../../assets/img/soleado.png';
import ModoOscuro from '../../assets/img/modo-oscuro.png';
import User from '../../assets/img/dos-personas.png';
import SoportChat from '../SoportChat/SoportChat';
import { FaWifi, FaBuilding, FaSitemap, FaTags, FaPhoneAlt } from 'react-icons/fa';

function Home() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='home-container'>
      <div className={theme === 'light' ? 'app light' : 'app dark'}>
        <nav className="navbar1">
          <div className="navbar-logo">
            <h2></h2>
          </div>

          <div className={`nav-links ${isOpen ? 'open' : ''}`}>
            <Link to="/">Home</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </Link>
          </div>

          <div className="menu-icon" onClick={toggleMenu}>
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </div>
        </nav>

        <div className='contentHome'>
          <div className="home-info">
          <h1>🚀 Bienvenido a Cablemas</h1>
            <p>Conectando tu Mundo</p>
          </div>

          <div className='contentInfo'>
            <div className='content1cards'>
              <div className='cardInfo'>
                <FaWifi />
                <div className='contentTextInfo'>
                    <p>Internet de alta velocidad, Televisión digital, Servicios de telecomunicaciones, Desarrollo de software.</p>
                </div>
              </div>

              <div className='cardInfo'>
                <FaBuilding />
                <div className='contentTextInfo'>
                    <p>Sede principal en el barrio San Carlos, Ciudad Bolívar. Horario: Lunes a Viernes de 8:00 AM a 6:00 PM, Sábados de 9:00 AM a 2:00 PM.</p>
                </div>
              </div>

              <div className='cardInfo'>
                <FaSitemap/>
                <div className='contentTextInfo'>
                    <p>Cablemas, SuperTV, Software Redes y Telecomunicaciones.</p>
                </div>
              </div>
            </div>

            <div className='content1cards'>
              <div className='cardInfo'>
                <FaTags />
                <div className='contentTextInfo'>
                    <p>Paquetes de Internet y televisión a precios accesibles. Descuentos especiales por contratación anual.</p>
                </div>
              </div>

              <div className='cardInfo'>
                <FaPhoneAlt />
                <div className='contentTextInfo'>
                    <p>WhatsApp: 300 123 4567<br/> Correo: soporte@cablemas.com <br/> Chat en línea disponible 24/7.</p>
                </div>  
              </div>
            </div>
          </div>
        </div>
        <div className='Schats'>
          <SoportChat/>
        </div>
      </div>
    </div>
  );
}

export default Home;
