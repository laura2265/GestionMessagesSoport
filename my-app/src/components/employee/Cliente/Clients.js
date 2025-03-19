import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../ThemeContext"
import Navbar from "../../navbar/Navbar";
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import { Link } from "react-router-dom";
import crear from '../../../assets/img/crear.png'
import SliderEmploye from "../../navbar/SliderEmploye";
import MessageChat from "../../MessageChat";

function ClientsData () {
    const {theme, toggleTheme} = useContext(ThemeContext);
    const [dataClient, setDataClient] = useState([])
    const [ searchId, setSearchId ] = useState('');
    const [ searchCedula, setSearchCedula ] = useState('')
    const [ searchEstado, setSearchEstado ] = useState('')
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

    useEffect(()=>{
        const getDataClient = async () => {
            try{
                const response = await fetch('http://localhost:3001/user',{
                    method: 'GET',
                })
                if(!response.ok){
                    throw new Error('Error al momento de consultar los datos del usuario')
                }
                const data = await response.json();
                console.log('la data is: ', data)

                const result = data.data.docs;
                console.log('the result is: ', result)

                let dataClientConsult = []

                for(const usuario of result){
                    console.log('El usuario es: ', usuario.name)
                    if(usuario.rol === 3){
                        const newUserTable = {
                            id: usuario._id,
                            tipoDocument: usuario.tipoDocument,
                            numberDocument: usuario.numberDocument,
                            name: usuario.name,
                            lastName: usuario.lasName,
                            email: usuario.email,
                            phone: usuario.telefono,
                            address: usuario.direccion,
                            estado: usuario.estado,
                        }
                        dataClientConsult.push(newUserTable)
                    }else{
                        console.log(`no eres cliente:()`)
                    }
                }
                setDataClient(dataClientConsult)
            }catch(error){
                console.error(`Error al momento de consultar los datos del usuario: ${error}`)
            }
        }
        getDataClient()
    },[])

    const handleSearchChange = (e)=>{
        setSearchId(e.target.value)
    }

    const handleSearchCedulaChange = (e) => {
        setSearchCedula(e.target.value)
    }

    const handleSearchEstadoChange = (e) => {
        setSearchEstado(e.target.value)
    }

    const filterClients = dataClient.filter((cliente)=>{
        const matchId = searchId ? String(cliente.id).includes(searchId): true;
        const matchCedula = searchCedula ? String(cliente.numberDocument).includes(searchCedula): true;
        const matchStatus = searchEstado ? String(cliente.estado).includes(searchEstado): true

        return matchId && matchCedula && matchStatus
    })
    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar /> 
                    <div className="flex">
                        <SliderEmploye/>
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
                            onChange={handleSearchChange}
                            placeholder="Buscar ID" />
                        </div>
                        <div className="searchId">
                            <p>Buscar Cliente Por Cedula</p>
                            <br/>
                            <input
                            value={searchCedula}
                            onChange={handleSearchCedulaChange}
                            name="searhId" 
                            placeholder="Buscar Cedula" />
                        </div>
                        <div className="searchId">
                            <p>Buscar Cliente Por Estado</p>
                            <br/>
                            <input
                            value={searchEstado}
                            onChange={handleSearchEstadoChange}
                            name="searhId"
                            placeholder="Buscar Estado" />
                        </div>
                        <div className="ButtonCreateEmp">
                            <Link to="/new-client">
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
                                </tr>
                            </thead>
                            <tbody>
                                {filterClients.length > 0?(
                                    filterClients.map((cliente, index)=>(
                                        <tr key={index}>
                                            <td> {cliente.id}</td>
                                            <td> {cliente.tipoDocument}</td>
                                            <td> {cliente.numberDocument}</td>
                                            <td> {cliente.name}</td>
                                            <td> {cliente.lastName}</td>
                                            <td> {cliente.phone}</td>
                                            <td> {cliente.email}</td>
                                            <td> {cliente.address}</td>
                                            <td> {cliente.estado}</td>
                                            <td> 
                                                <Link className="buttonactualizar" to={`/update-data-clients/${cliente.id}`}>Actualizar</Link>
                                            </td>
                                        </tr>
                                    ))
                                ):(
                                    <tr>
                                        <td colSpan={11}>
                                            No se encontraron clientes registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {isLoggedIn && <MessageChat/>}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ClientsData

