import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../ThemeContext"
import Navbar from "../../navbar/Navbar";
import SliderEmploye from "../../navbar/SliderEmploye";
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import Message from "../../../assets/img/charlando.png";
import Documents from '../../../assets/img/documentos.png'
import Reloj from '../../../assets/img/atras-en-el-tiempo.png';
import User from '../../../assets/img/dos-personas1.png'
import Bot from '../../../assets/img/bot.png'
import { Link } from "react-router-dom";
import MessageChat from "../../MessageChat";
import './chatBotEmple.css'

function ChatBotEmple (){
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [totalSessions, setTotalSessions] = useState(0);
    const [ totalMessages, setTotalMessages ] = useState(0);
    const [ averageSessionTime,  setAverageSessionTime ] = useState(0);
    const [uniqueCustomers, setUniqueCustomers] = useState(0);
    const [data, setData] = useState([]);
    const [ isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(()=>{
        const userId = localStorage.getItem('UserId');
        const rolUser = localStorage.getItem('rol-user');
        if(userId && rolUser){
            setIsLoggedIn(true);
        }else{
            setIsLoggedIn(false);
        }
    },[])

    useEffect(() => {
        fetch('http://localhost:3001/asignaciones/')
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Error al consultar los datos de Mongo');
                }
                const result = await response.json();
    
                const dataA = result?.data?.docs || []; 
                setData(dataA);
    
                const EmpleID = localStorage.getItem('UserId');
                console.log("ID del empleado:", EmpleID);
    
                const empleid = dataA.filter((emple) => emple.idEmple === EmpleID);
                if (empleid.length > 0) {
                    console.log("Se asignaron empleados:", empleid);
                    setTotalSessions(empleid.length);
                } else {
                    console.log("No hay usuarios asignados");
                }
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error.message);
            });
    }, []);
    

    return(
        <>
            <div className={theme === 'light' ? 'app light': 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderEmploye />
                    </div>
                </div>
                <div className="BarraSuperior">
                    <h1>Chats</h1>
                    <a className="ButtonTheme1" onClick={toggleTheme}>
                        <img src={theme === 'light'? ModoClaro : ModoOscuro} />
                    </a>
                </div>

                <div className="cardsInfo">
                    <div className="cardInfo1">
                        <div className="contImgInfo">
                            <img src={Documents}></img>
                        </div>
                        <div className="contentInfoNumber">
                            <h1>{totalSessions}</h1>
                            <p>Total Sesiones</p>
                        </div>
                    </div>

                    <div className="cardInfo1">
                        <div className="contImgInfo">
                            <img src={Message}></img>
                        </div>
                        <div className="contentInfoNumber">
                            <h1>{totalMessages}</h1>
                            <p>Total Mensajes</p>
                        </div>
                    </div>

                    <div className="cardInfo1">
                        <div className="contImgInfo">
                            <img src={Reloj}></img>
                        </div>
                        <div className="contentInfoNumber">
                            <h1>{averageSessionTime}</h1>
                            <p>Tiempo Promedio de Sesión</p>
                        </div>
                    </div>

                    <div className="cardInfo1">
                        <div className="contImgInfo">
                            <img src={User}></img>
                        </div>
                        <div className="contentInfoNumber">
                            <h1>{uniqueCustomers}</h1>
                            <p>Clientes Únicos</p>
                        </div>
                    </div>
                </div>
                <div className="contChat">
                    <img src={Bot} />
                    <a>Crear Nuevo Bot</a>
                </div>
                <div className="contCards">
                    <div className="cards1">
                        <div className="contentCards1">
                            <div className="contentFlex">
                                <div className="contenttexto1">
                                    <img src={Bot} />
                                    <p>Whatsapp</p>
                                </div>
                                <div className="contentLink">
                                    <Link to='/whatsapp-emple'>Ingresar</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cards1">
                        <div className="contentCards1">
                            <div className="contentFlex">
                                <div className="contenttexto1">
                                    <img src={Bot} />
                                    <p>Messenger</p>
                                </div>
                                <div className="contentLink">
                                    <Link to='/messenger-emple'>Ingresar</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cards1">
                        <div className="contentCards1">
                            <div className="contentFlex">
                                <div className="contenttexto1">
                                    <img src={Bot} />
                                    <p>Telegram</p>
                                </div>
                                <div className="contentLink">
                                    <Link to='/telegram-emple'>Ingresar</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cards1">
                        <div className="contentCards1">
                            <div className="contentFlex">
                                <div className="contenttexto1">
                                    <img src={Bot} />
                                    <p>Instagram</p>
                                </div>
                                <div className="contentLink">
                                    <Link to='/instagram-emple'>Ingresar</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isLoggedIn && <MessageChat/>}
                </div>
            </div>
        </>
    )
}

export default ChatBotEmple