import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../ThemeContext"
import Navbar from "../../navbar/Navbar"
import SliderEmploye from "../../navbar/SliderEmploye"
import Actualizar from '../../../assets/img/actualizar.png'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import { useNavigate, useParams } from "react-router-dom"
import MessageChat from "../../MessageChat"

function ActualizaClientData (){
    const {theme, toggleTheme} = useContext(ThemeContext)
    const {id} = useParams();
    const navigate = useNavigate()
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

    const [formDataUpdate, setFormDataUpdate] = useState({
        tipoDocument: '',
        numberDocument:'',
        name: '',
        lasName:'',
        email:'',
        direccion:'',
        phone: '',
        estado: '',
        password: ''
    })

    useEffect(()=>{
        const fetchDataClient = async ()=>{
            try{
                const response = await fetch(`http://localhost:3001/user/${id}`,{
                    method:'GET'
                })
                if(!response.ok){
                    throw new Error(`Error al momento de consultar los datos del ID: ${id}`)
                }

                const result = await response.json()
                const data = result.data;
                console.log('el usuario por id es: ', data)

                setFormDataUpdate({
                    tipoDocument: data.tipoDocument,
                    numberDocument: data.numberDocument,
                    name: data.name,
                    lasName: data.lasName,
                    email: data.email,
                    direccion: data.direccion,
                    phone: data.telefono,
                    estado: data.estado,
                    password: data.password
                })
            }catch(error){
                console.log('Error al momento de consultar los datos: ', error)
            }
        }
        fetchDataClient()
    },[id])

    const handleUpdateChange = (e) => {
        const {name, value}= e.target;
        setFormDataUpdate({
            ...formDataUpdate,
            [name]: value
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            const response = await fetch(`http://localhost:3001/user/${id}`,{
                method:'PUT',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataUpdate)
            })
            if(!response.ok){
                throw new Error(`Error al momento de actualizar los datos del ID: ${id}`)
            }
            const data = await response.json()
            console.log('Datos actualizados: ', data)
            alert('Datos actualizados correctamente');
            navigate('/cliente-data')
        }catch(error){
            console.error('Error al momeno de actualizar los datos del cliente: ', error)
        }
    }
    return(
        <>
            <div className={theme === 'light' ? 'app light': 'app dark'}>
                <div className="slider">
                    <Navbar/>
                    <div className="flex">
                        <SliderEmploye/>
                    </div>
                </div>
                <div className="BarraSuperior">
                    <h1>Actualizar Cliente</h1>
                    <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                </div>
                <div className="contentUpdateClient">
                    <form onSubmit={handleSubmit}>
                        <img className="imgCreated" src={Actualizar} />
                        <div className="contentForm1Created">
                            <div className="content1F">
                                <div className="inputContainer">
                                    <select
                                      className='inputContainerInput'
                                      name='tipoDocument'
                                      value={formDataUpdate.tipoDocument}
                                      onChange={handleUpdateChange}
                                      >
                                        <option value=''>-seleccione una opcion-</option>
                                        <option value='Cedula Ciudadania'>Cedula Ciudadania</option>
                                        <option value='Cedula Extrangeria'>Cedula De Extrangeria</option>
                                        <option value='Pasaporte'>Pasaporte</option>
                                    </select>
                                    <label className="inputContainerLabel">Tipo de Documento</label>
                                    <p></p>
                                </div>
                                <div className="inputContainer">
                                    <input
                                    type="text"
                                    name='numberDocument'
                                    className="inputContainerInput"
                                    value={formDataUpdate.numberDocument}
                                    onChange={handleUpdateChange}
                                    />
                                    <label className="inputContainerLabel">N° De Documento</label>
                                    <p></p>
                                </div>
                                <div className="inputContainer">
                                    <input
                                    type="text"
                                    name='name'
                                    value={formDataUpdate.name}
                                    onChange={handleUpdateChange}
                                    className="inputContainerInput"
                                    />
                                    <label className="inputContainerLabel">Nombre</label>
                                    <p></p>
                                </div>
                                <div className="inputContainer">
                                    <input
                                    type="text"
                                    name='lasName'
                                    className="inputContainerInput"
                                    value={formDataUpdate.lasName}
                                    onChange={handleUpdateChange}
                                    />
                                    <label className="inputContainerLabel">Apellido</label>
                                    <p></p>
                                </div>
                                
                            </div>
                            <div className="content1F">
                                <div className="inputContainer">
                                    <input
                                    type="text"
                                    name='email'
                                    value={formDataUpdate.email}
                                    onChange={handleUpdateChange}
                                    className="inputContainerInput"
                                    />
                                    <label className="inputContainerLabel">Email</label>
                                    <p></p>
                                </div>
                                <div className="inputContainer">
                                    <input
                                    type="text"
                                    name='phone'
                                    className="inputContainerInput"
                                    value={formDataUpdate.phone}
                                    onChange={handleUpdateChange}
                                    />
                                    <label className="inputContainerLabel">Telefono</label>
                                    <p></p>
                                </div> 
                                <div className="inputContainer">
                                    <input
                                    type="text"
                                    name='direccion'
                                    value={formDataUpdate.direccion}
                                    onChange={handleUpdateChange}
                                    className="inputContainerInput"
                                    />
                                    <label className="inputContainerLabel">Direccion</label>
                                    <p></p>
                                </div>
                                
                                <div className="inputContainer">
                                    <input
                                    type="text"
                                    name='password'
                                    className="inputContainerInput"
                                    value={formDataUpdate.password}
                                    onChange={handleUpdateChange}
                                    />
                                    <label className="inputContainerLabel">Contraseña</label>
                                    <p></p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="buttonUpdate">
                            <button type="submit" className="InputButton">Actualizar</button>
                        </div>
                    </form>
                    
                    {isLoggedIn && <MessageChat/>}
                </div>
            </div>
        </>
    )
}

export default ActualizaClientData