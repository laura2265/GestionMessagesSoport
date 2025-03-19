import { useContext, useEffect, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderDashboard from "../../../navbar/SliderDashboard";
import ModoClaro  from '../../../../assets/img/soleado.png'
import ModoOscuro from '../../../../assets/img/modo-oscuro.png'
import './empleado.css'
import crear from '../../../../assets/img/crear.png'
import { Link } from "react-router-dom";

function DataEmpleado(){
    const { theme, toggleTheme  } = useContext(ThemeContext);
    const [ dataEmple, setDataEmple ] = useState([])
    const [searchId, setSearchId] =  useState("")
    const [searchCedula, setSearchCedula] =  useState("")
    const [searchEstado, setSearchEstado] =  useState("")

    //modal
    const [isModal, setIsModal] = useState(false)
    const [selectedEmple, setSelectedEmple] = useState(null)

    const openModal = (empleado) => {
        setIsModal(true);
        setSelectedEmple(empleado)
    }

    const closeModal = () => {
        setIsModal(false);
        setSelectedEmple(null)
    }
    
    //Muestra todos los empleados
    useEffect(() => {
        const getFectchEmple = async () => {
            try{
                const response = await fetch('http://localhost:3001/user',{
                    method:'GET'
                })
            
                if(!response.ok){
                    throw new Error('Error al consultar los datos de los empleados')
                }

                const data = await response.json();
                console.log('datos', data)
                const empleados = data.data.docs;
                console.log('the result is: ', empleados)

                const empleadosData = []
                for(const empleado of empleados){
                    if(empleado.rol === 2){

                        const newUserTable = {
                            id: empleado._id,
                            tipoDocument: empleado.tipoDocument,
                            numberDocument: empleado.numberDocument,
                            name: empleado.name,
                            lastName: empleado.lasName,
                            email: empleado.email,
                            phone: empleado.telefono,
                            address: empleado.direccion,
                            estado: empleado.estado,
                            cargo: empleado.cargo,
                            area: empleado.area,
                        }
                        empleadosData.push(newUserTable)
                    }else{
                        console.log('no eres empleado')
                    }
                }
                setDataEmple(empleadosData)
            }catch(error){
                console.error(`Error al momento de consultar los datos del empleado: ${error}`)
            }
        };
        getFectchEmple();
    }, []);

    const handleSearchChange = (e) => {
        setSearchId(e.target.value)
    }
    const handleSearchCedulaChange = (e) => {
        setSearchCedula(e.target.value)
    }

    const handleSearchEstadoChange = (e) => {
        setSearchEstado(e.target.value)
    }
  
 
    const filterEmple = dataEmple.filter((emple) => {
      const matchesId = searchId ? String(emple.id).includes(searchId) : true;
      const matchesCedula = searchCedula ? String(emple.numberDocument).includes(searchCedula) : true;
      const matchesEstado = searchEstado ? String(emple.estado).includes(searchEstado) : true;
      return matchesId && matchesCedula && matchesEstado;
    });

    
    
    //inabilitar
    const UpdateStatus = async(id, estado)=>{
        try{
            const nuevoEstado = estado === 'Activo'? 'Inactivo' : 'Activo'
            const response = await fetch(`http://localhost:3001/user/${id}/estado`,{
                method:'PUT',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({estado:nuevoEstado}),
            });
            if(!response.ok){
                throw new Error(`Error al momento de actualizar los datos del ID: ${id}`)
            }
            const data = await response.json()
            console.log(`Respuesta al actualizar el estado:\n ${data}\n ${id} \n${estado}`)

            setDataEmple((prevData)=>
                prevData.map((empleado)=>
                   empleado.id === id ? {...empleado, estado: nuevoEstado} :empleado
                )
            )
            closeModal()
        }catch(error){
            console.error(`Error al actualizr los datos del usuario: ${error}`)
        }
    }

    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="contentChanells1">
                    <div className="slider">
                        <Navbar />
                        <div className="flex">
                            <SliderDashboard />
                        </div>
                    </div> 
                    <div className="BarraSuperior">
                        <h1>Empleados</h1>
                        <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                    </div>
                    <div className="contentUserEmp">
                        <div className="barraBuscarEmp">
                        <></>
                            <div className="searchId">
                                <p> Buscar Empleado Por ID</p>
                                <br></br>
                                <input
                                value={searchId}
                                onChange={handleSearchChange}
                                placeholder="Buscar ID"
                                />
                            </div>
                            <div className="searchId">
                                <p> Buscar Empleado Por Cedula</p>
                                <br></br>
                                <input
                                value={searchCedula}
                                onChange={handleSearchCedulaChange}
                                placeholder="Buscar Cedula"
                                />
                            </div><div className="searchId">
                                <p> Buscar Por Estado</p>
                                <br></br>
                                <input
                                value={searchEstado}
                                onChange={handleSearchEstadoChange}
                                placeholder="Buscar Estado"
                                />
                            </div>
                            <div className="ButtonCreateEmp">
                                <Link to='/created-emple'> Crear Usuario <img src={crear} /> </Link>
                            </div>
                        </div>

                        <div className="contentTableDataEmp">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tipo De Documento</th>
                                        <th>N° De Documento</th>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>N° De Telefono</th>
                                        <th>Email</th>
                                        <th>Drireccion</th>
                                        <th>Estado</th>
                                        <th>Cargo</th>
                                        <th>Area</th>
                                        <th>Actualizar</th>
                                        <th>Eliminar </th>
                                    </tr>
                                </thead>
                                <tbody>
                                {filterEmple.length > 0?(
                                    filterEmple.map((empleado, index) => (
                                        <tr key={index}>
                                            <td>{empleado.id}</td>
                                                <td>{empleado.tipoDocument}</td>
                                                <td>{empleado.numberDocument}</td>
                                                <td>{empleado.name}</td>
                                                <td>{empleado.lastName}</td>
                                                <td>{empleado.phone}</td>
                                                <td>{empleado.email}</td>
                                                <td>{empleado.address}</td>
                                                <td>{empleado.estado}</td>
                                                <td>{empleado.cargo}</td>
                                                <td>{empleado.area}</td>
                                                <td>
                                                    <Link className="buttonactualizar" to={`/update-emple/${empleado.id}`}>Actualizar</Link>
                                                </td>
                                                <td>
                                                    <button 
                                                    className={`inabilitarButton ${empleado.estado==="Activo"?"activo":"inactivo"}`}
                                                    onClick={()=>openModal(empleado)}
                                                    > {empleado.estado === "Activo" ? "Inactivar": "Activar"} </button>
                                                </td>
                                        </tr>
                                    ))
                                ):(
                                    <tr>
                                        <td colSpan={11}>
                                            No se encontraron clientes
                                            registrados
                                        </td>
                                    </tr>
                                )} 
                                </tbody>
                            </table>
                            {isModal && selectedEmple && (
                                <div className="modal-overlay">
                                    <div className="ventana-popup">
                                        <div className="contenido-popup">
                                            <p>
                                                ¿Estás seguro de querer {" "} 
                                                {selectedEmple.estado === "Activo" ? "Inactivar": "Activar"}
                                                este empleado?
                                            </p>
                                            <button className="confirmInactivar" onClick={()=>{
                                                UpdateStatus(selectedEmple.id, selectedEmple.estado)
                                            }}>
                                                Confirmar
                                            </button>
                                            <button className="cancelInactivar" onClick={closeModal}>Cancelar</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DataEmpleado