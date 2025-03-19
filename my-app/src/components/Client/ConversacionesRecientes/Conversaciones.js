import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderClient from "../../navbar/SliderClient";
import User from '../../../assets/img/usuario1.png'
import './conversaciones.css'
import Watsapp from '../../../assets/img/whatsapp.png'
import Messenger from '../../../assets/img/mensajero.png'
import Telegram from '../../../assets/img/telegrama.png'
import Instagram from '../../../assets/img/instagram.png'
import { Link } from "react-router-dom";
import ModoClaro from '../../../assets/img/soleado.png'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'


function Conversaciones() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderClient />
                    </div>
                </div>
                <div className="BarraSuperior">
                        <h1>Conversaciones Importantes</h1>
                        <a className='ButtonTheme' onClick={toggleTheme}><img src={theme === 'light' ? ModoClaro : ModoOscuro} alt="Toggle Theme" /></a>
                    </div>
                <div className="contentMessages">
                    <div className="contentHistorialM">
                        <div className="contentMessageH">
                            <div className="contentMessageW">
                                <img src={Watsapp} />
                                <p>Watsapp</p>
                                <Link>Ver</Link>
                            </div>
                        </div>
                        <div className="contentMessageH">
                            <div className="contentMessageW">
                                <img src={Messenger} />
                                <p>Messenger</p>
                                <Link to='chats-messenger'>Ver</Link>
                            </div>
                        </div>
                        <div className="contentMessageH">
                            <div className="contentMessageW">
                                <img src={Telegram} />
                                <p>Telegram</p>
                                <Link>Ver</Link>
                            </div>
                        </div>
                        <div className="contentMessageH">
                            <div className="contentMessageW">
                                <img src={Instagram} />
                                <p>Instagram</p>
                                <Link>Ver</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Conversaciones;
