import { useContext } from "react";
import './chanels.css'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import imagen from '../../../assets/img/imagen.avif'
import imagen2 from '../../../assets/img/imagen2.webp'
import imagen3 from '../../../assets/img/imagen3.jpg'
import imagen4 from '../../../assets/img/imagen4.avif'
import sms from '../../../assets/img/sms.png'
import llamada from '../../../assets/img/llamada.png'
import whatsapp from '../../../assets/img/whatsapp.png'
import gmail from '../../../assets/img/gmail.png'
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderDashboard from "../../navbar/SliderDashboard";

function Chanells(){
    const { theme, toggleTheme  } = useContext(ThemeContext);
    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="contentChanells1">
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderDashboard />
                        <div className="contentNav"></div>
                    </div>
                </div> 
                <div className="BarraSuperior">
                    <h1>Canales</h1>
                    <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                </div>
                <div className="barraOpcines">
                    <button>overflow</button>
                    <button>otro</button>
                </div>
                <div className="contentChanells">
                    <div className="cardsChanells">
                        <div className="contentCardChanel">
                            <img src={imagen}></img>
                            <div className="contentTextChanell">
                                <img src={sms} />
                                <p>Sms</p>
                                <div className="buttonActive">
                                    <p>Active</p>
                                </div>
                            </div>
                            <p>Lorem ipsum dolor, sit amet </p>
                            <div className="buttonChanels">
                                <button>Message</button>
                                <button>Pricing</button>
                            </div>
                        </div>
                    </div>
                    <div className="cardsChanells">
                        <div className="contentCardChanel">
                            <img src={imagen3} />
                            <div className="contentTextChanell">
                                <img src={llamada} />
                                <p>Voice</p>
                                <div className="buttonActive">
                                    <p>Active</p>
                                </div>
                            </div>
                            <p>Lorem ipsum dolor, sit amet </p>
                            <div className="buttonChanels">
                                <button>Message</button>
                                <button>Pricing</button>
                            </div>
                        </div>
                    </div>
                    <div className="cardsChanells">
                        <div className="contentCardChanel">
                            <img src={imagen2} />
                            <div className="contentTextChanell">
                                <img src={whatsapp} />
                                <p>whatsapp</p>
                                <div className="buttonActive">
                                    <p>Active</p>
                                </div>
                            </div>
                            <p>Lorem ipsum dolor, sit amet </p>
                            <div className="buttonChanels">
                                <button>Message</button>
                                <button>Plan</button>
                            </div>
                        </div>
                    </div>
                    <div className="cardsChanells">
                        <div className="contentCardChanel">
                            <img src={imagen4} />
                            <div className="contentTextChanell">
                                <img src={gmail} />
                                <p>Email</p>
                                <div className="buttonActive">
                                    <p>Active</p>
                                </div>
                            </div>
                            <p>Lorem ipsum dolor, sit amet </p>
                            <div className="buttonChanels">
                                <button>Message</button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    )
}
export default Chanells