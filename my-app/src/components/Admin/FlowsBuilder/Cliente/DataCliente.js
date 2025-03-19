import { useContext, useEffect, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderDashboard from "../../../navbar/SliderDashboard";
import ModoClaro from "../../../../assets/img/soleado.png";
import ModoOscuro from "../../../../assets/img/modo-oscuro.png";
import crear from "../../../../assets/img/crear.png";
import { Link } from "react-router-dom";


function DataCliente() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [dataClient, setDataClient] = useState([]);
    const [ searchId, setSearchId ] = useState("")
    const [ searchCedula, setSearchCedula ] = useState("")
    const [ searchEstado, setSearchEstado ] = useState("")

    //modal inactivar 
    const [ isModal, setIsModal ] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null)

    const openModal = (cliente) => {
        setIsModal(true)
        setSelectedClient(cliente)
    }

    const closeModal = () => {
        setIsModal(false)
        setSelectedClient(null)
    }

    useEffect(()=>{
        const getDataClient = async () => {
            try{
                const response = await fetch('http://localhost:3001/user',{
                    method: 'GET'
                })
                if(!response.ok){
                    throw new Error('Error al consultar los datos del usuario')
                }

                const data = await response.json()
                console.log('la data: ', data)
                const result = data.data.docs;
                console.log('the result is: ', result)

                let dataClientConsult = []

                for(const usuarios of result){
                    console.log('el rol de el usuario es: ', usuarios.name)
                    if(usuarios.rol === 3){
                        console.log('eres un cliente')

                        const newUserTable = {
                            id: usuarios._id,
                            tipoDocument: usuarios.tipoDocument,
                            numberDocument: usuarios.numberDocument,
                            name: usuarios.name,
                            lastName: usuarios.lasName,
                            email: usuarios.email,
                            phone: usuarios.telefono,
                            address: usuarios.direccion,
                            estado: usuarios.estado,
                        }
                        dataClientConsult.push(newUserTable)
                    }else{
                        console.log('no eres cliente')
                    }
                }

                setDataClient(dataClientConsult)
            }catch(error){
                console.error('Error al momento de consultar los datos del usuario: ', error)
            }
        }
        getDataClient()
    }, [])

    const handleSearchChage = (e) => {
        setSearchId(e.target.value)
    }

    const handleSearchCedulaChage = (e) => {
        setSearchCedula(e.target.value)
    }

    const handleSearchEstadoChage = (e) => {
        setSearchEstado(e.target.value)
    }


    const filterClients = dataClient.filter((cliente) => {
        const matchesId = searchId ? String(cliente.id).includes(searchId) : true;
        const matchesCedula = searchCedula ? String(cliente.numberDocument).includes(searchCedula) : true;
        const matchesEstado = searchEstado ? String(cliente.estado).includes(searchEstado) : true;
        return matchesId && matchesCedula && matchesEstado;
    });

    //inabilitar 
    const UpdateStatus = async (id, estado) => {
        try {
            const nuevoEstado = estado === 'Activo' ? 'Inactivo' : 'Activo';
            const response = await fetch(`http://localhost:3001/user/${id}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });
    
            if (!response.ok) {
                throw new Error('Error al momento de actualizar el estado');
            }
    
            const data = await response.json();
            console.log('Respuesta al actualizar estado: ', data, id, estado);
    
            setDataClient((prevData) =>
                prevData.map((cliente) =>
                    cliente.id === id ? { ...cliente, estado: nuevoEstado } : cliente
                )
            );

            closeModal();
        } catch (error) {
            console.error('Error al actualizar el estado: ', error);
        }
    };

    return (
        <>
            <div className={theme === "light" ? "app light" : "app dark"}>
                <div className="contentChanells1">
                    <div className="slider">
                        <Navbar />
                        <div className="flex">
                            <SliderDashboard />
                            <div className="contentNav"></div>
                        </div>
                    </div>
                    <div className="BarraSuperior">
                        <h1>Clientes</h1>
                        <a className="ButtonTheme1" onClick={toggleTheme}>
                            <img
                                src={theme === "light" ? ModoClaro : ModoOscuro}
                                alt="theme-toggle"
                            />
                        </a>
                    </div>
                    <div className="contentUserEmp">
                        <div className="barraBuscarEmp">
                            <div className="searchId">
                                <p>Buscar Cliente Por ID</p>
                                <br/>
                                <input
                                name="searhId" 
                                value={searchId}
                                onChange={handleSearchChage}
                                placeholder="Buscar ID" />
                            </div>
                            <div className="searchId">
                                <p>Buscar Cliente Por Cedula</p>
                                <br/>
                                <input
                                name="searhId" 
                                value={searchCedula}
                                onChange={handleSearchCedulaChage}
                                placeholder="Buscar Cedula" />
                            </div>
                            <div className="searchId">
                                <p>Buscar Cliente Por Estado</p>
                                <br/>
                                <input
                                name="searhId" 
                                value={searchEstado}
                                onChange={handleSearchEstadoChage}
                                placeholder="Buscar Estado" />
                            </div>
                            <div className="ButtonCreateEmp">
                                <Link to="/created-client">
                                    Crear Usuario <img src={crear} alt="crear" />
                                </Link>
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
                                        <th>Direccion</th>
                                        <th>Estado</th>
                                        <th>Actualizar</th>
                                        <th>Eliminar</th>
                                    </tr>
                                </thead>
                               <tbody>
                                {filterClients.length > 0?(
                                    filterClients.map((cliente, index) => (
                                        <tr key={index}>
                                            <td>{cliente.id}</td>
                                                <td>{cliente.tipoDocument}</td>
                                                <td>{cliente.numberDocument}</td>
                                                <td>{cliente.name}</td>
                                                <td>{cliente.lastName}</td>
                                                <td>{cliente.phone}</td>
                                                <td>{cliente.email}</td>
                                                <td>{cliente.address}</td>
                                                <td>{cliente.estado}</td>
                                                <td>
                                                    <Link className="buttonactualizar" to={`/update-client/${cliente.id}`}>Actualizar</Link>
                                                </td>
                                                <td>
                                                    <button
                                                        className={`inabilitarButton ${cliente.estado=== "Activo" ? "activo": "inactivo"}`}
                                                        onClick={() => openModal(cliente)}
                                                        >
                                                            {cliente.estado === "Activo" ? "Inactivar" : "Activar"}
                                                    </button>
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
                                {isModal && selectedClient && (
                                    <div className="modal-overlay">
                                        <div className="ventana-popup">
                                            <div className="contenido-popup">
                                                <p>
                                                    ¿Estás seguro de que deseas{" "}
                                                    {selectedClient.estado === "Activo" ? "Inactivar" : "Activar"} este cliente?
                                                </p>
                                                <button className="confirmInactivar"
                                                    onClick={() => {
                                                        UpdateStatus(selectedClient.id, selectedClient.estado);
                                                    }}
                                                >
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
    );
}

export default DataCliente;
