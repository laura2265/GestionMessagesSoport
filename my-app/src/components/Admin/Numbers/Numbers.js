import { useContext } from "react";
import './number.css'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import Enviar from '../../../assets/img/enviar.png'
import Telefono from '../../../assets/img/llamada.png'
import Filter from '../../../assets/img/embudo.png'
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderDashboard from "../../navbar/SliderDashboard";

function Numbers(){
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
                        <h1>Numbers</h1>
                        <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                    </div>

                    <div className="contentBarraBusquedaNUmber">
                        <input placeholder="Search"/>
                        <button>Filtrar <img src={Filter} /></button>
                        <div className="susciberButton">
                            <button>Suscribir Numero</button>
                        </div>
                    </div>

                    <div className="contetnNumber">
                        <table className="">
                            <tr>
                                <th>Nombre</th>
                                <th>Area</th>
                                <th>Compability</th>
                                <th>Price</th>
                                <th>Status</th>
                            </tr>

                            <tr>
                                <td>hola</td>
                                <td>Lugar</td>
                                <td><img src={Telefono} /></td>
                                <td>hola</td>
                                <td>
                                    <div className="statusContent">
                                        <p>Activo</p>
                                    </div>
                                </td>
                                <td>hola</td>
                                <td>hola</td>
                            </tr>

                            <tr>
                                <td>hola</td>
                                <td>Lugar</td>
                                <td><img src={Telefono} /></td>
                                <td>hola</td>
                                <td>
                                    <div className="statusContent">
                                        <p>Activo</p>
                                    </div>
                                </td>
                                <td>hola</td>
                                <td>hola</td>
                            </tr>
                            
                            <tr>
                                <td>hola</td>
                                <td>Lugar</td>
                                <td><img src={Telefono} /></td>
                                <td>hola</td>
                                <td>
                                    <div className="statusContent">
                                        <p>Activo</p>
                                    </div>
                                </td>
                                <td>hola</td>
                                <td>hola</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Numbers