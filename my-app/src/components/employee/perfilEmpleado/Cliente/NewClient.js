import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../ThemeContext"
import Navbar from "../../navbar/Navbar";
import SliderEmploye from "../../navbar/SliderEmploye";
import ModoOscuro from '../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../assets/img/soleado.png'
import CreatedUser from '../../../assets/img/createdUser.png'
import {  useNavigate } from "react-router-dom";
import MessageChat from "../../MessageChat";



function NewClient(){
    const {theme, toggleTheme} = useContext(ThemeContext);
    const navigate = useNavigate();
    const [formError, setFormError] = useState({})
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
    
    //validaciones
    const text = /^[A-Za-z Á-Úá-úñÑ]{3,20}$/;
    const emailParttern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordV = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    const number = /^[0-9]{1,10}$/
    const addressParttern = /^[A-Za-z0-9\s.,#-]{5,50}$/

    const [formData, setFormData] = useState({
        typeDocument: '',     
        numberDocument: '',    
        name: '',
        lasName: '',
        email: '',
        phone: '',
        address: '',
        estado: '',
        password: '',
        confirmPassword: ''
    });
    

    const handleInputChange= (e)=>{
        const {name, value} = e.target;
        setFormData((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }

    const validationForm = () => {
        let errors = {};
    
        if (formData.typeDocument === '') {
            errors.typeDocument = 'Este Campo Es Obligatorio';
        }
        if (!number.test(formData.numberDocument)) {
            errors.numberDocument = 'El Número De Documento No Es Válido';
        }
        if (!text.test(formData.name)) {
            errors.name = 'El Nombre No Es Válido';
        }
        if (!text.test(formData.lasName)) {
            errors.lasName = 'El Apellido No Es Válido';
        }
        if (!emailParttern.test(formData.email)) {
            errors.email = 'El Correo No Es Válido';
        }
        if (!number.test(formData.phone)) {
            errors.phone = 'El Número De Teléfono No Es Válido';
        }
        if (!addressParttern.test(formData.address)) {
            errors.address = 'La Dirección No Es Válida';
        }
        if (!passwordV.test(formData.password)) {
            errors.password = 'La Contraseña No Es Válida';
        }
        return errors; 
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validationForm(); // Asegúrate de obtener los errores
    
        setFormError(errors);
    
        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors).join('\n');
            alert(`Campos inválidos:\n${errorMessages}`);
            return;
        }
    
        // Procede con el envío si no hay errores
        const dataToSend = {
            tipoDocument: formData.typeDocument,
            numberDocument: formData.numberDocument,
            name: formData.name,
            lasName: formData.lasName,
            email: formData.email,
            password: formData.password,
            rol: 3,
            telefono: formData.phone,
            direccion: formData.address,
            estado: 'Activo'
        };
    
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
    
        const raw = JSON.stringify(dataToSend);
    
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
    
        try {
            const response = await fetch('http://localhost:3001/user', requestOptions);
            if (!response.ok) {
                throw new Error('Error al momento de crear el usuario');
            }
            const data = await response.json();
            console.log(data);
            alert('Cliente registrado correctamente');
            navigate('/cliente-data');
        } catch (error) {
            console.error('Error al momento de crear el usuario: ', error);
        }
    };
    
    
    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'appdark'}>
                <div className="slider">
                    <Navbar/>
                    <div className="flex">
                        <SliderEmploye/>
                    </div>
                </div>
                <div className="BarraSuperior">
                    <h1>Crear Cliente</h1>
                    <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                </div>
                <div className="contentCreatedEmple">
                    <div className="contentFormCreated">
                        <div className="contentCreatedF">
                            <form onSubmit={handleSubmit}>
                                <img src={CreatedUser} className="imgCreated" />
                                <div className="contentForm1Created">
                                    <div className="content1F">
                                        <div className="inputContainer">
                                          <select 
                                            className='inputContainerInput'
                                            value={formData.typeDocument}
                                            onChange={handleInputChange}
                                            name='typeDocument'>
                                              <option value=''>-seleccione una opcion-</option>
                                              <option value='Cedula Ciudadania'>Cedula Ciudadania</option>
                                              <option value='Cedula Extrangeria'>Cedula De Extrangeria</option>
                                              <option value='Pasaporte'>Pasaporte</option>
                                          </select>
                                          <label className="inputContainerLabel">Tipo de Documento</label>
                                          {formError.typeDocument && <p className="error">{formError.typeDocument}</p>}
                                          <p></p>
                                        </div>

                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='numberDocument'
                                            className="inputContainerInput"
                                            value={formData.numberDocument}
                                            onChange={handleInputChange}
                                            />
                                            <label className="inputContainerLabel">N° De Documento</label>
                                            {formError.numberDocument && <p className="error"> {formError.numberDocument} </p>}
                                            <p></p>
                                        </div> 

                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='name'
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="inputContainerInput"
                                            />
                                            <label className="inputContainerLabel">Nombre</label>
                                            {formError.name && <p className="error">{formError.name}</p>}
                                            <p></p>
                                        </div> 
                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='lasName'
                                            value={formData.lasName}
                                            onChange={handleInputChange}
                                            className="inputContainerInput"
                                            />
                                            <label className="inputContainerLabel">Apellido</label>
                                            {formError.lasName && <p className="error"> {formError.lasName}</p>}
                                            <p></p>
                                        </div>

                                        <div className="inputContainer">
                                            <input
                                            type="number"
                                            name='phone'
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="inputContainerInput"
                                            />
                                            <label className="inputContainerLabel">Telefono</label>
                                            {formError.phone && <p className="error">{formError.phone}</p>}
                                            <p></p>
                                        </div>
                                    </div>
                                    <div className="content1F">
                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='address'
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="inputContainerInput"
                                            />
                                            <label className="inputContainerLabel">Direccion</label>
                                            {formError.address && <p className="error">{formError.address}</p>}
                                            <p></p>
                                        </div> 
                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='email'
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="inputContainerInput"
                                            />
                                            <label className="inputContainerLabel">Email</label>
                                            {formError.email && <p className="error">{formError.email}</p>}
                                            <p></p>
                                        </div> 
                                        <div className="inputContainer">
                                            <input
                                            type="password"
                                            name='password'
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="inputContainerInput"
                                            />
                                            <label className="inputContainerLabel">Contraseña</label>
                                            {formError.password && <p className="error">{formError.password}</p>}
                                            <p></p>
                                            </div>
                                        <div className="inputContainer">
                                            <input
                                            type="password"
                                            name='confirmPassword'
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="inputContainerInput"
                                            />
                                            <label className="inputContainerLabel">Confirmar Contraseña</label>
                                            {formError.confirmPassword && <p className="error">{formError.confirmPassword}</p>}
                                            <p></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="buttonContent">
                                    <button type="submit" className="InputButton">Registrar</button>
                                </div>
                            </form>
                            
                            {isLoggedIn && <MessageChat/>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewClient