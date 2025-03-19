import React, { useState, useContext, useEffect } from "react";
import './dashboard.css';
import ModoOscuro from '../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../assets/img/soleado.png';
import canasta from '../../../assets/img/canasta-de-ropa.png';
import flecha from '../../../assets/img/flecha-arriba-derecha.png';
import cargando from '../../../assets/img/cargando.png';
import grafico from '../../../assets/img/grafico-de-lineas.png';
import img3d from '../../../assets/img/img2-Photoroom.png';
import Diagrama from "./Diagrama";
import { manyChatToken, ApiKeyWisphub } from '../../../config/config'
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderDashboard from "../../navbar/SliderDashboard";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [data, setData] = useState([]);
    const [messageStats, setMessageStats] = useState({});
    const [chatStats, setChatStats] = useState({});
    const [activeUsers, setActiveUsers ] = useState(0)
    const [ newUser, setNewUser ] = useState(0)
    const [ cancelledUser, setCancelledUser ] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        fetch('http://localhost:3001/api')
            .then(async response => {
                if (!response.ok) throw new Error('Error al consultar los datos de esta API');
                const result = await response.json();
                setData(result)

                const messageCount = result.reduce((acc, item) => {
                    acc[item.Message] = (acc[item.Message] || 0) + 1;
                    return acc;
                }, {});
                
                const chatCount = result.reduce((acc, item) => {
                    acc[item.chatName] = (acc[item.chatName] || 0) + 1;
                    return acc;
                }, {});

                const totalMessages = result.length;
                setMessageStats(Object.fromEntries(
                    Object.entries(messageCount).map(([message, count]) => [message, (count / totalMessages * 100).toFixed(1)])
                ));

                setChatStats(Object.fromEntries(
                    Object.entries(chatCount).map(([chat, count]) => [chat, (count / totalMessages * 100).toFixed(1)])
                ));

                console.log("Estadísticas de mensajes:", messageStats);
                console.log("Estadísticas de chats:", chatStats); 
            }).catch(error => console.error('Error al obtener datos:', error));
    }, []);

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
                        <SliderDashboard />
                        <div className="contentNav"></div>
                    </div>
                </div>

                <div className="dashboarContainer">
                    
                    <div className="contentGrafic1">
                        <div className="BarraSuperior">
                            <h1>Dashboard</h1>
                            <a className='ButtonTheme' onClick={toggleTheme}><img src={theme === 'light' ? ModoClaro : ModoOscuro} alt="Toggle Theme" /></a>
                        </div>

                        <div className="graficos">
                            <div className="diagrama1">
                                <div className="sub_board">
                                <h3 className="t_grafica">Distribución de Chats</h3>
                                <div className="graf_board">
                                    {Object.entries(chatStats).map(([chat, percentage]) => (
                                        <div className="barra" key={chat}>
                                            <div className="sub_barra" style={{ height: `${percentage}%`}}>
                                                <div className="tag_g">{percentage}%</div>
                                                <div className="tag_leyenda">{chat}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                    <div className="cont_board">
                                        <div className="graf_board">
                                            {Object.entries(messageStats).map(([message, percentage], index) => (
                                                <div className="barra" key={index}>
                                                    <div className="sub_barra" style={{ height: `${percentage}%` }}>
                                                        <div className="tag_g">{percentage}%</div>
                                                        <div className="tag_leyenda1">{message}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="tag_board">
                                            <div className="sub_tag_board">
                                                <div>100</div>
                                                <div>90</div>
                                                <div>80</div>
                                                <div>70</div>
                                                <div>60</div>
                                                <div>50</div>
                                                <div>40</div>
                                                <div>30</div>
                                                <div>20</div>
                                                <div>10</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sep_board"></div>
                                </div>
                            </div>

                            <div className="contenteDiagrams">
                                <div className="contentDiagram">
                                    <div className="diagrama2">
                                        <div className="digramContainer">
                                            <Diagrama messageStats={messageStats} />
                                        </div>
                                        <img className="img3d" src={img3d} alt="3D Image" />
                                        <div className="contentDiagram4">
                                            <div className="diagrama4">
                                                <div className="content1">
                                                    <h5>activar usuario</h5>
                                                    <h3>{activeUsers} </h3>
                                                </div>
                                                <div className="content2">
                                                    <h5>Nuevo usuario</h5>
                                                    <h3>{newUser}</h3>
                                                </div>
                                                <div className="content3">
                                                    <h5>usuarios cancelados</h5>
                                                    <h3> {cancelledUser} </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="tableContainer">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Message</th>
                                        <th>Cédula User</th>
                                        <th>Chat Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.id}</td>
                                                <td>{item.Name}</td>
                                                <td>{item.Message}</td>
                                                <td>{item.ProblemaInt}</td>
                                                <td>{item.chatName}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">No hay datos disponibles</td>
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

export default Dashboard;
