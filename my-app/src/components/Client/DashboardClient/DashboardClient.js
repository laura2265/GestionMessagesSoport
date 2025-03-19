import { useEffect, useState, useContext } from "react";
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderClient from "../../navbar/SliderClient";
import './dashboardClient.css';
import ModoClaro from '../../../assets/img/soleado.png';
import ModoOscuro from '../../../assets/img/modo-oscuro.png';
import lista from '../../../assets/img/lista-de-verificacion.png';
import lista1 from '../../../assets/img/lista2.png';
import lista2 from '../../../assets/img/lista-de-verificacion2.png';
import filter from '../../../assets/img/embudo.png';
import { ApiKeyWisphub } from '../../../config/config.js';
import { useNavigate } from "react-router-dom";

function DashboardClient() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [data, setData] = useState([]);
    const [count, setCount] =useState()
    const [pagadas, setPagadas] = useState();
    const navigate = useNavigate()

    const cedula = '1012408418';
    const url = 'http://localhost:3001/clientes';

    useEffect(() => {
        const apiWisphub = async () => {
            try {
                const response = await fetch(`${url}`);
                if (!response.ok) throw new Error('Error al consultar los datos de la API de Wisphub');

                const data = await response.json();
                console.log('Respuesta de la API:', data);

               
                setData(data.servicios || []);
                
                const pagosPendientes = data.servicios.filter(service => service.estado_facturas === 'Pendiente de Pago');
                const pagados = data.servicios.filter(service => service.estado_facturas === 'Pagadas') 

                setCount(pagosPendientes.length)
                setPagadas(pagados.length)

            } catch (error) {
                console.error('Error al consultar los datos de la API', error);
            }
        };
        apiWisphub();
    }, [cedula]);

    useEffect(() => {
            const userId = localStorage.getItem('UserId')
            if(!userId){
                navigate('/login')
            }
        },[navigate])
    return (
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderClient />
                    </div>
                </div>
                <div className="ContentDashboard">
                    <div className="BarraSuperior">
                        <h1>Dashboard cliente</h1>
                        <a className='ButtonTheme' onClick={toggleTheme}><img src={theme === 'light' ? ModoClaro : ModoOscuro} alt="Toggle Theme" /></a>
                    </div>
                    <div className="contentClient">
                        <div className="contentCardsD">
                            <div className="cardF">
                                <div className="contentImg1">
                                    <img src={lista} alt="Facturas recibidas" />
                                </div>
                                <p className="textoP"> {pagadas} </p>
                                <p>Facturas Pagadas</p>
                            </div>
                            <div className="cardP">
                                <div className="contentImg1">
                                    <img src={lista1} alt="Pagos Pendientes" />
                                </div>
                                <p className="textoP">{count} </p>
                                <p>Pagos Pendientes</p>
                            </div>
                            <div className="cardV">
                                <div className="contentImg1">
                                    <img src={lista2} alt="Facturas Vencidas" />
                                </div>
                                <p className="textoP">0</p>
                                <p>Facturas Vencidas</p>
                            </div>
                        </div>
                        <div className="historialFacturas">
                            <div className="buttonFilter">
                                <h4>Servicios Del Usuario</h4>
                                <button>Filtrar <img src={filter} alt="Filtrar" /></button>
                            </div>
                            <br />
                            <table>
                                <thead>
                                    <tr>
                                        <th>Cedula</th>
                                        <th>Nombre Titular</th>
                                        <th>Estado</th>
                                        <th>Fecha De Vencimiento</th>
                                        <th>Estado De Factura</th>
                                        <th>Costo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(data) && data.length > 0 ? (
                                        data.map((service, i) => (
                                            <tr key={i}>
                                                <td>{service.cedula}</td>
                                                <td>{service.nombre}</td>
                                                <td>{service.estado}</td>
                                                <td>{service.fecha_corte}</td>
                                                <td>{service.estado_facturas}</td>
                                                <td>{service.precio_plan}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">Cargando Datos...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DashboardClient;
