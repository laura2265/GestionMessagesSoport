import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../../ThemeContext"
import Navbar from "../../../navbar/Navbar"
import SliderDashboard from "../../../navbar/SliderDashboard"
import ModoOscuro from "../../../../assets/img/modo-oscuro.png"
import ModoClaro from "../../../../assets/img/soleado.png"
import { useNavigate, useParams } from "react-router-dom"
import Actualizar from '../../../../assets/img/actualizar.png'

function ActualizarEmple(){
    const {theme, toggleTheme} = useContext(ThemeContext)
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
            area:"",
            cargo:"",
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
                        area: data.area,
                        cargo:data.cargo,
                        password: data.password,
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
                navigate('/data-empleado')
            }catch(error){
                console.error(`Error al momento de actualizar los datos del cliente: ${error}`)
            }
        }
    
    return(
        <>
        <div className={theme === 'light' ? 'app light':'app dark'}>
            <div className="slider">
                <Navbar />
                <div className="flex">
                    <SliderDashboard />
                </div>
            </div>
            
            <div className="BarraSuperior">
                <h1>Actualizar Empleado</h1>
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
                                type="number"
                                name='numberDocument'
                                className="inputContainerInput"
                                value={formDataUpdate.numberDocument}
                                onChange={formDataUpdate}
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
                                value={formDataUpdate.lasName}
                                onChange={handleUpdateChange}
                                className="inputContainerInput"
                                />
                                <label className="inputContainerLabel">Apellido</label>
                                <p></p>
                            </div>
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
                                value={formDataUpdate.phone}
                                onChange={handleUpdateChange}
                                name='phone'
                                className="inputContainerInput"
                                />
                                <label className="inputContainerLabel">Telefono</label>
                                <p></p>
                            </div>
                        </div>
                        <div className="content1F">
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
                                name='estado'
                                value={formDataUpdate.estado}
                                onChange={handleUpdateChange}
                                className="inputContainerInput"
                                />
                                <label className="inputContainerLabel">Estado</label>
                                <p></p>
                            </div>
                            <div className="inputContainer">
                                <input
                                type="text"
                                name='cargo'
                                value={formDataUpdate.cargo}
                                onChange={handleUpdateChange}
                                className="inputContainerInput"
                                />
                                <label className="inputContainerLabel">Cargo</label>
                                <p></p>
                            </div>
                            <div className="inputContainer">
                                <input
                                type="text"
                                name='area'
                                value={formDataUpdate.area}
                                onChange={handleUpdateChange}
                                className="inputContainerInput"
                                />
                                <label className="inputContainerLabel">Área</label>
                                <p></p>
                            </div>
                            <div className="inputContainer">
                                <input
                                type="password"
                                name='password'
                                value={formDataUpdate.password}
                                onChange={handleUpdateChange}
                                className="inputContainerInput"
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

export default ActualizarEmple
