import { useEffect, useState, useContext } from "react";
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderClient from "../../navbar/SliderClient";
import User from '../../../assets/img/usuario1.png';
import './perfil.css';
import { Link, useParams } from "react-router-dom";
import ModoClaro from '../../../assets/img/soleado.png'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'

function PerfilUser() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [ dataUser, setDataUser ] = useState([]);
    const {id} = useParams()

    useEffect(()=>{
        const getDataUser = async () =>{
            const userId = localStorage.getItem('UserId')
            try{
                const response = await fetch(`http://localhost:3001/user/${userId}`, {
                    method: 'GET'
                })
                if(!response.ok){
                    throw new Error(`Error al momento de  cosultar los datos del usuario con ID: ${userId}`)
                }
                const result = await response.json()
                console.log(`Los datos del usuario son: ${result}`)
                const data = result.data;

                setDataUser({
                    id: data._id,
                    tipoDocument: data.tipoDocument,
                    numeroDocumento: data.numberDocument,
                    nombre: data.name,
                    apellido: data.lasName,
                    email: data.email,
                    telefono: data.telefono,
                    direccion: data.direccion,
                    estado: data.estado,
                    password: data.password,
                })
            }catch(error){
                console.error(`Error al momento de consultar los datos del usuario ${error}`)
            }
        }
        getDataUser()
    },[])

    return (
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderClient />
                    </div>
                </div>
                <div className="BarraSuperiorP">
                        <h1>{dataUser.nombre} {dataUser.apellido}</h1>
                        <a className='ButtonTheme' onClick={toggleTheme}><img src={theme === 'light' ? ModoClaro : ModoOscuro} alt="Toggle Theme" /></a>
                    </div>
                <div className="contentPerfil">
                    <img src={User} alt="Perfil del usuario" />
                    <div className="contentInfoGeneralP">
                        <div className="contentInfoP">
                            <div className="contentInfo2P">
                                <p><strong>Tipo De Documento</strong> <br />{dataUser.tipoDocument} <br /></p>
                                <p><strong>Numero De Documento</strong><br /> {dataUser.numeroDocumento} <br /></p>
                                <p><strong>Email</strong> <br /> {dataUser.email}  <br /></p>
                                <p><strong>Telefono </strong><br /> {dataUser.telefono}<br /></p>
                            </div>
                            <div className="contentInfo2P">
                                <p><strong>Direccion </strong><br /> {dataUser.direccion} <br /></p>
                                <p><strong>Estado </strong><br /> {dataUser.estado} <br /></p>
                                <p><strong>Contraseña</strong><br /> {dataUser.password} <br /></p>
                            </div> 
                        </div>
                        <div className="redirect1">
                            <Link to={`/editar-perfil/${dataUser.id}`}>Editar</Link>
                        </div>
                        
                    </div>
                </div>
            </div>
        </>
    );
}


export default PerfilUser;
