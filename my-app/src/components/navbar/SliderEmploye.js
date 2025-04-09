import { Link, useNavigate } from "react-router-dom";
import { IoIosChatboxes } from "react-icons/io";
import { IoMdExit } from "react-icons/io";

function SliderEmploye(){
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('UserId');
        localStorage.removeItem('rol-user');
        navigate('/login');
    }

    return(
        <>
            <div className="slider">
                <ul>
                    <li>
                        <Link to="/dashboard-employe">
                            <span className="icon">📊</span>
                            <span className="text">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/cliente-data">
                            <span className="icon">👥</span>
                            <span className="text">Clientes</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/perfil-empleado">
                            <span className="icon">👤</span>
                            <span className="text">Perfil</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/chatBot-emple">
                            <span className="text">Chats</span>
                            <span className="icon"><IoIosChatboxes/></span>
                        </Link>
                    </li>
                    <li onClick={handleLogout}>
                        <span className="icon"><IoMdExit/></span>
                        <span className="textCerrarSesion">Cerrar Sesión</span>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default SliderEmploye