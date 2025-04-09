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
            sender: 'bot', text: `Hola, bienvenido a tu chat 😊\n¿En que puedo ayudarte?`,
            buttons:["Falla conexión", "Cambiar Contraseña", "Cancelar Servicio", "Cambio de plan", "Traslado", "Solicitar servicio", "PQR(Peticion, Queja, Reclamo)", "Pagar Facturas", "Cambio de titular", "Otro"]
        }
    ])
    const [userId, setUserid] = useState("")
    const [chatHistory, setChatHistory] = useState([]);

    const addUserMessage = () => {

    }

    const historyUserMessage = (message) =>{
      setChatHistory(prev => [...prev, {from: 'user', message}]);
    }

    const historyBotMessage = (message) => {
      setChatHistory(prev => [...prev, {from: 'bot', message}])
    }

    const validStatesSinInternet = [
      "SeguirWifiSinInternetMultiplesEquipo",
      "SeguirCableSinInternetUnEquipo",
      "SeguirWifiSinInternetUnEquipo",
      "CableMultiplesEquipoSinInternet",
      "WindowsUnEquipoSinInternet",
      "MacUnEquipoSinInternet",
      "AndroidUnEquipoSinInternet",
      "iPhoneUnEquipoSinInternet",
      "WindowsCableUnEquipoSinInternet",
      "WindowsMultiplesEquipoSinInternet",
      "MacMultiplesEquipoSinInternet",
      "AndroidMultiplesEquipoSinInternet",
      "iPhoneMultiplesEquipoSinInternet"
    ];

    const validStatesSinInternetBombilloLos = [
      "EstaEncendidoElBombillo",
      "EstaApagadoElBombillo",
      "BombilloLosEncendido",
      "BombilloLosApagado",
      "BombilloLosApagadoSeguir"
    ]

    const validStatesTestVelocidad = [
      "MasDel50InternetInestable",
      "MenosDel50InternetInestable",
      "InternetLentoOInestable"
    ]

    const validStatePaginasNoCarga1 = [
      "UnaPaginaNoCarga",
      "WindowsVariasPaginas", 
      "MacVariasPaginas",
      "AndroidVariasPaginas",
      "iPhoneVariasPaginas",
      "WindowsNingunaPagina",
      "MacNingunaPagina",
      "WindowsVariosDispositivos", 
      "iPhoneVariosDispositivos",
      "AndroidVariosDispositivos",
      "MacVariosDispositivos"
    ]

    const validStatePaginasNoCargaVpn = [
      "ConfirmacionVPN",
      "NoTieneVPN",
      "ComputadorVpn",
      "CelularVpn"
    ]

    const validStateSinSeñal1 = [
      "DistorcionadaSeñalTv",
      "EnVariosCanalesSinSeñal",
      "CableDesconectadoSinSeñal",
      "CableConectadoSinSeñal"
    ]

    const validStateSinSeñalFinal = [
      "ApagadoCatv","EncendidoCatv"
    ]

    const validStateRedInestableFinal =[
      "EncendidoCanleLan",
      "ApagadoCanleLan",
      "LaSeñalDebilWifiInestable",
      "SeDesconectaWifiInestable",
      "CelularOTabletNoseDispositivo",
      "EncendidoLaRedNoAparece",
      "ApagadoLaRedNoAparece",
      "PcWIfiNoSabe",
      "cablePcNoSabe"
    ] 

    const [stateChat, setStateChat] = useState(null);
    const [option, setOption] = useState(null);

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
    useEffect(()=>{
      let existingUserId = localStorage.getItem('chatUsers');
      if(!existingUserId){
        const newId = Crypto.randomUUID();
        localStorage.setItem('chatUserId', newId);
        existingUserId = newId
      }
      setUserid(existingUserId);
    })

    const sendMessage = () => {
        if(userInput.trim() === "" ) return;
         setMessages((prevMessage) => [...prevMessage, {sender: "user", text: userInput}])

         if (waitingForDocument) {
            wisphub(userInput);
            setWaitingForDocument(false)
          } else if (userInput.toLowerCase().includes('seguir')){
            setTimeout(()=> addBotMessage('Hola, bienvenido a tu chat 😊\n¿En que puedo ayudarte?',
              ["Falla conexión", "Cambiar Contraseña", "Cancelar Servicio", "Cambio de plan", "Traslado", "Solicitar servicio", "PQR(Peticion, Queja, Reclamo)", "Pagar Facturas", "Cambio de titular", "Otro"]
            ),1000)
            setWaitingForDocument(true)
          } else if (userInput.toLowerCase().includes('personal')) {
            setTimeout(() => addBotMessage('Nuestro personal está conformado por Jose y Ambar'),1000)
          } else {
            setTimeout(() => addBotMessage('Lo siento, no entiendo esa solicitud 😢'),1000)
          }
         setUserInput("");
    }

    const handleButtonClick = async (option) => {
      setOption(option)
      setMessages((prevMessage) => [...prevMessage, { sender: 'user', text: option }]);

      if (option === "Falla conexión") {
        setStateChat("Falla conexión")

        setTimeout(() => addBotMessage(`Al parecer tienes problemas con tu servicio, vamos a hacer unas pruebas para poder ayudarte. \n¿Qué tipo de problema tiene? escoja el problema que desea solucionar:`,
          ["✅ No tengo internet.", "🐢 Internet lento.", "🌐 No cargan páginas.", "📺 Señal de Televisión.", "⚡ Internet inestable.", "🔘Otro problema"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === "✅ No tengo internet." &&  stateChat === "Falla conexión"){
        setStateChat("sininternet")
        setTimeout(() => addBotMessage(`Para poder ayudare con tu problema, Podrías escoger la opción *Un equipo*, de lo contrario escoge la opción *Múltiples equipos*`,
          ["📱 Un equipo", "💻📱 Múlples aquipos"]
        ),1000);
        setWaitingForDocument(true)

      }else if(option === '📱 Un equipo' &&  stateChat === "sininternet"){
        setStateChat("UnEquipoSinInternet")
        setTimeout(() => addBotMessage(`¿Estas conectado a *WIFI* o cable *Ethernet*?`,
          ["📶 WIFI", "🔌 Cable Ethernet"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === '💻📱 Múlples aquipos'){
        setStateChat("MultiplesEquiposSinInternet")
        setTimeout(() => addBotMessage(`¿Estás conectado por *WIFI* o por cable *Ethernet*?`,
          ["📶WIFI", "🔌Cable Ethernet"]
        ),1000);
        setWaitingForDocument(true);

        //wifi o cable un solo equipo
      }else if(option === '📶 WIFI' && stateChat === "UnEquipoSinInternet"){
        setStateChat("WifiUnEquipoSinInternet")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a presentar una serie de soluciones para ayudarte con tu problema:
          \n1️⃣ Olvida la red *WIFI* y vuelve a conectarte.
          \n2️⃣ Prueba con otra red *WIFI* o con datos si es posible.
          \n3️⃣ Actualiza el sistema operativo del sistema.
          \nSi no sabes realizar el ultimo punto, escoge la opción *Ayuda*, de lo contrario escoge la opción *Seguir*`,
          ["🆘 Ayuda", "➡️ Seguir"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === '🔌 Cable Ethernet'&& stateChat === "UnEquipoSinInternet"){
        setStateChat('CableUnEquipoSinInternet')
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a presentar una serie de soluciones para ayudarte con tu problema:
          \n1️⃣ Olvida la red *WIFI* y vuelve a conectarte.
          \n2️⃣ Prueba con otra red *WIFI* o con datos si es posible.
          \n3️⃣ Actualiza el sistema operativo del sistema.
          \nSi no sabes realizar el ultimo punto, escoge la opción *Ayuda*, de lo contrario escoge la opción *Seguir*`,
          ["🆘 Ayuda", "➡️ Seguir"]
        ),1000);
        setWaitingForDocument(true);

        //wifi o cable multiples equipos
      }else if(option === '📶WIFI' && stateChat === "MultiplesEquiposSinInternet"){
        setStateChat("WifiMultiplesEquipoSinInternet")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar un paso a paso para poder ayudarte.
          \n
            1️⃣ Apaga el *Modem*, espera 5 minutos y vuelve a encenderlo.
            \n
            2️⃣Cambia los *DNS* a (*8.8.8.8* y *8.8.4.4).
            \n
            Si no sabes como realizar el ultimo puto escoge la opción *Ayuda*, de lo contrario escoge  la opción *Seguir*`,
          ["🆘 Ayuda", "➡️ Seguir"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === '🔌Cable Ethernet'&& stateChat === "MultiplesEquiposSinInternet"){
        setStateChat("CableMultiplesEquipoSinInternet")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones que puedes utilizar:
          \n
            1️⃣ Revisa que el cale este bien conectado en ambos extremos.
            \n
            2️⃣ Si es posible prueba otro cable
            \n
            3️⃣ Apaga el *Modem*  y el dispositivo, después de encender los dispositivos.
            \n
            4️⃣ Prueba conectado en otro puerto el cable.`),1000);
            setTimeout(() => addBotMessage(`Si esto te funciono, podrías escoger la opción *Si funciono*, de lo contrario *No funciono*.`,
              ['✅ Si funciono', '❎ No funciono'],
              1000))
        setWaitingForDocument(true);

        //Ayuda o seguir un solo equipo wifi
      }else if(option === '🆘 Ayuda' && stateChat === "WifiUnEquipoSinInternet"){
        setStateChat("AyudaWifiSinInternetUnEquipo")
        setTimeout(() => addBotMessage(`Para poder ayudarte con esto, nos podrías indicar que tipo de dispositivo estas utilizando.`,
          ["🔹 Windows", "🔹Mac", "🔹Android", "🔹iPhone"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === '➡️ Seguir' && stateChat === "WifiUnEquipoSinInternet"){
        setStateChat("SeguirWifiSinInternetUnEquipo")
        setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);
        setWaitingForDocument(true);

        //Ayuda o seguir un equipos cable
      }else if(option === '🆘 Ayuda' && stateChat === "CableUnEquipoSinInternet"){
        setStateChat("AyudaCableSinInternetUnEquipo")
        setTimeout(() => addBotMessage(`Para poder ayudarte con esto, nos podrías indicar que tipo de dispositivo estas utilizando.`,
          ["🔹 Windows", "🔹Mac"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === '➡️ Seguir' && stateChat === "CableUnEquipoSinInternet"){
        setStateChat("SeguirCableSinInternetUnEquipo")
        setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);
        setWaitingForDocument(true);

        //Ayuda o seguir multiples equipos wifi
      }else if(option === '🆘 Ayuda' && stateChat === "WifiMultiplesEquipoSinInternet"){
        setStateChat("AyudaWifiSinInternetMultiplesEquipo")
        setTimeout(() => addBotMessage(`Para poder ayudarte con esto, nos podrías indicar que tipo de dispositivo estas utilizando.`,
          ["🔹 Windows", "🔹Mac", "🔹 Android", "🔹iPhone"]
        ),1000);
        setWaitingForDocument(true);

        //dispositivo internet
      }else if(option === '➡️ Seguir' && stateChat === "MultiplesEquiposSinInternet"){
        setStateChat("SeguirWifiSinInternetMultiplesEquipo")
        setTimeout(() => addBotMessage(`Si te funciono, podrías escoger la opción  *Si funciona*, de lo contrario escoge la opción *No funciona*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);
        setWaitingForDocument(true);

       
        //dispositivo internet de wifi un dispositivo
      }else if(option === '🔹 Windows' && stateChat === "AyudaWifiSinInternetUnEquipo"){
        setStateChat("WindowsUnEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:

            \n 1️⃣ Pulse *Windows+i* y haz clic en Windows Update.

            \n 2️⃣Haz clic en *Buscar actualizaciones* y sigue las instrucciones.

            \n 3️⃣Si hay actualizaciones pendientes, instala y reinicia el *Dispositivo*.`),1000);

            setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
              ["✅ Si funciono", "❎ No funciono"]
            ), 1000)
        setWaitingForDocument(true);

      }else if(option === '🔹Mac'&& stateChat === "AyudaWifiSinInternetUnEquipo"){
        setStateChat("MacUnEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
            \n
            1️⃣ Conéctate a una red *WIFI*.
            \n
            2️⃣ Ve a menú de Apple 🍏, luego a *Configuración del sistema* y por ultimo a *General*.
            \n
            3️⃣Selecciona *Actualización de software*.
            \n
            4️⃣ Si hay una actualización disponible, haz clic en *Actualizar ahora*.
            \n
            5️⃣Espera a que termine y si es necesario reinicia el *Dispositivo*.`),1000);
            setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
              ["✅ Si funciono", "❎ No funciono"]
            ), 1000)
        setWaitingForDocument(true);
      }else if(option === '🔹Android'&& stateChat === "AyudaWifiSinInternetUnEquipo"){
        setStateChat("AndroidUnEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
          \n
          1️⃣ Conéctate a una red *WIFI*.
          \n     
          2️⃣ Ve a *Ajustes*, luego te diriges a *Sistema* y por ultimo a *Actualización de software*.
          \n    
          3️⃣ Entra en *Buscar actualizaciones*.
          \n     
          4️⃣ Si hay actualizaciones disponibles, descárguela  e instálela.
          \n    
          5️⃣Si es necesario reinicie el *Dispositivo*.`),1000);

          setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
            ["✅ Si funciono", "❎ No funciono"]
          ), 1000)
        setWaitingForDocument(true);
      }else if(option === '🔹iPhone'&& stateChat === "AyudaWifiSinInternetUnEquipo"){
        setStateChat("iPhoneUnEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
          \n
          1️⃣ Conéctate a una red *WIFI*.
          \n
          2️⃣Ve a *Ajustes*, luego te diriges a *General* y por ultimo a *Actualización de software*
          \n
          3️⃣ Si hay actualizaciones pendientes, descargarlas e instalarlas.
          \n
          4️⃣Si es necesario reinicie el .*Dispositivo*`),1000);

          setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
            ["✅ Si funciono", "❎ No funciono"]
          ), 1000)
        setWaitingForDocument(true);

        //dispositivo cable un dispositivo
      }else if(option === '🔹 Windows' && stateChat === "AyudaCableSinInternetUnEquipo"){
        setStateChat("WindowsCableUnEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
          \n
                1️⃣ Pulsa *Windows+R* y en la ventana que sale, escribe *ncpa.cpl* y pulsa *Enter*.
                \n
                2️⃣ Busca tu conexión, que en este caso es *Ethernet*
                \n
                3️⃣ Si sale *Deshabilitado*, haz clic derecho en tu red y habilita la red.`),1000);

            setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
              ["✅ Si funciono", "❎ No funciono"]
            ), 1000)
        setWaitingForDocument(true);

      }else if(option === '🔹Mac'&& stateChat === "AyudaCableSinInternetUnEquipo"){
        setStateChat("MacCableUnEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
          \n
              1️⃣ Ve al menú de *Apple* , luego te diriges a *Configuración del sistema* y por ultimo a *Red*
              \n
              2️⃣Asegúrate de que *Ethernet* aparezca *Conectado*, si aparece *No conectado*, conecta bien el cable o utiliza otro cable.`),1000);
            setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
              ["✅ Si funciono", "❎ No funciono"]
            ), 1000)
        setWaitingForDocument(true);
      }else if(option === '🔹 Windows' && stateChat === "AyudaWifiSinInternetMultiplesEquipo"){
        setStateChat("WindowsMultiplesEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:

            \n 1️⃣ Pulse *Windows+i* y haz clic en Windows Update.

            \n 2️⃣Haz clic en *Buscar actualizaciones* y sigue las instrucciones.

            \n 3️⃣Si hay actualizaciones pendientes, instala y reinicia el *Dispositivo*.`),1000);

            setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
              ["✅ Si funciono", "❎ No funciono"]
            ), 1000)
        setWaitingForDocument(true);


        //Dispositivo sin internet varios dispositivos wifi
      }else if(option === '🔹Mac'&& stateChat === "AyudaWifiSinInternetMultiplesEquipo"){
        setStateChat("MacMultiplesEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
            \n
            1️⃣ Conéctate a una red *WIFI*.
            \n
            2️⃣ Ve a menú de Apple 🍏, luego a *Configuración del sistema* y por ultimo a *General*.
            \n
            3️⃣Selecciona *Actualización de software*.
            \n
            4️⃣ Si hay una actualización disponible, haz clic en *Actualizar ahora*.
            \n
            5️⃣Espera a que termine y si es necesario reinicia el *Dispositivo*.`),1000);
            setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
              ["✅ Si funciono", "❎ No funciono"]
            ), 1000)
        setWaitingForDocument(true);
      }else if(option === '🔹 Android'&& stateChat === "AyudaWifiSinInternetMultiplesEquipo"){
        setStateChat("AndroidMultiplesEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
          \n
          1️⃣ Conéctate a una red *WIFI*.
          \n     
          2️⃣ Ve a *Ajustes*, luego te diriges a *Sistema* y por ultimo a *Actualización de software*.
          \n    
          3️⃣ Entra en *Buscar actualizaciones*.
          \n     
          4️⃣ Si hay actualizaciones disponibles, descárguela  e instálela.
          \n    
          5️⃣Si es necesario reinicie el *Dispositivo*.`),1000);
        
          setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
            ["✅ Si funciono", "❎ No funciono"]
          ), 1000)
        setWaitingForDocument(true);
      }else if(option === '🔹iPhone'&& stateChat === "AyudaWifiSinInternetMultiplesEquipo "){
        setStateChat("iPhoneMultiplesEquipoSinInternet")
        setTimeout(() => addBotMessage(`A continuación te mostraremos el paso a paso para revisar si la tarjeta de red del dispositivo esta habilitada:
          \n
          1️⃣ Conéctate a una red *WIFI*.
          \n
          2️⃣Ve a *Ajustes*, luego te diriges a *General* y por ultimo a *Actualización de software*
          \n
          3️⃣ Si hay actualizaciones pendientes, descargarlas e instalarlas.
          \n
          4️⃣Si es necesario reinicie el .*Dispositivo*`),1000);

          setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
            ["✅ Si funciono", "❎ No funciono"]
          ), 1000)
        setWaitingForDocument(true);

        //verificacion de si funciono el chat 
      }else if(option === "✅ Si funciono" && validStatesSinInternet.includes(stateChat)){
        setTimeout(() => addBotMessage(`!Genial¡ si necesitas ayuda escribe seguir para volver iniciar 😊.`), 1000)

        setWaitingForDocument(true);

      }else if(option === "❎ No funciono" && validStatesSinInternet.includes(stateChat)){
        setStateChat("VerificacionDeEstadoDelModem")
        setTimeout(() => addBotMessage(`Vamos a verificar el estado del Modem, lo vas a realizar es mirar los bombillos de este si *LOS* esta encendido podrías indicarnos con la siguiente lista si o no esta encendido. Si no sabe interpretar la luz de los bombillos escoja la opción *No sé *:`,
          ['❎Encendido', '✅ Apagado', '❓ No sé']), 1000)

        setWaitingForDocument(true);

      //verificacion de estado del modem
      }else if(option === "❎Encendido" && stateChat === "VerificacionDeEstadoDelModem"){
        setStateChat("EstaEncendidoElBombillo")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te daremos una serie de soluciones que puedes utilizar para solucionar tu problema.
          \n
            1️⃣ Apaga el *Modem* y después de 30 segundos vuélvelo a encender.
            \n
            2️⃣ Revisa que los cables que estén bien conectados.
            \n
            3️⃣Revisa si hay un corte del servicio en la zona.`), 1000)

            setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
            ["✅ Si funciono", "❎ No funciono"]
          ),1000);

        setWaitingForDocument(true);

      }else if(option === "✅ Apagado" && stateChat === "VerificacionDeEstadoDelModem"){
        setStateChat("EstaApagadoElBombillo")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te presentaremos una serie de soluciones para ayudarte con tu problema:
          \n
          1️⃣Revisa el cable de fibra óptica si esta bien conectado y sin daños.
          \n
          2️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.
          \n
          3️⃣Revisa si hay cortes en la zona`
        ), 1000)

        setTimeout(() => addBotMessage(`Si te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000)

        setWaitingForDocument(true);
        //Si el usuario no sabe como mirar si el bombillo esta apagado o encendido
      }else if(option === "❓ No sé" && stateChat === "VerificacionDeEstadoDelModem"){

        setStateChat("NoSabeElUsuario")
        setTimeout(() => addBotMessage(`Para poder interpretar estos bombillos vamos a tener en cuenta lo siguiente:
          \n
          🔴 Por lo general *LOS* cuando se enciende es de color rojo.
          \n
          🟢Por lo general *PON* siempre va a alumbrar de color verde.
          \n
          Entonces nos podrías confirmar si *LOS* esta encendido:`,
          ["❎Encendido", "✅ Apagado"]
        ), 1000)

        setWaitingForDocument(true);
        //Encendido el bombillo 
      }else if(option === "❎Encendido" && stateChat === "NoSabeElUsuario"){

        setStateChat("BombilloLosEncendido")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te daremos una serie de soluciones que puedes utilizar para solucionar tu problema.
          \n
          1️⃣ Apaga el *Modem* y después de 30 segundos vuélvelo a encender.
          \n
          2️⃣ Revisa que los cables que estén bien conectados.
          \n
          3️⃣Revisa si hay un corte del servicio en la zona.`
        ), 1000)
        setWaitingForDocument(true);

      }else if(option === "✅ Apagado" && stateChat === "NoSabeElUsuario"){

        setStateChat("CableDañadoOSeguir")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te presentaremos una serie de soluciones para poder solucionar tu problema:
          \n
          1️⃣ Apaga el *Modem*  espera 30 segundos y vuelve a encenderlo.
          \n      
          2️⃣Fíjate que el cable de fibra no este doblad, sucio o desconectado.
          \n      
          3️⃣Si *LOS* sigue apagado puede haber un daño en la zona.
          \n    
          si el cable de fibra esta dañado por favor escoja la opción *Cabe dañado*, de lo contrario escoja la opción *Seguir*.`,
          ["🔌 Cable Dañado", "➡️ Seguir"]
        ), 1000)

        setWaitingForDocument(true);

        //Si funciono la ultima solucion. 
      }else if(option === "➡️ Seguir" && stateChat === "CableDañadoOSeguir"){

        setStateChat("BombilloLosApagadoSeguir")
        setTimeout(() => addBotMessage(`Si te funciono, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "✅ Si funciono" && validStatesSinInternetBombilloLos.includes(stateChat)){

        setStateChat("BombilloLosApagado")
        setTimeout(() => addBotMessage(`!Genial¡ si necesitas ayuda escribe seguir para volver iniciar 😊.`
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "✅ No funciono" && validStatesSinInternetBombilloLos.includes(stateChat)){

        setStateChat("BombilloLosApagado")
        setTimeout(() => addBotMessage(`Ya te pasamos con un asesor😊.`
        ), 1000)

        setWaitingForDocument(true);

      }else if(option === "🔌 Cable Dañado" && stateChat === "CableDañadoOSeguir"){

        setStateChat("BombilloLosApagado")
        setTimeout(() => addBotMessage(`Ya te pasamos con un asesor😊.`), 1000)

        setWaitingForDocument(true);

        //Otras opciones
      }else if (option === "Cambiar Contraseña") {
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

        setWaitingForDocument(true);
      } else if (option === "Cancelar Servicio") {
        setTimeout(() => addBotMessage(`Señor/a, para realizar esta acción puedes acercarte a la oficina más cercana con la fotocopia de la cedula y la carta con el motivo de porque va a cancelación el servicio.`), 1000);

        setWaitingForDocument(true);
      } else if(option === "Cambio de plan"){
        setTimeout(() => addBotMessage(`Para poder solicitar un cambio de plan, te vamos a solicitar unos datos, los cuales vas a enviar en un solo mensaje separado por *Comas*, *Tipo lista sin números ni caracteres especiales*, o tambien *De corrido pero con espacios*.\n 
          \n
          Los datos son: 
          \n
          1️⃣ Nombre completo del titular del servicio.
          \n
          2️⃣ Número de documento del titular.
          \n
          3️⃣ El servicio que desea cancelar *(Internet, TV, etc.)*.
          \n
          6️⃣Motivo de la cancelación del servicio.`), 1000);

        setWaitingForDocument(true);
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
            ['https://clientes.portalinternet.net/saldo/super-tv/']
        ), 1000);
    }else if(option === 'Cambio de titular'){
        setTimeout(() => addBotMessage(`Señor/a, para realizar esta acción  te vamos a solicitar unos datos los cuales vas a llevar al punto más cercano para poder ayudarte con esta solicitud. Los datos son los siguientes: 
          \n1️⃣Copia de documento del *Titular anterior*
          \n2️⃣Copia del documento de la persona a la que se le va a realizar el servicio.`), 1000)

          setWaitingForDocument(true);
          //Otro problema 
      }else if(option === 'Otro'){
        setTimeout(() => addBotMessage(`Para poder ayudarte con tu problema te vamos a pedir unos datos para poder ayudarte. Los datos los vas a enviar en un solo mensaje donde los vas a enviar *Tipo lista sin caracteres especiales*, Separados por *Comas* o tambien de corrido con *Espacios*.
          \nAl momento colocar los datos, al llegar al punto 3 donde pregunta si es titular. Por favor colocar *Si* o *No*.
          \n1️⃣ Nombre completo.
          \n2️⃣ Numero de documento.
          \n3️⃣¿Es titular de algún servicio?
          \n4️⃣ Descripción del problema o duda que desea consultar.`),1000)

        setWaitingForDocument(true);
            //Apartado de no tengo internet
      }else if(option === "🐢 Internet lento." && stateChat === "Falla conexión"){
        setStateChat("TestDeVelocidadInternetLento")
        setTimeout(() => addBotMessage(`Para solucionar este problema lo que harás es realizar un test de velocidad, ya sea para el internet por cable o, para el *WIFI*.`,
          ["https://www.speedtest.net/es"]
        ),1000);
        setTimeout(()=> addBotMessage('Ya realizaste el test de velocidad? si ya lo hiciste podrías indicarme por medio de las opciones cual es la que define tu resultado:',
          ["✅ Buena velocidad", "⚠️ Lento o inestable", "❓No sé analizar test"]
        ), 1000);

        setWaitingForDocument(true);

      //Buena velocidad
      }else if(option === "✅ Buena velocidad"){
        setStateChat("BuenaVelocidadInternetLento")
        setTimeout(() => addBotMessage(`Tu velocidad esta dentro del rango esperado. El problema puede deberse a una interferencia o saturación de tu dispositivo.
          \n
          Si necesitas ayuda en otra cosa escribe *seguir* para volver al menú principal 😊.`
        ),1000);

        setWaitingForDocument(true);

      //Internet lento o inestable.
      }else if(option === "⚠️ Lento o inestable"){
        setStateChat("InternetLentoOInestable")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones para ayudarte con tu problema:
          \n
            1️⃣ Apaga tu *Modem* durante 5 minutos, después lo vuelves a encender.
            \n
            2️⃣ Evita interferencia (Aleja tu *Modem* de electrodomésticos o paredes gruesas).
            \n
            3️⃣ Prueba con otro dispositivo.
            \n
            4️⃣ Si estas conectado con *WIFI*, conéctate con un cable *Ethernet*.`
        ),1000);

        setWaitingForDocument(true);
        setTimeout(()=> addBotMessage('Si esto te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.',
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);

        setWaitingForDocument(true);
      //No Saber analisar el test
      }else if(option === "❓No sé analizar test"){
        setStateChat("NoseAnalisarTest")
        setTimeout(() => addBotMessage(`Si las *Mbps* son menores al 50% de lo contratado por favor escoja la opción de menos del 50%, si este es mayor del 50% escoja más del 50%`,
          ["Menos del 50%", "Más del 50%"]
        ),1000);

        setWaitingForDocument(true);
      }else if(option === "Menos del 50%" && stateChat === "NoseAnalisarTest"){
        setStateChat("MenosDel50InternetInestable")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones para ayudarte con tu problema:
          \n
          1️⃣ Apaga tu *Modem* durante 5 minutos, después lo vuelves a encender.
          \n
          2️⃣ Evita interferencia (Aleja tu *Modem* de electrodomésticos o paredes gruesas).
          \n
          3️⃣ Prueba con otro dispositivo.
          \n
          4️⃣ Si estas conectado con *WIFI*, conéctate con un cable *Ethernet*.`
        ),1000);

        setTimeout(()=> addBotMessage('Si esto te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.',
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);
        setWaitingForDocument(true);
      }else if(option === "Más del 50%" && stateChat === "NoseAnalisarTest"){
        setStateChat("MasDel50InternetInestable")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones:
          \n
          1️⃣ Revisa si hay muchas personas conectadas ya que esto causa que la red sea inestable.
          \n
          2️⃣ Cierra aplicaciones que estén abiertas o descargas que usen mucho internet. 
          \n
          3️⃣ Apaga el *Modem*, espera 5 minutos y vuelve a encenderlo.`
        ),1000);
        setWaitingForDocument(true);

        setTimeout(()=> addBotMessage('Si esto te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.',
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);
        setWaitingForDocument(true);
      }else if(option === "✅ Si funciono" && validStatesTestVelocidad.includes(stateChat)){
        setStateChat("SiFuncionoTestVelocidad")
        setTimeout(() => addBotMessage(`!Genial¡ si necesitas ayuda escribe seguir para volver iniciar 😊.`),1000);
        setWaitingForDocument(true);
      }else if(option === "❎ No funciono" && validStatesTestVelocidad.includes(stateChat)){
        setStateChat("NofuncionoTestVelocidad")
        setTimeout(() => addBotMessage(`Ya te pasamos con un asesor 😊.`),1000);
        setWaitingForDocument(true);

        //No cargan las paginas
      }else if(option === "🌐 No cargan páginas." && stateChat === "Falla conexión"){
        setStateChat("NoCarganPaginas")
        setTimeout(() => addBotMessage(`¿Qué ocurre exactamente? Escoge las opción *Una pagina*, si solo es una pagina no carga, si son varias escoge *Varias paginas*. 
          \n
          Escoge la opción *Ninguna página* si no puedes entrar a ninguna pagina, si en varios dispositivos no puedes acceder a paginas escoge la opción *Varios dispositivos*.
          \n
          Las opciones son:`,
          ["🔹Una página", "🔹Varias páginas", "🔹Ninguna página ", "🔹Varios dispositivos"]
        ), 1000)

        setWaitingForDocument(true);
        //opciones de paginas o dispositivos
      }else if(option === "🔹Una página" && stateChat === "NoCarganPaginas"){
        setStateChat("UnaPaginaNoCarga")
        setTimeout(() => addBotMessage(`Te vamos a dar unas soluciones para que puedas solucionar tu problema:
          \n
          1️⃣ Intenta abrir la pagina en otro navegador *(Chrome, Firefox, Edge...)*.
          \n
          2️⃣ Borra el historial o cache *(Chrome, Firefox, Edge...)*.
          \n
          3️⃣Intenta abrir la pagina en otra *Red* o *Dispositivo*.`
        ), 1000)

        setTimeout(() => addBotMessage(`Si esta solución te funciono, podrías escoger la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono","❎ No funciono"]
        ), 2000)
        setWaitingForDocument(true);

      }else if(option === "🔹Varias páginas" && stateChat === "NoCarganPaginas"){
        setStateChat("VariasPaginasNoCargan")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación, te vamos  a dar una serie de soluciones:
          \n
          1️⃣ Apaga el *Modem* espera 5 minutos y lo vuelves a encender.
          \n
          2️⃣ Verifica si otros dispositivos tienen el mismo problema.
          \n
          3️⃣ Prueba cambiar los *DNS* por 8.8.8.8 y 8.8.4.4.
          \n
          Si el ultimo punto no sabes como realizarlo, escoge la opción *Ayuda*, de lo contrario escoge la opción *Seguir*`,
          ["🆘 Ayuda", "➡️ Seguir"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹Ninguna página " && stateChat === "NoCarganPaginas"){
        setStateChat("NingunaPaginaNoCargan")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación, te vamos a dar una serie de soluciones las cuales utilizaras para que puedas navegar tranquilamente:
          \n
          1️⃣ Revisa si otros dispositivos tienen internet.
          \n
          2️⃣Prueba apagar el *Modem* y después de 5 minutos volverlo a encender.
          \n
          3️⃣Haz ping a *8.8.8.8* para comprobar la conexión del la red.
          \n
          Si el ultimo punto no sabes como realizarlo escoge la opción *Ayuda*, de lo contrario escoge *Seguir*.`,
          ["🆘 Ayuda", "➡️ Seguir"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹Varios dispositivos" && stateChat === "NoCarganPaginas"){
        setStateChat("NoCargaEnVariosDispositivos");
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones para que puedas navegar tranquilamente:
          \n
          1️⃣ Apaga el *Modem* espera 5 minutos y vuélvelo a encender.
          \n
          2️⃣ Intenta conectar un cable *Ethernet* para verificar la conexión.
          \n
          3️⃣Cambia los *DNS* a *8.8.8.8* y 8.8.4.4.
          \n
          Si el ultimo punto no sabes como realizarlo escoge la opción *Ayuda*, de lo contrario escoge *Seguir*.`,
          ["🆘 Ayuda", "➡️ Seguir"]
        ), 1000)

        setWaitingForDocument(true);

        //Ayuda o seguir varias paginas
      }else if(option === "🆘 Ayuda" && stateChat === "VariasPaginasNoCargan"){
        setStateChat("AyudaVariasPaginas")
        setTimeout(() => addBotMessage(`Para poder ayudarte con esto, nos podrías indicar que tipo de dispositivo estas utilizando.`,
          ["🔹 Windows", "🔹Mac", "🔹 Android", "🔹iPhone"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "➡️ Seguir" && stateChat === "VariasPaginasNoCargan"){
        setStateChat("SeguirVariasPaginas")
        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
        //Ninguna de las paginas carga
      }else if(option === "🆘 Ayuda" && stateChat === "NingunaPaginaNoCargan"){
        setStateChat("AyudaNingunaPagina")
        setTimeout(() => addBotMessage(`Para poder ayudarte con esto, nos podrías indicar que tipo de dispositivo estas utilizando.`,
          ["🔹 Windows", "🔹Mac"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "➡️ Seguir" && stateChat === "NingunaPaginaNoCargan"){
        setStateChat("SeguirNingunaPagina")
        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);
        setWaitingForDocument(true);


        //En varios dispositivos no carga la pagina
      }else if(option === "🆘 Ayuda" && stateChat === "NoCargaEnVariosDispositivos"){
        setStateChat("AyudaVariosDispositivos")
        setTimeout(() => addBotMessage(`Para poder ayudarte con esto, nos podrías indicar que tipo de dispositivo estas utilizando.`,
          ["🔹 Windows", "🔹Mac", "🔹 Android", "🔹iPhone"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "➡️ Seguir" && stateChat === "NoCargaEnVariosDispositivos"){
        setStateChat("SeguirVariosDispositivos")
        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
        //Opiones de funciono de una pagina
      }else if(option === "✅ SI" && stateChat === "SiFuncionaUnaPagina"){
        setStateChat("SeguirVariosDispositivos")
        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);

        //Dispositivos para ayudar en varias paginas
      }else if(option === "🔹 Windows" && stateChat === "AyudaVariasPaginas"){
        setStateChat("WindowsVariasPaginas")
        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso de como cambiar los *DNS*:
          \n
            1️⃣ Abre el menú de inicio y escribe *Panel de control*.
            \n
            2️⃣Ve a "*Redes y internet*" y luego en "*Centro de redes y recursos compartidos*".
            \n
            3️⃣ Haz clic en "*Cambiar configuración del adaptador*".
            \n
            4️⃣ Haz clic derecho en tu *conexión WIFI* o *Ethernet* y selecciona "*Propiedades*".}
            \n
            5️⃣ Selecciona "*Protocolo de internet versión 4(TCP/IPv4)*" y haz clic en 
            "*Propiedades*".
            \n
            6️⃣ Selecciona "*Usar la  siguiente dirección de servidor DNS*" e ingresa:
                 🔹Servidor DNS preferido: 8.8.8.8
                 🔹Servidor DNS alternativo: 8.8.4.4
            \n
            7️⃣ Guarda y vuelve a cargar la pagina`
        ), 1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "🔹Mac" && stateChat === "AyudaVariasPaginas"){
        setStateChat("MacVariasPaginas")
        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso  de como cambiar los *DNS*:
          \n
            1️⃣ Selecciona el menú *Apple*🍏, luego haz clic en *Configuración del sistema*.
            \n
            2️⃣Haz clic en *Red* en la barra lateral.
            \n
            3️⃣Selecciona un servicio de red, puede ser *WIFI* o *Ethernet*.
            \n
            4️⃣Haz clic en *Detalles* y luego en *DNS*
            \n
            5️⃣En la parte inferior de la lista de servidores haz clic en *"+"* para agregar nuevo servidor.
            \n
            6️⃣ Escribe *8.8.8.8* y *8.8.4.4* (*DNS de Google*)
            \n
            7️⃣Guarda los cambios y prueba la conexión.`
        ), 1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000)

        setWaitingForDocument(true);
      }else if(option === "🔹 Android" && stateChat === "AyudaVariasPaginas"){
        setStateChat("AndroidVariasPaginas")
        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso  de como cambiar los *DNS*:
          \n
            1️⃣ Abre *Ajustes* ⚙️ y ve a *Conexiones*.
            \n
            2️⃣ Seleccione "*WIFI*" y haz clic en el icono de engranaje ⚙️ junto a la red.
            \n
            3️⃣ Ve a *Avanzado* y cambia "*Configuración de IP*" a "*Estática*".
            \n
            4️⃣ Edita "*DNS1" y "*DNS2*", ingresa *8.8.8.8* y 8.8.4.4 (*DNS de Google*)
            \n
            5️⃣Guarda los cambios y reconecta la red.`
        ), 1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "🔹iPhone" && stateChat === "AyudaVariasPaginas"){
        setStateChat("iPhoneVariasPaginas")

        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso  de como cambiar los *DNS*:
          \n
          1️⃣ Abre *Ajustes* ⚙️y pulsa *WIFI*.
          \n
          2️⃣Selecciona tu *red* y pulsa el icono "*i*" azul ℹ️.
          \n
          3️⃣Pulsa *Configuración DNS* y elije "*Manual*".
          \n
          4️⃣Pulsa *Añadir servidor*➕ e ingresa 8.8.8.8 y 8.8.4.4 (DNS de Google).
          \n
          5️⃣Pulsa *Guardar* y revisa si te funciono.`
        ),1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
        //Dispositivos ninguna pagina
      }else if(option === "🔹 Windows" && stateChat === "AyudaNingunaPagina"){
        setStateChat("WindowsNingunaPagina")

        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso para hacer el ping a los *8.8.8.8*.
          \n
          1️⃣ Presiona las teclas *Windows + R*
          \n
          2️⃣En la ventana escribe *cmd* y haz clic en *Aceptar*.
          \n
          3️⃣Escribe *ping 8.8.8.8* y después pulsa *Enter* para que se pueda ejecutar.`), 
        1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "🔹Mac" && stateChat === "AyudaNingunaPagina"){
        setStateChat("MacNingunaPagina")

        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso para hacer el ping a los *8.8.8.8*.
          \n
          1️⃣Abre la aplicación *Terminal* en (Aplicaciones => Utilidades)
          \n
          2️⃣Escribe *ping -c 4 8.8.8.8* y pulsa *Enter* para ejecutar.`), 
        1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
        //Dispostivos  varios dispositivos
      }else if(option === "🔹 Windows" && stateChat === "AyudaVariosDispositivos"){
        setStateChat("WindowsVariosDispositivos")

        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso de como cambiar los *DNS*:
          \n
          1️⃣ Abre el menú de inicio y escribe *Panel de control*.
          \n
          2️⃣Ve a "*Redes y internet*" y luego en "*Centro de redes y recursos compartidos*".
          \n
          3️⃣ Haz clic en "*Cambiar configuración del adaptador*".
          \n
          4️⃣ Haz clic derecho en tu *conexión WIFI* o *Ethernet* y selecciona "*Propiedades*".
          \n
          5️⃣ Selecciona "*Protocolo de internet versión 4(TCP/IPv4)*" y haz clic en 
          "*Propiedades*".
          \n
          6️⃣ Selecciona "*Usar la  siguiente dirección de servidor DNS*" e ingresa:
          \n
               🔹Servidor DNS preferido: 8.8.8.8
               \n
               🔹Servidor DNS alternativo: 8.8.4.4
          \n
          7️⃣ Guarda y vuelve a cargar la pagina`), 
        1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "🔹Mac" && stateChat === "AyudaVariosDispositivos"){
        setStateChat("MacVariosDispositivos")

        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso  de como cambiar los *DNS*:
          \n
          1️⃣ Selecciona el menú *Apple*🍏, luego haz clic en *Configuración del sistema*.
          \n
          2️⃣Haz clic en *Red* en la barra lateral.
          \n
          3️⃣Selecciona un servicio de red, puede ser *WIFI* o *Ethernet*.
          \n
          4️⃣Haz clic en *Detalles* y luego en *DNS*
          \n
          5️⃣En la parte inferior de la lista de servidores haz clic en *"+"* para agregar nuevo servidor.
          \n
          6️⃣ Escribe *8.8.8.8* y *8.8.4.4* (*DNS de Google*)
          \n
          7️⃣Guarda los cambios y prueba la conexión.`), 
        1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "🔹 Android" && stateChat === "AyudaVariosDispositivos"){
        setStateChat("AndroidVariosDispositivos")

        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso  de como cambiar los *DNS*:
          \n
          1️⃣ Abre *Ajustes* ⚙️ y ve a *Conexiones*.
          \n
          2️⃣ Seleccione "*WIFI*" y haz clic en el icono de engranaje ⚙️ junto a la red.
          \n
          3️⃣ Ve a *Avanzado* y cambia "*Configuración de IP*" a "*Estática*".
          \n
          4️⃣ Edita "*DNS1" y "*DNS2*", ingresa *8.8.8.8* y 8.8.4.4 (*DNS de Google*)}
          \n
          5️⃣Guarda los cambios y reconecta la red.`),
        1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "🔹iPhone" && stateChat === "AyudaVariosDispositivos"){
        setStateChat("iPhoneVariosDispositivos")

        setTimeout(() => addBotMessage(`A continuación, te vamos a mostrar el paso a paso  de como cambiar los *DNS*:
          \n
          1️⃣ Abre *Ajustes* ⚙️y pulsa *WIFI*.
          \n
          2️⃣Selecciona tu *red* y pulsa el icono "*i*" azul ℹ️.
          \n
          3️⃣Pulsa *Configuración DNS* y elije "*Manual*".
          \n
          4️⃣Pulsa *Añadir servidor*➕ e ingresa 8.8.8.8 y 8.8.4.4 (DNS de Google).
          \n
          5️⃣Pulsa *Guardar* y revisa si te funciono.`), 
        1000)

        setTimeout(() => addBotMessage(`Si te funciono alguna de estas, escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
        //Si funciono la solucion. 
      }else if(option === "✅ Si funciono" && validStatePaginasNoCarga1.includes(stateChat)){
        setStateChat("SiFuncionoSolucion")
        setTimeout(() => addBotMessage(`!Genial¡ si necesitas ayuda escribe seguir para volver iniciar 😊.`), 1000)

        setWaitingForDocument(true);
      }else if(option === "❎ No funciono" && validStatePaginasNoCarga1.includes(stateChat)){
        setStateChat("NoFuncionoSolucionContinua")
        setTimeout(() => addBotMessage(`Vamos a revisar que esta pasando. Primero que todo de casualidad tienes *VPN* activo. Si usted tiene un *VPN* escoja la opción *SI* de lo contrario escoja *NO*. Si no sabe que es un *VPN* escoja la opción *No sé*.`,
          ["✅ SI", "❌ NO", "⏺️ No sé"]
        ), 1000)

        setWaitingForDocument(true);
        //Continuamos con Vpn
      }else if(option === "✅ SI" && stateChat("NoFuncionoSolucionContinua")){
        setStateChat("ConfirmacionVPN")
        setTimeout(() => addBotMessage(`Ya que tiene una *VPN* activa, lo que vas a realizar es ir a configuraciones y desactivar la *VPN*, al momento de hacer eso recargue la pagina.`
        ), 1000)

        setTimeout(() => addBotMessage(`Dado el caso de que no funcione escoja la opción *No funciono*, de lo contrario escoge la opción *Si funciono* para poder ayudarte con este problema. `,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000)

        setWaitingForDocument(true);
      }else if(option === "❌ NO" && stateChat("NoFuncionoSolucionContinua")){
        setStateChat("NoTieneVPN")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones que puedes utilizar para solucionar tu problema:
          \n
          1️⃣ Borra cache o cookies del navegador.
          \n
          2️⃣ Prueba en otro navegador o en modo incognito.
          \n
          3️⃣ Desactiva las extensiones del navegador.`
        ), 1000);

        setTimeout(() => addBotMessage(`Si esto te funciono escoge la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 5000);

        setWaitingForDocument(true);
      }else if(option === "⏺️ No sé" && stateChat("NoFuncionoSolucionContinua")){
        setStateChat("NoSabeVpn");
        setTimeout(() => addBotMessage(`Para saber si tienes una *VPN*, me puedes indicar que tipo de dispositivo estas utilizando, si es computador puedes escoge la opción *Computador*, pero si el dispositivo es un celular escoge la opción *Celular*.`,
          ["🎩 Computador", "📱Celular"]
        ), 1000);

        setWaitingForDocument(true);

        //Dispositivo VPN.
      }else if(option === "🎩 Computador" && validStatePaginasNoCarga1.includes(stateChat)){
        setStateChat("ComputadorVpn");
        setTimeout(() => addBotMessage(`Para verificar si tienes una *VPN* en tu computador, vas a seguir los siguientes pasos:
          \n
          1. Abrir configuraciones.
          \n
          2. Hacer clic en* Red e internet*.
          \n
          3. Hacer clic en *VPN*.
          \n
          4. Verificar si hay alguna *VPN* conectada.
          \n
          Si al momento de consultar la *VPN* hay una activa, por favor desactive y recarga la pagina.`
        ), 1000)

        setTimeout(() => addBotMessage(`Si te sirvió esto puedes escoger la opción *Si funciono*, de lo contrario si no tenias una *VPN* activa o no te funciono, por favor escoge la opción *No funciono*.`, 
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "📱Celular" && validStatePaginasNoCarga1.includes(stateChat)){
        setStateChat("CelularVpn");
        setTimeout(() => addBotMessage(`Para verificar si tu celular tiene un *VPN* activo. Vas a realizar los siguientes pasos: 
          \n
          1. Te vas a dirigir a configuraciones.
          \n
          2. Busca *VPN*, si no te sale a la vista, te vas a dirigir a la barra de búsqueda  y vas a escribir *VPN*.
          \n
          3. Ingresa a esta opción, por lo general esta desactiva, pero dado el caso de que este activa mirar si hay alguna *VPN* activa.
          \n
          Si al momento de consultar la *VPN*, esta activa, por favor desactivarla y recargue la pagina a la que quiere consultar.`
        ), 1000);

        setTimeout(() => addBotMessage(`Si esto funciona, por favor escoja la opción *Si funciona* y si no funciono escoge la opción *No funciona *, para poder ayudarte con este problema.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);

        setWaitingForDocument(true);
        //Si funciono final vpn.
      }else if(option === "✅ Si funciono" && validStatePaginasNoCargaVpn.includes(stateChat)){
        setStateChat("SeguirVariosDispositivos");
        setTimeout(() => addBotMessage(`!Genial¡ si necesitas ayuda escribe seguir para volver iniciar 😊.`), 1000)

        setWaitingForDocument(true);

      }else if(option === "❎ No funciono" && validStatePaginasNoCargaVpn.includes(stateChat)){
        setStateChat("SeguirVariosDispositivos")
        setTimeout(() => addBotMessage(`!Para poder ayudarte por favor escribe el nombre de la pagina la cual no carga para poder ayudarte`), 1000)

        setWaitingForDocument(true);

        //Señal de television.
      }else if(option === "📺 Señal de Televisión." && stateChat === "Falla conexión"){
        setStateChat("SeñalDeTelevision");
        setTimeout(() => addBotMessage(`¿Tu televiso muestra *Sin señal* o solo se ve distorsionado?`,
          ["📶Sin señal", "📺Distorsionada", "➡️ Otro problema."]
        ), 1000);

        setWaitingForDocument(true);
        //opciones de la señal de television
      }else if(option === "📶Sin señal" && stateChat === "SeñalDeTelevision"){
        setStateChat("SinSeñalTv");
        setTimeout(() => addBotMessage(`Nos podrías indicar a cuantos canales les pasa este problema.`,
          ["📺 En ningún canal", "📺 En varios canales"]
        ), 1000);
        setWaitingForDocument(true);
      }else if(option === "📺Distorsionada"){
        setStateChat("DistorcionadaSeñalTv");
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te presentaremos una serie de revisiones que puedes hacer para detectar el problema.
          \n
          1️⃣Revisa que el cable que esta conectado a el televisor este bien conectado y sin daños visibles.
          \n
          2️⃣Si utilizar un divisor de señal, conecta el cable directo al televisor.
          \n
          3️⃣Intenta utilizar esto con otro televisor.`
        ), 1000);

        setTimeout(() => addBotMessage(`Si el problema persiste escoge la opción *No funciono*, de lo contrario escoja la opción *Si funciono*.`,
          ["✅Si funciono", "❎ No funciono"]
        ),1000);

        setWaitingForDocument(true);
        //problema y mensaje especifico
      }else if(option === "➡️ Otro problema."){
        setStateChat("OtroProblemaSeñalTelevision");
        setTimeout(() => addBotMessage(`Ya te pasamos con un asesor 😊`), 1000)

        setWaitingForDocument(true);
        //problema y mensaje especifico
      }else if(option === "📺 En ningún canal"){
        setStateChat("EnNingunCanalSinSeñal");
        setTimeout(() => addBotMessage(`Revisa si el cable que va conectado a al televisor esta bien conectado.`,
          ["🔌Conectado", "🔌Desconectado"]
        ), 1000);
        setWaitingForDocument(true);
      }else if(option === "📺 En varios canales"){
        setStateChat("EnVariosCanalesSinSeñal");
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a presentar una serie de soluciones para solucionar tu problema:
          \n
          1️⃣Prueba hacer una búsqueda automática de canales en la configuración de tu televisor.
          \n
          2️⃣Si utilizas decodificador, revisa que la lista de canales este actualizada.
          \n
          3️⃣Si sigues con el problema, puede ser que los canales estén fuera de servicio temporalmente.`),
        1000);

        setTimeout(() => addBotMessage(`Si el problema persiste escoge la opción *No funciono*, de lo contrario escoja la opción *Si funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === "🔌Conectado"){
        setStateChat("CableConectadoSinSeñal");
        setTimeout(() => addBotMessage(`Intenta apagar el *Modem* y después de 3 minutos vuelve a encenderlo.`), 1000)

        setTimeout(() => addBotMessage(`Si el problema persiste después de haber hecho lo anterior por favor escoge la opción *No funciono*, de lo contrario escoge la opción *Si funciono*`,
          ["✅Si funciono", "❎ No funciono"]
        ), 1000);
        setWaitingForDocument(true);

      }else if(option === "🔌Desconectado"){
        setStateChat("CableDesconectadoSinSeñal");
        setTimeout(() => addBotMessage(`Vuelve a conectarlo firmemente y prueba de nuevo.`), 1000)

        setTimeout(() => addBotMessage(`Si el problema persiste después de haber hecho lo anterior por favor escoge la opción *No funciono*, de lo contrario escoge la opción *Si funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);
        setWaitingForDocument(true);

        //Si funciono de señal de television
      }else if(option === "✅Si funciono"){
        console.log("Estado actual:", stateChat);
        if (validStateSinSeñal1.includes(stateChat)) {
          setStateChat("SiFuncionaCable");
          setTimeout(() => addBotMessage(`¡Genial! Si necesitas ayuda, escribe *seguir* para volver a iniciar 😊.`), 1000);
          setWaitingForDocument(true);
        }

      }else if(option === "❎ No funciono" && validStateSinSeñal1.includes(stateChat)){
        setStateChat("NoFuncionoSeñalTelevision");
        setTimeout(() => addBotMessage(`Puedes revisar si el bombillo de *CATV*  esta encendido, si este bombillo esta encendido escoja la opción *Encendido* y si esta apagado o alumbra rojo escoja *Apagado*.`,
          ["✅Encendido", "❎ Apagado"]
        ), 1000);
        setWaitingForDocument(true);

      }else if(option === "✅Encendido" && stateChat === "NoFuncionoSeñalTelevision"){
        setStateChat("EncendidoCatv");
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones para que puedas revisar y solucionar tu problema:
          \n
          1️⃣Verifica que el cable este conectado en la entrada correcta.
          \n
          2️⃣Verifica que el cable este bien conectado y sin daños.
          \n
          3️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.
          \n
          4️⃣Prueba con otro televisor o otra toma.
          \n
          5️⃣Revisa si el problema es general y a tus vecinos les sucede el mismo problema.`), 
        1000);

        setTimeout(() => addBotMessage(`Si el problema persiste después de haber hecho lo anterior por favor escoge la opción *No funciono*, de lo contrario escoge la opción *Si funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === "❎ Apagado" && stateChat === "NoFuncionoSeñalTelevision"){
        setStateChat("ApagadoCatv");
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones para que puedas revisar si te funcionan:
          \n
          1️⃣ Verifica que el cable este bien conectado en ambos extremos (ONT y televisor/decodificador).
          \n
          2️⃣Apaga la *ONT* y *Decodificador* si tienes uno y espera 30 segundos y vuélvelo a encender.
          \n
          3️⃣Prueba con otro cable si tienes uno al alcance.
          \n
          4️⃣ Conéctalo a otro televisor o dispositivo por el cual puedas conectarlo.`), 
        1000);

        setTimeout(() => addBotMessage(`Si el problema persiste después de haber hecho lo anterior por favor escoge la opción *No funciono*, de lo contrario escoge la opción *Si funciono*`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);

        setWaitingForDocument(true);

        //Si funciono final
      }else if(option === "✅ Si funciono" && validStateSinSeñalFinal.includes(stateChat)){
        setTimeout(() => addBotMessage(`!Genial¡ si necesitas ayuda escribe seguir para volver iniciar 😊.`), 1000)
        setWaitingForDocument(true);
      }else if(option === "❎ No funciono" && validStateSinSeñalFinal.includes(stateChat)){
        setTimeout(() => addBotMessage(`Ya te pasamos con un asesor 😊. `), 1000)

        setWaitingForDocument(true);

        //Internet inestable
      }else if(option === "⚡ Internet inestable." && stateChat === "Falla conexión"){
        setStateChat("InternetInestable");
        setTimeout(() => addBotMessage(`Podrías escoger la opción por la cual estas conectado.`,
          ["🔹Cable de red *LAN*", "🔹*WIFI* (2.4G/5G)", "🔹 No sé"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹Cable de red *LAN*" && stateChat === "InternetInestable"){
        setStateChat("CableLanRedInestable")
        setTimeout(() => addBotMessage(`Por favor verifica si estos están conectados al* Modem*, esto lo puedes ver en el modem si los bombillos de *Lan1* y *Lan2* están encendidos, escoja la opción *Encendidos*. Si no escoge *Apagados*.`,
          ["🔹Encendidos", "🔹Apagado"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹*WIFI* (2.4G/5G)" && stateChat === "InternetInestable" ){
        setStateChat("wIFIInestable")
        setTimeout(() => addBotMessage(`Para poder ayudarte con tu problema, podrías escoger la opción que necesites: `,
          ["🔹La señal débil", "🔹La red no aparece.", "🔹 Se desconecta"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹 No sé" && stateChat === "InternetInestable"){
        setStateChat("NoSabeDispositivoRedInestable");
        setTimeout(() => addBotMessage(`Para poder ayudarte os podrías escoge la opción del dispositivo que estas utilizando.`,
          ["🔹Celular/Tablet", "🔹PC/Laptop"]
        ), 1000);
        setWaitingForDocument(true);

        //opciones de las opciones de la reed inestable
      }else if(option === "🔹Encendidos" && stateChat === "CableLanRedInestable"){
        setStateChat("EncendidoCanleLan");
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te presentaremos una serie de solucionas para que puedas solucionar tu problema:
          \n
          1️⃣Prueba con otro cable para verificar la conexión de este.
          \n
          2️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.`
        ), 1000)

        setTimeout(() => addBotMessage(`Nos podrías confirmar si esto te funciono seleccionando la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]  
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹Apagado" && stateChat === "CableLanRedInestable"){
        setStateChat("ApagadoCanleLan");
        setTimeout(() => addBotMessage(`¡Vamos a solucionar tu problema! 
          \n
          A continuación te presentamos una serie de soluciones para solucionar tu problema:
          \n
          1️⃣Verifica que el cable este bien conectado a los dispositivos.
          \n
          2️⃣Si es posible utiliza otro cable.
          \n
          3️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.`
        ), 1000);
        setTimeout(() => addBotMessage(`Nos podrías confirmar si esto te funciono seleccionando la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹La señal débil" && stateChat === "wIFIInestable"){
        setStateChat("LaSeñalDebilWifiInestable")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a presentar una serie de soluciones para que revises y puedas solucionar tu problema:
          \n
          1️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.
          \n
          2️⃣ Utiliza la red *2.4g* ya que esta tiene más alcance que la *5g*.`
        ), 1000);

        setTimeout(() => addBotMessage(`Podrías confirmarnos con las siguientes opciones si funciono con la opción *Si funciono*, si esto no funciono escoge la opción *No funciono*. `,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹La red no aparece." && stateChat === "wIFIInestable"){
        setStateChat("LaRedNoAparece")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a presentar una serie de soluciones:
          \n
          1️⃣ Verifica en otro dispositivo si aparecen la red que quieres utilizar.
          \n
          2️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.
          \n
          3️⃣Asegúrate en el *Modem* que las dos redes estén encendidas.`
        ), 1000);

        setTimeout(() => addBotMessage(`Para confirmarnos que estén activas puedes escoger la opción correcta. Escoge *Encendido*, si los bombillos de estas redes están encendidos. Si los bombillos están apagados escoge la opción* Apagado*.`,
          ["🔹Encendido", "🔹Apagado"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹 Se desconecta" && stateChat === "wIFIInestable"){
        setStateChat("SeDesconectaWifiInestable")
        setTimeout(() => addBotMessage(`Vamos a solucionar tu problema. A continuación te vamos a dar una serie de soluciones para que puedas verificar si esto te funciona:
          \n
          1️⃣Acércate al *Modem* ya que la *5g* tiene menos alcance que la *2.4g*.
          \n
          2️⃣ Olvida la red y vuelve a conectarte.
          \n
          3️⃣Verifica que ocurra en varios dispositivos.
          \n
          4️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.
          \n
          5️⃣Aleja el *Modem* de los electrodomésticos o paredes gruesas.`
        ), 1000);

        setTimeout(() => addBotMessage(`Podrías confirmarnos con las siguientes opciones si funciono con la opción *Si funciono*, si esto no funciono escoge la opción *No funciono*. `,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹Celular/Tablet" && stateChat === "NoSabeDispositivoRedInestable"){
        setStateChat("CelularOTabletNoseDispositivo");
        setTimeout(() => addBotMessage(`Para verificar que red *WIFI* tienes, ve a configuraciones, has clic en *WIFI*, mira la red a la que estas conectado. Si estas conectado a la 5G intenta conectarte a la 2.4G ya que la 5G es mas rápida pero tiene menos alcance.`), 1000)

        setTimeout(() => addBotMessage(`Podrías confirmarnos con las siguientes opciones si funciono con la opción *Si funciono*, si esto no funciono escoge la opción *No funciono*. `,
          ["✅ Si funciono", "❎ No funciono"]
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "🔹PC/Laptop" && stateChat === "NoSabeDispositivoRedInestable"){
        setStateChat("PcNoSabeDispositivo");
        setTimeout(() => addBotMessage(`Si su *PC/Laptop* no tiene un cable de internet conectado lo más probable es que este conectado a *WIFI*.
          \n
          Nos podías confirmar si es por cable o por *WIFI*`,
          ["🔹WIFI", "🔹 Cable"]
        ), 1000);

        setWaitingForDocument(true);

        //la red no aparece
      }else if(option === "🔹Encendido" && stateChat === "LaRedNoAparece"){
        setStateChat("EncendidoLaRedNoAparece");
        setTimeout(() => addBotMessage(`Te vamos a dar una serie de soluciones para que puedas verificar y solucionar tu problema:
          \n
          1️⃣ Verifica que la red no este oculta.
          \n
          2️⃣ Olvida la red y vuelve a conectarlo.
          \n
          3️⃣ Prueba con otro dispositivo.
          \n
          4️⃣ Si estas lejos del *Modem* conéctate a la red *2.4g* ya que esta tiene mas alcance.
          \n
          5️⃣Apaga el *Modem* y después de 30 segundo vuelve a encenderlo.`
        ), 1000);
        setTimeout(() => addBotMessage(`Si te funciono las soluciones elige la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);
        setWaitingForDocument(true);

      }else if(option === "🔹Apagado" && stateChat === "NoSabeDispositivoRedInestable"){
        setStateChat("ApagadoLaRedNoAparece")
        setTimeout(() => addBotMessage(`Te vamos a dar una serie de soluciones para que puedas verificar y solucionar tu problema:
          \n
          1️⃣Apaga el *Modem* y después de 30 segundos vuelve a encenderlo.
          \n
          2️⃣Prueba mirar en otro dispositivo.
          \n
          3️⃣Si es posible conecta un cable *Ethernet* para verificar la conexión a internet.`
        ), 1000);

        setTimeout(() => addBotMessage(`Si te funciono las soluciones elige la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);

        setWaitingForDocument(true);

        //tipo de conexion laptop
      }else if(option === "🔹WIFI" && stateChat === "PcNoSabeDispositivo"){
        setStateChat("PcWIfiNoSabe");
        setTimeout(() => addBotMessage(`Como esta conectado con *WIFI*, por favor revise que tipo de red esta conectado, si la red tiene 5G, cambie la red a la 2.4G ya que la 5G es más rápido, pero tiene menor alcance.`
        ), 1000);

        setTimeout(() => addBotMessage(`Si te funciono las soluciones elige la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);

        setWaitingForDocument(true);
      }else if(option === "🔹 Cable" && stateChat === "PcNoSabeDispositivo"){
        setStateChat("cablePcNoSabe");
        setTimeout(() => addBotMessage(`Como estas conectado con cable, lo que tienes que hacer es conectarlo en otro puerto de *LAN*. Si esto no funciona intenta utilizar otro cable.`
        ), 1000);

        setTimeout(() => addBotMessage(`Si te funciono las soluciones elige la opción *Si funciono*, de lo contrario escoge la opción *No funciono*.`,
          ["✅ Si funciono", "❎ No funciono"]
        ),1000);

        setWaitingForDocument(true);
      }else if(option === "✅ Si funciono" && validStateRedInestableFinal.includes(stateChat)){
        setStateChat("cablePcNoSabe")
        setTimeout(() => addBotMessage(`!Genial¡ si necesitas ayuda escribe seguir para volver iniciar 😊.`
        ), 1000);

        setWaitingForDocument(true);
      }else if(option === "❎ No funciono" && validStateRedInestableFinal.includes(stateChat)){
        setStateChat("cablePcNoSabe");
        setTimeout(() => addBotMessage(`Ya te pasamos con un asesor 😊`), 1000)

        setWaitingForDocument(true);

        //Otro problema
      }else if(option === "🔘Otro problema" && stateChat === "Falla conexión"){
        setTimeout(() => addBotMessage(`Para poder ayudarte con tu problema, te vamos a solicitar unos datos junto con la descripción del problema para poder ayudarte. Para el envió de estos datos lo que vas a hacer es enviar un mensaje donde estén los datos, estos los puedes enviar en *forma de lista* sin caracteres especiales, *Separado por comas* y tambien puede ser de corrido pero con espacios. 
          \n
          Los datos son:
          \n
          1️⃣Nombre del titular del servicio.
          \n
          2️⃣Número de documento del titular del servicio.
          \n
          3️⃣Descripción del problema.`),
        1000);
        setWaitingForDocument(true);
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
                <div className='content-messages'>
                   {message.map((message, index) => (
                     <div key={index} className={`message ${message.sender}`}>
                       {message.text.split("\n").map((line, i) => (
                         <p key={i}>{line}</p>
                       ))}
                       {message.buttons && (
                         <div className="buttons-container">
                           {message.buttons.map((buttonText, btnIndex) =>{
                            if(buttonText.includes('https://clientes.portalinternet.net/saldo/super-tv/')){
                              return(
                                <a
                                  key={btnIndex}
                                  href={buttonText}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <button className="service-button">
                                    🔗 Metodo de Pago
                                  </button>
                                </a>
                              )
                            }else if(buttonText.includes('https://www.speedtest.net/es')){
                              return(
                                  <a
                                    key={btnIndex} 
                                    href={buttonText}
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                  >
                                    <button className="service-button">
                                      🔗 Test de velocidad
                                    </button>
                                  </a>
                              )
                          }else{
                              return(
                                <button
                                  key={btnIndex}
                                  onClick={() => handleButtonClick(buttonText)}
                                  className="service-button"
                                >
                                  {buttonText}
                                </button>
                              )
                            }
                           } )}
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