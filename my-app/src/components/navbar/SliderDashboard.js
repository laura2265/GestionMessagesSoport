import { useContext } from "react"
const { Link, useNavigate } = require("react-router-dom")

const  SliderDashboard = () => {

    const navigate = useNavigate(); 

    const handleLogout = () => {
        localStorage.removeItem('UserId')
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
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/flow-build">Usuarios</Link>
                </li>
                <li>
                    <Link to="/directorio">Reportes</Link>
                </li>
                <li>
                    <Link to="/perfil-Admin">Perfil</Link>
                </li>
                <li>
                    <Link to="/numbers">Configuración</Link>
                </li>
                <li>
                    <button className="cerrarSesion" onClick={handleLogout}>Cerrar Sesión</button>
                </li>
            </ul>
        </div>
        </>
    )
}

export default SliderDashboard