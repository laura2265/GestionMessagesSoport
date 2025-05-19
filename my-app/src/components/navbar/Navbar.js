import { useContext } from 'react';
import ThemeContext from '../ThemeContext'; 
const ModoOscuro = require('../../assets/img/modo-oscuro.png');
const ModoClaro = require('../../assets/img/soleado.png');
const imgIcon = require('../../assets/img/imgIcon.ico')

const Navbar = () => {
  return (
    <>
      <div className="navbar">
        <img className='navImg' src={imgIcon} />
      </div>
    </>
  );
};

export default Navbar;
