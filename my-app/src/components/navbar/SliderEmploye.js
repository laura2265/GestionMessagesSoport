import { Link, useNavigate } from "react-router-dom";

function SliderEmploye(){
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('UserId');
        localStorage.removeItem('rol-user')
        navigate('/login')
    }
    
    return(
        <>
            <div className="slider">
            <ul>
                <li>
                    <input className="InputBuscar" placeholder='🔍 Buscar' />
                </li>
                <li>
                    <Link to="/dashboard-employe">Dashboard</Link>
                </li>
                <li>
                    <Link to="/cliente-data">Clientes</Link>
                </li>
                <li>
                    <Link to="/perfil-empleado">Perfil</Link>
                </li>
                <li>
                    <Link to="/chatBot-emple">Chats</Link>
                </li>
                <li>
                    <button className="butonClose" onClick={handleLogout}>Cerrar Sesión</button>
                </li>
            </ul>
        </div>
        </>
    )
}

export default SliderEmploye