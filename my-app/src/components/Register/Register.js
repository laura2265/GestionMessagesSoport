import React, { useState, useEffect ,useContext, createContext} from 'react';
import './Register.css';
import fondo from '../../assets/img/ImgInternet.png'
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/App.css'
import ThemeContext from '../ThemeContext';
import ModoClaro from '../../assets/img/soleado.png'
import ModoOscuro from '../../assets/img/modo-oscuro.png'




function Register(){

    //validaciones
    const text = /^[A-Za-z Á-Úá-úñÑ]{3,20}$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordV = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const number = /^[0-9]{1,10}$/
    const addressPattern = /^[A-Za-z0-9\s.,#-]{5,50}$/

    //variables globales
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
      typeDocument: '',
      numberDocument: '',
      name: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  
    const [formErrors, setFormErrors] = useState({});
    const [ AdicionalError, setAditionalError ] = useState({})
    const [role, setRole] = useState(''); 
    const [additionalData, setAdditionalData] = useState({
      phone: '',
      address: '',
      estado: '',
      cargo: '',
      categoria: '',
      area: '',
    });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  
      if (name === 'email') {
        const domain = value.split('@')[1];
        if (domain === 'cablemas.com') {
          setRole('empleado');
        } else {
          setRole('cliente');
        }
      }
    };
  
    const handleAdditionalChange = (e) => {
      const { name, value } = e.target;
      setAdditionalData((prevState) => ({
        ...prevState, 
        [name]: value 
      }));
    };

    const validateForm = () => {
      let errors = {};
      if (formData.typeDocument === '') {
        errors.typeDocument = "tipo de documento no válido";
      }
      if (!number.test(formData.numberDocument)) {
        errors.numberDocument = "Numero de documento no válido";
      }
      if (!text.test(formData.name)) {
        errors.name = 'Nombre no válido';
      }

      if (!text.test(formData.lastname)) {
        errors.lastname = 'Apellido no válido';
      }

      if (!emailPattern.test(formData.email)) {
        errors.email = 'Correo no válido';
      }

      if (!passwordV.test(formData.password)) {
        errors.password = 'Contraseña no válida';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }

      return errors;
    };

    const validateAdditional= () =>{
      let errors1= {}
      //datos adicionales
      if(!number.test(additionalData.phone)){
        errors1.phone = 'Numero no valido'
      }
      if(!addressPattern.test(additionalData.address)){
        errors1.address = 'Direccion no valida'
      }
      return errors1
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const errors = validateForm();
      setFormErrors(errors);
      const errors1 = validateAdditional();
      setAditionalError(errors1);
    
      if (Object.keys(errors).length > 0 || Object.keys(errors1).length > 0) {
        const errorMessages = [
            ...Object.values(errors),
            ...Object.values(errors1),
        ].join('\n');
        
        alert(`Campos inválidos:\n${errorMessages}`);
        return;
    }
    
    
    const dataToSend = {
      tipoDocument: formData.typeDocument,
      numberDocument: formData.numberDocument,
      name: formData.name,
      lasName: formData.lastname,
      email: formData.email,
      password: formData.password,
      rol: role === 'empleado' ? 2 : 3, 
      telefono: additionalData.phone,
      direccion: additionalData.address,
      estado: 'Activo',
      categoria: role === 'empleado'? additionalData.categoria || '':'',
      cargo: role === 'empleado' ? additionalData.cargo || '' : '',
      area: role === 'empleado' ? additionalData.area || '' : ''  
    };

      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
    
      const raw = JSON.stringify(dataToSend);
   

      try{
        const response = await fetch(`http://localhost:3001/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: raw,
          redirect: 'follow'
        })

        if(!response.ok){
          console.log(`Error al momento de consultar los datos de la api`)
        }

        const result = await response.json()
        console.log(result)
        alert(`Usuario registrado como ${role}`);
        navigate('/login');

      }catch(error){
        console.error(`Error al momento de consultar los datos dela api: ${error}`)
      }
      
    };
    
    const handleRedirect = () => {
      navigate('/login');
    };

      return(
          <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
              <nav className="navbar1">
                <div className="navbar-logo">
                  <h2></h2>
                </div>

                <div className={`nav-links`}>
                  <Link to="/">Home</Link>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                  <Link  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </Link>
                </div>

                <div className="menu-icon">
                  <i className='fas'></i>
                </div>
              </nav>
              <div className="container2">
                <div className='containerFormRegister'>
                  <div className="container1">
                    <img src={fondo} alt="Fondo" className="cont" />
                  </div>
                  <div className='formContainer1'>
                    <p>Registrarse</p>
                    <br />
                    <div>
                      <form id='formValidation' onSubmit={handleSubmit}>

                      <div className='contenttodosInput'>
                        <div className='contentinput3'>
                          <div className="inputContainer">
                            <select 
                              className='inputContainerInput'
                              name='typeDocument'
                              value={formData.typeDocument}
                              onChange={handleInputChange}>
                                <option value=''>-seleccione una opcion-</option>
                                <option value='Cedula Ciudadania'>Cedula Ciudadania</option>
                                <option value='Cedula Extrangeria'>Cedula De Extrangeria</option>
                                <option value='Pasaporte'>Pasaporte</option>
                            </select>
                            <label className="inputContainerLabel">Tipo de Documento</label>
                            {formErrors.typeDocument && <p className='error'>{formErrors.typeDocument}</p>}
                            <p></p>
                          </div>
                          <div className="inputContainer">
                            <input
                            type="number"
                            name='numberDocument'
                            className="inputContainerInput"
                            value={formData.numberDocument}
                            onChange={handleInputChange}
                            />
                            <label className="inputContainerLabel">N° Documento</label>
                            {formErrors.numberDocument && <p className='error'>{formErrors.numberDocument}</p>}
                            <p></p>
                          </div>
                        
                          <div className="inputContainer">
                            <input
                              type="text"
                              name='name'
                              className="inputContainerInput"
                              value={formData.name}
                              onChange={handleInputChange}
                            />
                            <label className="inputContainerLabel">Nombre</label>
                            {formErrors.name && <p className='error'>{formErrors.name}</p>}
                            <p></p>
                          </div>
                          <div className="inputContainer">
                            <input
                              type="text"
                              name='lastname'
                              className="inputContainerInput"
                              value={formData.lastname}
                              onChange={handleInputChange}
                            />
                            <label className="inputContainerLabel">Apellido</label>
                            {formErrors.lastname && <p className='error'>{formErrors.lastname}</p>}
                            <p></p>
                          </div>
                          
                          {role === 'empleado' && (
                            <>
                              <div className="inputContainer">
                                <input
                                  type="number"
                                  name="phone"
                                  className="inputContainerInput"
                                  value={additionalData.phone}
                                  onChange={handleAdditionalChange}
                                />
                                <label className="inputContainerLabel">Teléfono</label>
                                {AdicionalError.phone && <p className="error">{AdicionalError.phone}</p>}
                              </div><p></p>

                              <div className="inputContainer">
                                <input
                                  type="text"
                                  name="address"
                                  className="inputContainerInput"
                                  value={additionalData.address}
                                  onChange={handleAdditionalChange}
                                />
                                <label className="inputContainerLabel">Dirección</label>
                                {AdicionalError.address && <p className="error">{AdicionalError.address}</p>}
                              </div><p></p>
                            </>
                          )}  

                          {role === 'cliente' && (
                            <>
                              <div className="inputContainer">
                                <input
                                  type="number"
                                  name="phone" 
                                  className="inputContainerInput"
                                  value={additionalData.phone} 
                                  onChange={handleAdditionalChange} 
                                />
                                <label className="inputContainerLabel">Teléfono</label>
                                {AdicionalError.phone && <p className="error">{AdicionalError.phone}</p>}
                              </div><p></p>

                            </>
                          )}
                        </div>
                        
                        <div className='contentinput3'> 
                          <div className="inputContainer">
                            <input
                              type="text"
                              name='email'
                              className="inputContainerInput"
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                            <label className="inputContainerLabel">Correo</label>
                            {formErrors.email && <p className='error'>{formErrors.email}</p>}
                            <p></p>
                          </div>

                          {role === 'empleado' && (
                            <>
                              <div className="inputContainer">
                                <input
                                  type="text"
                                  name="cargo"
                                  className="inputContainerInput"
                                  value={additionalData.cargo}
                                  onChange={handleAdditionalChange}
                                  required
                                />
                                <label className="inputContainerLabel">Cargo</label>
                              </div><p></p>
                              <div className="inputContainer">

                                <select 
                                    className='inputContainerInput'
                                    name='categoria'
                                    value={formData.categoria}
                                    onChange={handleAdditionalChange}>
                                      <option value=''>-seleccione una opcion-</option>
                                      <option value='No hay conexión'>No hay conexión</option>
                                      <option value='Internet lento'>Internet lento</option>
                                      <option value='No cargan las páginas'>No cargan las páginas</option>
                                      <option value='Señal de Televisión'>Señal de Televisión</option>
                                      <option value='Internet se desconecta a ratos'>Internet se desconecta a ratos</option>
                                </select>
                                <label className="inputContainerLabel">Categoria Ticket</label>
                              </div><p></p>

                              <div className="inputContainer">
                                <input
                                  type="text"
                                  name="area"
                                  className="inputContainerInput"
                                  value={additionalData.area}
                                  onChange={handleAdditionalChange}
                                  required
                                />
                                <label className="inputContainerLabel">Área</label>
                              </div><p></p>
                            </>
                          )}

                          {role === 'cliente' && (
                            <>
                              <div className="inputContainer">
                                <input
                                  type="text"
                                  name="address"
                                  className="inputContainerInput"
                                  value={additionalData.address}
                                  onChange={handleAdditionalChange}
                                />
                                <label className="inputContainerLabel">Dirección</label>
                                {AdicionalError.address && <p className="error">{AdicionalError.address}</p>}
                              </div><p></p>
                              
                            </>
                          )}

                            <div className="inputContainer">
                              <input
                                type="password"
                                name='password'
                                className="inputContainerInput"
                                value={formData.password}
                                onChange={handleInputChange}
                              />
                              <label className="inputContainerLabel">Contraseña</label>
                              {formErrors.password && <p className='error'>{formErrors.password}</p>}
                              <p></p>
                            </div>
                            <div className="inputContainer">
                              <input
                              type="password"
                              name='confirmPassword'
                              className="inputContainerInput"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              />
                              <label className="inputContainerLabel">Confirmar Contraseña</label>
                              {formErrors.confirmPassword && <p className='error'>{formErrors.confirmPassword}</p>}
                            </div> 
                          </div>
                        </div>

                        <div className='butonsRedirectInput'>
                          <button type='submit' className="InputButton">Registrar</button>
                          <button className='toggleButton' onClick={handleRedirect}> Quieres iniciar sesión has clic aqui </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div> 
              </div>
            </div>
          </>
          )
        }
        
  export default Register
  