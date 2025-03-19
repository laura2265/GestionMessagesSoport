import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../../ThemeContext"
import Navbar from "../../../navbar/Navbar"
import SliderDashboard from "../../../navbar/SliderDashboard"
import ModoClaro from '../../../../assets/img/soleado.png'
import ModoOscuro from '../../../../assets/img/modo-oscuro.png'
import { useNavigate, useParams } from "react-router-dom"

function EditarPerfilAdmin() {
    const {theme, toggleTheme} = useContext(ThemeContext)
    const {id} = useParams()
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
        area: "",
        cargo: "",
        password: "",
    })

    useEffect(()=>{
        const fetchDataAdmin = async () => {
            try{
                const response = await fetch(`http://localhost:3001/user/${id}`,{
                    method: 'GET'
                })
                if(!response.ok){
                    throw new Error(`Error al momento de consultar los datos del usuario con ID: ${id}`)
                }

                const result = await response.json();
                const data = result.data;
                console.log(`el usuario por id es: ${data}`)

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
                    cargo: data.cargo,
                    password: data.password,
                })

            }catch(error){
                console.error(`Error al momento de consultar los datos del usuario: ${error}`)
            }
        }
        fetchDataAdmin()
    }, [id])

    const handleUpdateChange = (e) => {
        const {name,value} = e.target
        setFormDataUpdate({
            ...formDataUpdate,
            [name]: value,
        })
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()
        try{
            const response = await fetch(`http://localhost:3001/user/${id}`,{
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataUpdate)
            })
            if(!response.ok){
                throw new Error(`Error al momento deactualizar los datos del usuario con ID: ${id}`)
            }
            const data = await response.json()
            console.log('Usuario actualizado correctamente', data)
            alert('Datos actualizados correctamente')
            navigate('/perfil-Admin')
        }catch(error){
            console.error(`Error al momento de actualizar los datos del usuario: ${error}`)
        }
    }

    return(
        <>
            <div className={theme === 'light'? 'app light':'app dark'}>
                <div className="slider">
                    <Navbar/>
                    <div className="flex">  
                        <SliderDashboard/>
                    </div>
                </div>
                <div className="BarraSuperior">
                    <h1>Actualizar Empleado</h1>
                    <a className="ButtonTheme1" onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro} /></a>
                </div>
                <div className="contentActualizar">
                    <form onSubmit={handleSubmit} >
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
                                        name="numberDocument"
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
                                    <label>Numero De Telefono</label><br />
                                    <input
                                        name="phone"
                                        value={formDataUpdate.phone}
                                        onChange={handleUpdateChange}
                                        placeholder="Número de Teléfono"
                                    /><br />
                                </div>  
                            </div>

                            <div className="contentAct">
                                <div className="contentInputAc">
                                    <label>Email</label><br />
                                    <input
                                        name="email"
                                        value={formDataUpdate.email}
                                        onChange={handleUpdateChange}
                                        placeholder="Email"
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
                                    <label>Área</label><br />
                                    <input
                                        name="area"
                                        value={formDataUpdate.area}
                                        onChange={handleUpdateChange}
                                        placeholder="Área"
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
                                        type="password"
                                        value={formDataUpdate.password}
                                        onChange={handleUpdateChange}
                                        placeholder="Contraseña"
                                    /><br />
                                </div>

                            </div>
                        </div>
                        <button type="submit" className="buttonAct">Actualizar</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EditarPerfilAdmin