import './soportChat.css'
import chat from '../../assets/img/chat-en-vivo.png'
import { useEffect, useRef, useState } from 'react'
import Jose from '../../assets/img/empleado-de-oficina1.png'
import Enviar from '../../assets/img/enviar.png'
import Notificacion from '../../assets/sounds/Notificacion.mp3'

function SoportChat (){
  const METODO_PAGO_URL = "https://tupagina.com/metodos-de-pago";
    const [isChatVisible, setIsChatVisible] = useState(false)
    const [waitingForDocument, setWaitingForDocument] = useState(false);
    const [serviceData, setServiceData] = useState([])
    const [message, setMessages] = useState([
        {
            sender: 'bot', text: `Hola, bienvenido a tu chat 😊\n¿En que puedo ayudarte?`,
            buttons:["Falla conexión", "Cambiar Contraseña", "Cancelar Servicio", "Cambio de plan", "Traslado", "Solicitar servicio", "PQR(Peticion, Queja, Reclamo)", "Pagar Facturas", "Cambio de titular", "Otro"]
        }
    ])

    const [handleNewMessage, setHandleNewMessage] = useState(false)
    const [userInput, setUserInput] = useState("");
    const audioRef = useRef(new Audio(Notificacion))

    const toggleChat=()=>{
        setIsChatVisible(!isChatVisible)
        setHandleNewMessage(false)
    }

    const handleUserInput = (e) => {
        setUserInput(e.target.value)
    }

    const closeChat = () => {
        setIsChatVisible(false)
    }
    
    const addBotMessage = (text, buttons) => {
      setMessages((prev) => [...prev, { sender: 'bot', text, buttons }]);
  
      if (isChatVisible) {
          setHandleNewMessage(true);
          playNotificacionSound();
      }
  };
  

    const wisphub = async (cedula) => {
      try {
        const response = await fetch(`http://localhost:3001/wisphub-data/${cedula}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if(!response.ok){
          throw new Error(`Error al momento de consultar los datos da la cedula: ${cedula}`); 
        }

        const data = await response.json();
        const result = data.data;
        console.log('datos: ', result)
        if(response && result.length > 0){
          setServiceData(result)
            setTimeout(() => addBotMessage(`se encontraron los siguientes servicios, si desea consultar uno has clic en el servicio a consultar. `,
                result.map(item => item.usuario) ), 1000)
               
        }else{
            setMessages((prevMessage) => [
                ...prevMessage, { sender: 'bot', text: `No se encontro servicios asociados con la cedual ${cedula} 😢`}
            ])
        }
      } catch (error) {
        console.error('Error al momento de consutlar los datos de la api: ', error)
      }
    }

    const sendMessage = () => {
        if(userInput.trim() === "" ) return;
         setMessages((prevMessage) => [...prevMessage, {sender: "user", text: userInput}])

         if (waitingForDocument) {
            wisphub(userInput)
            setWaitingForDocument(false)
          } else if (userInput.toLowerCase().includes('consultar')) {
            setTimeout(()=> addBotMessage('Consultando, por favor ingrese su número de documento'),1000) 
            setWaitingForDocument(true)
          } else if (userInput.toLowerCase().includes('personal')) {
            setTimeout(() => addBotMessage('Nuestro personal está conformado por Jose y Ambar'),1000)
          } else {
            setTimeout(() => addBotMessage('Lo siento, no entiendo esa solicitud 😢'),1000)
          }
         setUserInput("")
    }

    const handleButtonClick = async (option) => {
      setMessages((prevMessage) => [...prevMessage, { sender: 'user', text: option }]);
  
      if (option === "Falla conexión") {
        setTimeout(() => addBotMessage(`Al parecer tienes problemas con tu servicio, vamos a hacer unas pruebas para poder ayudarte. \n¿Qué tipo de problema tiene? escoja el problema que desea solucionar:`,
          ["✅ No tengo internet.", "🐢 Internet lento.", "🌐 No cargan páginas.", "📺 Señal de Televisión.", "⚡ Internet inestable.", "🔘Otro problema"]
        ),1000);
        setWaitingForDocument(true);
      } else if (option === "Cambiar Contraseña") {
        setTimeout(() => addBotMessage(`Para poder solicitar el cambio de contraseña, te vamos a solicitar unos datos, los cuales vas a enviar en un solo mensaje separado por *Comas*, *Tipo lista sin números ni caracteres especiales*, o tambien *De corrido pero con espacios*. \n
            Los datos son: 
            \n
            1️⃣ Nombre completo del titular del servicio.
            \n
            2️⃣ Número de documento del titular.
            \n
            3️⃣Número de teléfono o contacto.
            \n
            4️⃣Correo electrónico registrado.
            \n
            5️⃣Servicio por el cual solicita el cambio de contraseña.
            \n
            6️⃣Motivo de cambio de contraseña.
            \n
            si no tiene correo registrado escriba *null*.`), 1000);
      } else if (option === "Cancelar Servicio") {
        setTimeout(() => addBotMessage(`Señor/a, para realizar esta acción puedes acercarte a la oficina más cercana con la fotocopia de la cedula y la carta con el motivo de porque va a cancelación el servicio.`), 1000);
      } else if(option === "Cambio de plan"){
        setTimeout(() => addBotMessage(`Para poder solicitar un cambio de plan, te vamos a solicitar unos datos, los cuales vas a enviar en un solo mensaje separado por *Comas*, *Tipo lista sin números ni caracteres especiales*, o tambien *De corrido pero con espacios*.\n 

          Los datos son: 
          \n
          1️⃣ Nombre completo del titular del servicio.
          \n
          2️⃣ Número de documento del titular.
          \n
          3️⃣ El servicio que desea cancelar *(Internet, TV, etc.)*.
          \n
          6️⃣Motivo de la cancelación del servicio.`), 1000);
      }else if(option === 'Traslado'){
        setTimeout(() => addBotMessage('Señor/a, para poder realizar esta acción puede pasar a la oficina más cercana con carta del traslado, copia del recibo del nuevo domicilio ya sea de la luz, del agua, etc.'), 1000)
      }else if(option === 'Solicitar servicio'){
        setTimeout(() => addBotMessage(`Señor/a, para realizar esta acción puede acercarse a la oficina mas cercana y llevar la *Fotocopia del documento*.
          \nSi usted no es el dueño de la casa tiene que llevar la fotocopia del documento, con una carta firmada por el sueño de la casa dando el permiso para poder instalar el servicio y un recibo de la casa.`), 1000)
      }else if(option === 'PQR(Peticion, Queja, Reclamo)'){
        setTimeout(() => addBotMessage(`Para realizar la solicitud de un *PQR* te vamos a solicitar unos datos para poder pasarte con un asesor. Los datos que te solicitamos los vas a enviar en un solo mensaje donde pondrás los datos separados por *Comas*, *Tipo lista sin caracteres especiales* o *De corrido con Espacios*. 
          \n
            Si vas a agregar la fecha que sea de la siguiente manera *dd-mm-aa* o tambien podría ser de la siguiente manera *dd/mm/aa*.
            \n
            Los datos son: 
            \n
            📌 Nombre completo
            \n
            🔢 Número de documento.
            \n
            📂 Tipo de solicitud *(Petición, Queja, Reclamo).
            \n
            📆 Fecha de cuando ocurrió.
            \n
            📝Descripción del problema.`), 1000)
      }else if (option === 'Pagar Facturas') {
        setTimeout(() => addBotMessage(
            `Señor/a, para poder realizar esta acción puede acercarse a la dirección Cra. 19c Sur #52-26, Barrio San Carlos, Bogotá, de lunes a viernes de 8 am a 4:30 pm y los sábados de 9 am a 4 pm y realizar el pago.\n\n` +
            `Si desea realizar el pago por otro medio, haga clic en el botón:`,
            [{ text: "🔗 Métodos de Pago", link: METODO_PAGO_URL }]
        ), 1000);
    }else if(option === 'Cambio de titular'){
        setTimeout(() => addBotMessage())
      }else if(option === 'Otro'){
        setTimeout(() => addBotMessage(''))
      }
  };
  

    //notificacion
    const playNotificacionSound = () =>{
        audioRef.current.play().catch((error)=>{
            console.error('Error al reproducir el sonido: ', error)
        })
    }

    return(
        <div className="Schats">
            <div className="chat-icon-container" onClick={toggleChat}>

              <img src={chat} className='chat-icon' alt='Chat De Soporte' />
              {handleNewMessage && <span className="notification-circle"></span>}
            </div>

            <div className={`chat-box ${isChatVisible ? 'visible': ''}`}>
                <div className='contentTitleJ'>
                    <img src={Jose} alt='Soporte En Linea' />
                    <p>Jose</p>
                    <span className='noti'></span>
                    <p className='linea'>En Linea</p>
                </div>

                <button className='close-btn' onClick={closeChat}>X</button>
                <div key={index} className={`message ${message.sender}`}>
                  {message.text.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                
                  {message.buttons && Array.isArray(message.buttons) && message.buttons.length > 0 && (
                    <div className="button-container">
                      {message.buttons.map((btn, i) => (
                        <a
                          key={i} 
                          href={btn.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="chat-button"
                        >
                          {btn.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>


                <div className='content-input'>
                    <input
                        type='text'
                        placeholder='Escribe tu respuesta...'
                        className='chat-input'
                        value={userInput}
                        onChange={handleUserInput}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button className='send-btn' onClick={sendMessage}><img src={Enviar}/> </button>
                </div>
            </div>
        </div>
    )
}

export default SoportChat