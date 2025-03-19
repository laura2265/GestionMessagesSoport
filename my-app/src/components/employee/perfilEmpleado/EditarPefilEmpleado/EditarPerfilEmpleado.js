import { useContext, useEffect, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../navbar/Navbar";
import ModoClaro from '../../../../assets/img/soleado.png'
import ModoOscuro from '../../../../assets/img/modo-oscuro.png'
import SliderEmploye from "../../../navbar/SliderEmploye";
import MessageChat from "../../../MessageChat";

function EditarPerfilEmpleado() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const {id} = useParams();
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
            navigate('/perfil-empleado')
        }catch(error){
            console.error(`Error al momento de actualizar los datos del cliente: ${error}`)
        }
    }

    return (
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderEmploye />
                    </div>
                </div>
                <div className="BarraSuperiorP">
                        <h1>Editar Perfil</h1>
                        <a className='ButtonTheme' onClick={toggleTheme}><img src={theme === 'light' ? ModoClaro : ModoOscuro} alt="Toggle Theme" /></a>
                </div>
                <div className="contentActualizar">
                    <form onSubmit={handleSubmit}>
                        <div className="contentAct2">
                            <div className="contentAct">

                                <div className="contentInputAc">
                                    <label>Tipo de Documento</label>
                                    <select
                                        value={formDataUpdate.tipoDocument}
                                        onChange={handleUpdateChange}
                                        name='tipoDocument'
                                        >
                                          <option value=''>-seleccione una opcion-</option>
                                          <option value='Cedula Ciudadania'>Cedula Ciudadania</option>
                                          <option value='Cedula Extrangeria'>Cedula De Extrangeria</option>
                                          <option value='Pasaporte'>Pasaporte</option>
                                    </select>
                                </div>

                                <div className="contentInputAc">
                                    <label>Numero De Documento</label><br />
                                    <input
                                        name="numeroDocumento"
                                        value={formDataUpdate.numberDocument}
                                        onChange={handleUpdateChange}
                                        placeholder="Número de Documento"
                                        readOnly
                                    /><br />
                                </div>

                                <div className="contentInputAc">
                                    <label>Nombre</label><br />
                                    <input
                                        name="name"
                                        value={formDataUpdate.name}
                                        onChange={handleUpdateChange}
                                        placeholder="Nombre"
                                    /><br />
                                </div>

                                <div className="contentInputAc">
                                    <label>Apellido</label><br />
                                    <input
                                        name="lasName"
                                        value={formDataUpdate.lasName}
                                        onChange={handleUpdateChange}
                                        placeholder="Apellido"
                                    /><br />
                                </div>
                                

                                <div className="contentInputAc">
                                    <label>Email</label><br />
                                    <input
                                        name="email"
                                        placeholder="Email"
                                        value={formDataUpdate.email}
                                        onChange={handleUpdateChange}
                                    /><br />
                                </div>
                            </div>

                            <div className="contentAct">
                                <div className="contentInputAc">
                                    <label>Numero De Telefono</label><br />
                                    <input
                                        name="telefono"
                                        placeholder="Número de Teléfono"
                                        value={formDataUpdate.phone}
                                        onChange={handleUpdateChange}
                                    /><br />
                                </div>

                                <div className="contentInputAc">
                                    <label>Direccion</label><br />
                                    <input
                                        name="direccion"
                                        value={formDataUpdate.direccion}
                                        onChange={handleUpdateChange}
                                        placeholder="Dirección"
                                    /><br />
                                </div>

                                <div className="contentInputAc">
                                    <label>Area</label><br />
                                    <input
                                        name="area"
                                        value={formDataUpdate.area}
                                        onChange={handleUpdateChange}
                                        placeholder="Area"
                                    /><br />
                                </div>
                                <div className="contentInputAc">
                                    <label>Cargo</label><br />
                                    <input
                                        name="cargo"
                                        value={formDataUpdate.cargo}
                                        onChange={handleUpdateChange}
                                        placeholder="Cargo"
                                    /><br />
                                </div>

                                <div className="contentInputAc">
                                    <label>Contraseña</label><br />
                                    <input
                                        name="contraseña"
                                        value={formDataUpdate.password}
                                        onChange={handleUpdateChange}
                                        type="password"
                                        placeholder="Contraseña"
                                    /><br />
                                </div>

                            </div>
                        </div>
                        <button type="submit" className="buttonAct">Actualizar</button>
                    </form>
                    
                    {isLoggedIn && <MessageChat/>}
                </div>
            </div>
        </>
    );
}

export default EditarPerfilEmpleado;
