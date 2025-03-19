import { useContext } from "react";
import './directory.css'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderDashboard from "../../navbar/SliderDashboard";
import Cliente from '../../../assets/img/cliente.png';
import Empleado from '../../../assets/img/empleado.png';
import Message from "../../../assets/img/message.png";
import { Link } from "react-router-dom";

function Directory(){
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
                        <h1>Reportes</h1>
                        <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                    </div>

                    <div className="containerDirectory">
                        <div className="cuadroContentDirectory">
                            <div className="cardsReport">
                                <img className="imgClient" src={Cliente} />
                                <p>Reporte de los clientes activos he inactivos y los mensajes realizados por el clientes</p>
                                <div className="buttonReports">
                                    <Link className="buttonReport" to={'/report-client'}>Reportes</Link>
                                </div>
                            </div>
                            <div className="cardsReport">
                            <img className="imgClient" src={Empleado} />
                                <p>Reporte de los empleados activo he inactivos y que acciones realizo el empleado</p>
                                <div className="buttonReports">
                                    <Link className="buttonReport" to={'/report-emple'}>Reportes</Link>
                                </div>
                            </div>
                            <div className="cardsReport">
                            <img className="imgClient" src={Message} />
                                <p>Reporte de los chat gestionados y su historial de mensajes.</p>
                                <div className="buttonReports">
                                    <Link className="buttonReport" to={'/report-historyMessage'} >Reportes</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Directory