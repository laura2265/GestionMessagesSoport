  import React, { useState, useEffect, useContext } from 'react';
  import './login.css';
  import fondo from '../../assets/img/ImgInternet.png'
  import { Link, useNavigate } from 'react-router-dom';
  import ThemeContext from '../ThemeContext';
  import '../../index.css'
  import '../../styles/App.css'
  import ModoClaro from '../../assets/img/soleado.png'
  import { saveUserId, saveUserRol } from '../../utils/auth';
  import ModoOscuro from '../../assets/img/modo-oscuro.png'

  function Login() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    
    const handleRedirect1=()=>{
      navigate('/register')
    }

  /*formulario */
    const [formDataLogin, setFormDataLogin] = useState({
      email1: '',
      passwordL: ''
    });
    
    const [formErrorsLogin, setFormErrorsLogin] = useState({});
    const [isSubmitLogin, setIsSubmitLogin] = useState(false);

    const handleInputChangeLogin = (e) => {
      const { name, value } = e.target;
      setFormDataLogin({ ...formDataLogin, [name]: value });
    };

    const validateFormLogin = async () => {
      let UserRol = '';
      let UserId = ''
      let errors = {};

      if (!formDataLogin.email1) {
        errors.email1 = "El correo es obligatorio";
      }

      if (!formDataLogin.passwordL) {
        errors.passwordL = "La contraseña es obligatoria";
      }

      try{
        const response = await fetch(`http://localhost:3001/user`,{
          method: 'GET'
        })

        if(!response.ok){
          throw new Error('Error al momento de consultar los datos de el usuario')
        }
        
        const result = await response.json()
        const data = result.data.docs;

        let isValid = false;

        for(const item of data){

          console.log('datos: ', item.email, 'contraseña: ', item.password)
          
          if(item.email === formDataLogin.email1 && item.password === formDataLogin.passwordL){
            isValid = true;
            UserRol = item.rol;
            UserId = item._id;
          }
        }

        if(!isValid){
          const emailExist = data.some((item) => item.email ===  formDataLogin.email1)
          if(!emailExist){
            errors.email1 = 'El correo es incorrecto'
          }else{
            errors.passwordL = 'Lacontraseña es incorrecta'
          }
        }
      }catch(error){
        console.error('Error al momento de consultar los datos del usuario')
      }

      return { errors, UserRol, UserId };
    };

    
    const handleSubmitLogin = async (e) => {
      e.preventDefault();
      
      const {errors, UserRol, UserId} = await validateFormLogin();

      setFormErrorsLogin(errors);
      setIsSubmitLogin(true);

      if (Object.keys(errors).length === 0) {
        setIsSubmitLogin(true);
        console.log('Redirigiendo según el rol del usuario...');
        saveUserRol(UserRol);
        saveUserId(UserId);
      
        switch (parseInt(UserRol)) {
          case 1:
            navigate('/dashboard');
            break;
          case 2:
            navigate('/dashboard-employe');
            break;
          case 3:
            navigate('/dashboard-client');
            break;
          default:
            console.log('Rol del usuario no reconocido');
            break;
        }
      }


    };

    useEffect(() => {
      if (Object.keys(formErrorsLogin).length === 0 && isSubmitLogin) {
        console.log('Formulario de login enviado con éxito', formDataLogin);
      }
    
    }, [formErrorsLogin, isSubmitLogin, formDataLogin]);
    
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    }
    
    return (
      <>
        <div className='container-login'>
          <div className={theme === 'light' ? 'app light' : 'app dark'}>
            <nav className="navbar1">
              <div className="navbar-logo">
                <h2></h2>
              </div>

              <div className={`nav-links ${isOpen ? 'open' : ''}`}>
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </Link>
              </div>

              <div className="menu-icon" onClick={toggleMenu}>
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </div>
            </nav>

            <div className="container">

              <div className='containerForm'>
                <div className="container1">
                  <img  src={fondo} alt="Fondo" className="cont" />
                </div>

              <div className='formContainer'>
                <h1>Iniciar Sesión</h1>
                <br />
                <form id='formValidationLogin' onSubmit={handleSubmitLogin}>
                  <div className="inputContainer">
                    <input
                      type="text"
                      name='email1'
                      className="inputContainerInput"
                      value={formDataLogin.email1}
                      onChange={handleInputChangeLogin}
                    />
                    <label className="inputContainerLabel">Correo</label>
                    {formErrorsLogin.email1 && <p className='error'>{formErrorsLogin.email1}</p>}
                    <p></p>
                  </div>
                  <div className="inputContainer">
                    <input
                      type="password"
                      name='passwordL'
                      className="inputContainerInput"
                      value={formDataLogin.passwordL}
                      onChange={handleInputChangeLogin}
                    />
                    <label className="inputContainerLabel">Contraseña</label>
                    {formErrorsLogin.passwordL && <p className='error'>{formErrorsLogin.passwordL}</p>}
                    <p></p>
                  </div>
                  <button type='submit' className="InputButton1">Ingresar</button>
                </form>
                <button className='toggleButton' onClick={handleRedirect1}> No tienes cuenta has clic aqui </button> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    );
  };

  export default Login;
