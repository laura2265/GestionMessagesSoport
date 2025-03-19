import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../../ThemeContext"
import Navbar from "../../../navbar/Navbar";
import SliderDashboard from "../../../navbar/SliderDashboard";
import ModoClaro from '../../../../assets/img/soleado.png'
import ModoOscuro from '../../../../assets/img/modo-oscuro.png'
import { redirect, useNavigate } from "react-router-dom";
import createdUser from '../../../../assets/img/createdUser.png'

function CreatedEmple (){

    //variables para la validacion

    //validaciones
    const text = /^[A-Za-z Á-Úá-úñÑ]{3,20}$/;
    const emailParttern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordV = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    const number = /^[0-9]{1,10}$/
    const addressParttern = /^[A-Za-z0-9\s.,#-]{5,50}$/

    //variables globales
    const {theme, toggleTheme} = useContext(ThemeContext)
    const navigate = useNavigate();
    const [formError, setFormErrors] = useState({})
    const [formAditionalError, setFormAditionalError ]= useState({})

    //datos del formulario
    const [formData, setFormData]= useState({
      typeDocument: '',
      numberDocument: '',
      name: '',
      lasName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    const [additionalData, setAditionalData] = useState({
        phone: '',
        address: '',
        estado:'',
        area:'',
        cargo:'',
    })

    //valua los datos
    const handleAdditionalChange = (e) => {
        const { name, value } = e.target;
        setAditionalData((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    //validaciones de los campos
    const validateForm = () => {
        let errors = {}

        if(formData.typeDocument === ''){
            errors.typeDocument = 'Este campo es obligatorio'
        }

        if(!number.test(formData.numberDocument)){
            errors.numberDocument = 'El numero de docuemnto no es valido'
        }

        if(!text.test(formData.name)){
            errors.name = 'el nombre no es valido'
        }

        if(!text.test(formData.lasName)){
            errors.lasName = 'el apellido no es valido'
        }

        if(!emailParttern.test(formData.email)){
            errors.email = 'El correo no es valido'
        }
        
        if(!passwordV.test(formData.password)){
            errors.password = 'la contraseña no es valida'
        }

        return errors
    }

    //validaciones adicionales
    const validacionesAdicionales = () => {
        let errors1 = {}

        if(!number.test(additionalData.phone)){
            errors1.phone = 'El numero no es valido'
        }
        
        if(!addressParttern.test(additionalData.address)){
            errors1.address = 'La direccion no es valida'
        }
        
        if(!text.test(additionalData.cargo)){
            errors1.cargo = 'La direccion no es valida'
        }
        
        if(!text.test(additionalData.area)){
            errors1.area = 'La direccion no es valida'
        }
        return errors1
    }

    const handleInputChange=(e) => {
        const { name, value } = e.target;
        setFormData((prevState)=>({
            ...prevState,
            [name]: value,
        }))
    }

    //para registrar al usuario
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const errors = validateForm();
        setFormErrors(errors);
    
        const errors1 = validacionesAdicionales();
        setFormAditionalError(errors1);
    
        // Verifica si hay errores
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
            lasName: formData.lasName,
            email: formData.email,
            password: formData.password,
            rol: 2,
            telefono: additionalData.phone,
            direccion: additionalData.address,
            estado: 'Activo',
            area: additionalData.area,
            cargo: additionalData.cargo,
        };

        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        const raw = JSON.stringify(dataToSend);

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        try {
            const response = await fetch('http://localhost:3001/user', requestOptions);

            if (!response.ok) {
                throw new Error('Error al registrar el usuario');
            }
            const data = await response.json();
            console.log(data);
            alert('Empleado registrado correctamente')
            navigate('/data-empleado')
        } catch (error) {
            console.error('Error al momento de registrar el usuario', error);
        }
    };

    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderDashboard></SliderDashboard>
                    </div>
                </div>
                <div className="BarraSuperior">
                    <h1>Crear Empleado</h1>
                    <a  className='ButtonTheme1' onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro}></img> </a>
                </div>
                <div className="contentCreatedEmple">
                    <div className="contentFormCreated">
                        <div className="contentCreatedF">
                            <form onSubmit={handleSubmit}>
                                <img className="imgCreated" src={createdUser}></img>
                                <div className="contentForm1Created">
                                    <div className="content1F">
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
                                            {formError.numberDocument && <p className="error">{formError.numberDocument}</p>}
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
                                            {formError.name && <p className="error">{formError.name}</p>}
                                            <p></p>
                                        </div> 
                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='lasName'
                                            className="inputContainerInput"
                                            value={formData.lasName}
                                            onChange={handleInputChange}
                                            />
                                            <label className="inputContainerLabel">Apellido</label>
                                            {formError.lasName && <p className="error">{formError.lasName}</p>}
                                            <p></p>
                                        </div> 
                                        <div className="inputContainer">
                                            <input
                                            type="number"
                                            name='phone'
                                            className="inputContainerInput"
                                            value={additionalData.phone}
                                            onChange={handleAdditionalChange}
                                            />
                                            <label className="inputContainerLabel">Telefono</label>
                                            {formAditionalError.phone && <p className="error">{formAditionalError.phone}</p>}
                                            <p></p>
                                        </div>
                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='address'
                                            className="inputContainerInput"
                                            value={additionalData.address}
                                            onChange={handleAdditionalChange}
                                            />
                                            <label className="inputContainerLabel">Direccion</label>
                                            {formAditionalError.address && <p className="error">{formAditionalError.address}</p>}
                                            <p></p>
                                        </div> 
                                    </div>

                                    <div className="content1F">
                                        <div className="inputContainer">
                                            <input
                                            type="email"
                                            name='email'
                                            className="inputContainerInput"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            />
                                            <label className="inputContainerLabel">Email</label>
                                            {formError.email && <p className="error">{formError.email}</p>}
                                            <p></p>
                                        </div>

                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='area'
                                            className="inputContainerInput"
                                            value={additionalData.area}
                                            onChange={handleAdditionalChange}
                                            />
                                            <label className="inputContainerLabel">Area</label>
                                            {formAditionalError.area && <p className="error">{formAditionalError.area}</p>}
                                            <p></p>
                                        </div>

                                        <div className="inputContainer">
                                            <input
                                            type="text"
                                            name='cargo'
                                            className="inputContainerInput"
                                            value={additionalData.cargo}
                                            onChange={handleAdditionalChange}
                                            />
                                            <label className="inputContainerLabel">Cargo</label>
                                            {formAditionalError.cargo && <p className="error">{formAditionalError.cargo}</p>}
                                            <p></p>
                                        </div>

                                        <div className="inputContainer">
                                            <input
                                            type="password"
                                            name='password'
                                            className="inputContainerInput"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            />
                                            <label className="inputContainerLabel">Contraseña</label>
                                            {formError.password && <p className="error">{formError.password}</p>}
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
                                            {formError.confirmPassword && <p className="error">{formError.confirmPassword}</p>}
                                            <p></p>
                                        </div>

                                    </div>
                                </div>
                                <div className="buttonContent">
                                    <button type="submit" className="InputButton">Registrar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreatedEmple