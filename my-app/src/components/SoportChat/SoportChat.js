import './soportChat.css'
import chat from '../../assets/img/chat-en-vivo.png'
import { useEffect, useRef, useState } from 'react'
import Jose from '../../assets/img/empleado-de-oficina1.png'
import Enviar from '../../assets/img/enviar.png'
import Notificacion from '../../assets/sounds/Notificacion.mp3'

function SoportChat (){
    const [isChatVisible, setIsChatVisible] = useState(false)
    const [waitingForDocument, setWaitingForDocument] = useState(false);
    const [serviceData, setServiceData] = useState([])
    const [message, setMessages] = useState([
        {
            sender: 'bot', text: `Hola, bienvenido a tu chat 😊\n¿En que puedo ayudarte?\n1. Consultar datos.\n2. Personal`
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

    const handleButtonClick = async(service) => {
        setMessages((prevMessage) => [
            ...prevMessage,
            {sender: 'user', text: service},
        ])

        const selectServiced = serviceData.find(item =>  item.usuario === service)

        setTimeout(()=>addBotMessage(`Consultando detalles del servicio: ${service}`),1000)
        if(selectServiced){
          setTimeout(()=> addBotMessage(
            `Detallesdel servicio seleccionado : \nNombre: ${selectServiced.nombre}\nEmail: ${selectServiced.email}\nTelefono: ${selectServiced.telefono}`
          ),3000)
        }else{
          setTimeout(()=> addBotMessage(
            `No se encontraron datos asociados al servicio 😢`
          ),3000)
        }
    }

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
                <div className='content-messages'>
                  {message.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                      {message.text.split("\n").map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                      {message.buttons && (
                        <div className="buttons-container">
                          {message.buttons.map((buttonText, btnIndex) => (
                            <button
                              key={btnIndex}
                              onClick={() => handleButtonClick(buttonText)}
                              className="service-button"
                            >
                              {buttonText}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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