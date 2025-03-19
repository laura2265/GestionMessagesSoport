
import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../../ThemeContext"
import Navbar from "../../../navbar/Navbar"
import SliderDashboard from "../../../navbar/SliderDashboard"
import './clients.css'
import ModoClaro from "../../../../assets/img/soleado.png"
import ModoOscuro from "../../../../assets/img/modo-oscuro.png"
import { useNavigate, useParams } from "react-router-dom"
import Actualizar from "../../../../assets/img/actualizar.png"

function ActualizarClient(){
    const { theme, toggleTheme } = useContext(ThemeContext)
    const { id } = useParams();
    const navigate = useNavigate()

    const [formDataUpdate, setFormDataUpdate] = useState({
        tipoDocument : "",
        numberDocument: "",
        name: "",
        lasName: "",
        email: "",
        direccion: "",
        phone: "",
        estado: "",
        password: "",
    })

    useEffect(() => {
        const fetchDataClient = async () => {
            try{
                const response = await fetch(`http://localhost:3001/user/${id}`, {
                    method: 'GET'
                })

                if(!response.ok){
                    throw new Error(`Error al consultar el usuario con ID: ${id}`)
                }

                const result = await response.json()
                const data = result.data
                console.log('el usuario por id es:', data)
                
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
                console.error('Error al momento de consultar los datos del cliente', error)
            }
        }
        fetchDataClient()
    }, [id])

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setFormDataUpdate({
            ...formDataUpdate,
            [name]: value,
        });
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        
        try{
            const response = await fetch(`http://localhost:3001/user/${id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formDataUpdate)
            })
            if(!response.ok){
                throw new Error(`Error al momento de actualizar al usuario con ID: ${id}`)
            }

            const data = await response.json()
            console.log('Datos actualizados: ', data)
            alert('Datos actualizados correctamente');
            navigate('/data-cliente')
        }catch(error){
            console.error(`Error al momento de actualizar los datos del cliente: ${error}`)
        }
    }

    return(
        <>
        <div className={theme === 'light'? 'app light' : 'app dark'}>
            <div className="slider">
                <Navbar />
                <div className="flex">
                    <SliderDashboard />
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
                                  value={formDataUpdate.tipoDocument}
                                  onChange={handleUpdateChange}
                                  name='tipoDocument'
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
                                className="inputContainerInput"
                                value={formDataUpdate.name}
                                onChange={handleUpdateChange}
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
                                className="inputContainerInput"
                                value={formDataUpdate.email}
                                onChange={handleUpdateChange}
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
                                className="inputContainerInput"
                                value={formDataUpdate.direccion}
                                onChange={handleUpdateChange}
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
            </div>
        </div>
        </>
    )
}

export default ActualizarClient