import React, {useContext, useState}from 'react';
import './nosotros.css'; // Importar estilos específicos para Home
import { Link } from 'react-router-dom';
import ThemeContext from '../ThemeContext';
import '../../index.css'
import '../../styles/App.css'
import ModoClaro from '../../assets/img/soleado.png'
import ModoOscuro from '../../assets/img/modo-oscuro.png'
import User from '../../assets/img/dos-personas.png'

function Nosotros() {
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
            <Link to="/">Nosotros</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </Link>
          </div>

          <div className="menu-icon" onClick={toggleMenu}>
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </div>
        </nav>

        <div className='contentHome'>
          <div class="home-info">
          <h1>Nosotros</h1>
            <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor, molestias animi delectus exercitationem ducimus repudiandae nulla nostrum quibusdam a vitae quas dolorem magni ipsam consequatur labore ad!</p>
          </div>

          <div className='contentInfo'>

            <div className='cardMap'>
                <div className='contentTextMap'>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.144014785908!2d-74.13362643964794!3d4.568127226879952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9f366d92bf87%3A0xc65c88fe51b5cae!2sCablemas%20Bogota!5e0!3m2!1ses!2sco!4v1729708927019!5m2!1ses!2sco"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div> 
            </div>

            <div className='cardMap'>
              <img src={User} />
              <div className='contentTextInfo'>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam eaque necessitatibus dolor</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Nosotros;
