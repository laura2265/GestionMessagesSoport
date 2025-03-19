import { useContext } from "react";
import './flowBuild.css'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import Cliente from '../../../assets/img/cliente.png'
import Empleado from '../../../assets/img/empleado.png'
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderDashboard from "../../navbar/SliderDashboard";
import { Link } from "react-router-dom";

function FlowsBuilder(){
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
                        <h1>Usuarios</h1>
                        <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                    </div>
                    
                    <div className="contentCardFlows">
                        <div>
                            <div className="cantidadCards">
                                <div className="cardFlow">
                                    <div className="contentImgFlows">
                                        <img src={Empleado} />
                                    </div>
                                    <div className="contentTextEm">
                                        <p>Empleados</p>
                                        <Link to='/data-empleado'>Ingresar</Link>
                                    </div>
                                </div>

                                <div className="cardFlow">
                                    <div className="contentImgFlows">
                                        <img src={Cliente} />   
                                    </div>
                                    <div className="contentTextEm">
                                        <p>Clientes</p>
                                        <Link to='/data-cliente'>Ingresar</Link>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default FlowsBuilder