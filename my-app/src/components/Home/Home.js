import React, {useContext, useState}from 'react';
import './Home.css'; // Importar estilos específicos para Home
import { Link } from 'react-router-dom';
import ThemeContext from '../ThemeContext';
import '../../index.css'
import '../../styles/App.css'
import ModoClaro from '../../assets/img/soleado.png'
import ModoOscuro from '../../assets/img/modo-oscuro.png'
import User from '../../assets/img/dos-personas.png'
import SoportChat from '../SoportChat/SoportChat';

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
          <h1>Bienvenido a la pagina de inicio </h1>
            <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor, molestias animi delectus exercitationem ducimus repudiandae nulla nostrum quibusdam a vitae quas dolorem magni ipsam consequatur labore ad!</p>
          </div>

          <div className='contentInfo'>

            <div className='cardInfo'>
              <img src={User} />
              <div className='contentTextInfo'>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor</p>
              </div>
            </div>

            <div className='cardInfo'>
              <img src={User} />
              <div className='contentTextInfo'>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor</p>
              </div>
            </div>

            <div className='cardInfo'>
              <img src={User} />
              <div className='contentTextInfo'>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor</p>
              </div>
            </div>

            <div className='cardInfo'>
              <img src={User} />
              <div className='contentTextInfo'>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor</p>
              </div>
            </div>

            <div className='cardInfo'>
              <img src={User} />
              <div className='contentTextInfo'>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor</p>
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
