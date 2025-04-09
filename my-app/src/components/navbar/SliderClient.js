import { Link, useNavigate } from "react-router-dom";

function SliderClient(){
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('UserId');
        navigate('/login');
    }

    return(
        <>
        <div className="slider">
            <ul>
                <li>
                    <input className="InputBuscar" placeholder='🔍 Buscar' />
                </li>
                <li>
                    <Link to="/dashboard-client">Dashboard</Link>
                </li>
                <li>
                    <Link to="/perfil-user">Perfil</Link>
                </li>
                <li>
                    <Link to="/conversaciones">Historial De Mensajes</Link>
                </li>
                <li>
                    <Link to="/asesor-preferido">Asesores Contactados</Link>
                </li>
                <li>
                    <button className="cerrarSesion" onClick={handleLogout}>Cerrar Sesión</button>
                </li>
            </ul>
        </div>
        </>
    )
}

export default SliderClient;