import { useContext, useEffect, useState } from "react";
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderEmploye from "../../navbar/SliderEmploye";
import ModoClaro from '../../../assets/img/soleado.png'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import './dashboardEmploye.css'
import DiagramaEmploye from "./diagramaEmploye";
import img3d from '../../../assets/img/img2-Photoroom.png'
import { useNavigate } from "react-router-dom";
import MessageChat from "../../MessageChat";

function DashboardEmploye(){
    
    const { theme, toggleTheme  } = useContext(ThemeContext);
    const [data, setData] = useState([]);
    const [messageStats, setMessageStats] = useState({});
    const [chatStats, setChatStats] = useState({});
    const [activeUsers, setActiveUsers ] = useState(0);
    const [ newUser, setNewUser ] = useState(0);
    const [ cancelledUser, setCancelledUser ] = useState(0);
    const navigate = useNavigate();
    const [ isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(()=>{
        const userId = localStorage.getItem('UserId')
        const rolUser = localStorage.getItem('rol-user')
        if(userId && rolUser){
            setIsLoggedIn(true)
        }else{
            setIsLoggedIn(false)
        }
    },[])

    useEffect(() => {
        const userId = localStorage.getItem('UserId')
        if(!userId){
            navigate('/login')
        }
    },[navigate])
    
    useEffect(() => {
        fetch('http://localhost:3001/api')
            .then(async response => {
                if (!response.ok) throw new Error('Error al consultar los datos de esta API');
                const result = await response.json();
                console.log("Datos obtenidos de la API:", result);
                setData(result);
                const messageCount = result.reduce((acc, item) => {
                    acc[item.Message] = (acc[item.Message] || 0) + 1;
                    return acc;
                }, {})
                const chatCount = result.reduce((acc, item) => {
                    acc[item.chatName] = (acc[item.chatName] || 0) + 1;
                    return acc;
                }, {})
                const totalMessages = result.length;
                setMessageStats(Object.fromEntries(
                    Object.entries(messageCount).map(([Message, count]) => [Message, (count / totalMessages * 100).toFixed(1)])
                ))
                setChatStats(Object.fromEntries(
                    Object.entries(chatCount).map(([chat, count]) => [chat, (count / totalMessages * 100).toFixed(1)])
                ))
                console.log("Estadísticas de mensajes:", messageStats);
                console.log("Estadísticas de chats:", chatStats); 
            })
            .catch(error => console.error('Error al obtener datos:', error));
    }, []);


    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="contentChanells1">
                    <div className="slider">
                        <Navbar />
                        <div className="flex">
                            <SliderEmploye />
                        </div>
                    </div> 
                    <div className="BarraSuperior">
                        <h1>Dashboard Empleado</h1>
                        <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                    </div>
                            <div className="contentEmployee">
                                <div className="contentDiagramEmploye">
                                <div className="graficos1">
                                <div className="diagrama11">
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
                                    <div className="contentDiagramEmploye">
                                        <div className="colorContentDark">
                                            <p>Porcentaje De Mensajes</p>
                                            <div className="diagrama22">
                                                <div className="digramContainer">
                                                    <DiagramaEmploye messageStats={messageStats} />
                                                </div>
                                                <img className="img3d1" src={img3d}></img>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tableContainer1">
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
                                                    <td>{item.cedula}</td>
                                                    <td>{item.chatName}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5">No hay datos disponibles</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {isLoggedIn && <MessageChat/>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default DashboardEmploye;
