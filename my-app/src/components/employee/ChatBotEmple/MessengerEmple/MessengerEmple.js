import { useContext, useEffect, useRef, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderEmploye from "../../../navbar/SliderEmploye";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';
import Usuario from '../../../../assets/img/usuario.png';
import { VscSend } from "react-icons/vsc";
import MessageChat from "../../../MessageChat";
import '../WhatsappEmple/whatsappEmple.css';
import { CiImageOn } from "react-icons/ci";
import { AiFillAudio } from "react-icons/ai";

function MessengerEmple (){
    const {theme, toggleTheme} = useContext(ThemeContext);
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [ isLoggedIn, setIsLoggedIn] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [currentMessage, setCurrentMessage] = useState('');
    const [ selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    const [nombreEmpleado, setNombreEmpleado]= useState("");
    const handleKeyPress = (e) =>{
        if(e.key === 'Enter'){
            handleSendMessage();
        }
    }
    const handleSendMessage = async () => {
        if (currentMessage.trim() !== "" && activeContact) {
            const newMessage = {
                messages: [
                    {
                        sender: 'Empleado',
                        message: currentMessage,
                        idMessageClient: `msg_${Date.now()}-${currentMessage.length}`
                    }
                ]
            };
            const rawMessage = {
                suscriberID: activeContact.id,
                message: currentMessage,
                chat: 'messenger',
            };
        
            try {
                const response = await fetch(`http://localhost:3001/post-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rawMessage),
                });
                if (!response.ok) throw new Error('Error al guardar el mensaje en post-message');
            
                const messageResponse = await fetch(`http://localhost:3001/message/${activeContact.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newMessage),
                });
                if (!messageResponse.ok) throw new Error('Error al guardar el mensaje en message');
                setMessages(prevMessages => [...prevMessages, newMessage]);
            } catch (error) {
                console.error('Error al guardar el mensaje: ', error);
            }
            setCurrentMessage("");
        }
    };

    // Manejo del envío de archivos
    const handleFileChage = (e) => {
        if(e.target.files[0]){
            setSelectedImage(e.target.files[0]);
        }
    };

    const imageUploadNube = async () => {
      if (!selectedImage || !activeContact) return;
      try {
        const formData = new FormData();
        formData.append('file', selectedImage);
    
        const response = await fetch('http://localhost:3001/image-post-message', {
          method: 'POST',
          body: formData
        });
    
        if (!response.ok) throw new Error('Error al subir la imagen a la nube');
    
        const data = await response.json();
        const image = data?.data?.secure_url || '';
    
        if (!image) throw new Error('No se encontró la URL de la imagen');
    
        // Armar mensaje para Mongo
        const newMessage = {
          messages: [
            {
              sender: 'Empleado',
              message: image,
              contexto: currentMessage, 
              idMessageClient: `msg_imageWithText_${Date.now()}`
            }
          ]
        };
        // Guardar en Mongo
        const saveResponse = await fetch(`http://localhost:3001/message/${activeContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage)
        });
    
        if (!saveResponse.ok) throw new Error('Error al guardar el mensaje');
    
        const responseManychat = await fetch('http://localhost:3001/post-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suscriberID: activeContact.id,
            message: image,
            contexto: currentMessage,
            chat: 'messenger'
          })
        });
    
        if (!responseManychat.ok) throw new Error('Error al enviar a ManyChat');
    
        setMessages(prev => [...prev, newMessage]);
        setSelectedImage(null);
        setCurrentMessage("");
    
      } catch (error) {
        console.error('Error al subir la imagen a la nube: ', error);
      }
    };


    useEffect(()=>{
        const userId = localStorage.getItem('UserId');
        const rolUser = localStorage.getItem('rol-user');
        if(userId && rolUser){
            setIsLoggedIn(true);
        }else{
            setIsLoggedIn(false);
        }
    },[]);

    //mensajes de MongoDB
    const fetchMessenger = async (activeContact) => {
        try {
            const response = await fetch(`http://localhost:3001/message/?contactId=${activeContact.id}&chat=messenger`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Error al obtener los mensajes del contacto');
            }
            const result = await response.json();
            console.log('Respuesta obtenida de la API de mensajes:', result);
            const data = result?.data?.docs || [];
            if (!Array.isArray(data) || data.length === 0) {
                setMessages([]);
                return;
            }
            const flattenedMessages = data.flatMap(doc => {
                if (!Array.isArray(doc.messages)) return [];
            
                return doc.messages.map(msg => ({
                    ...msg,
                    contactId: doc.contactId,
                    chat: doc.chat,
                    usuario: doc.usuario,
                    updatedAt: msg.timeStamp || doc.updatedAt,
                }));
            });
            const mensajesOrdenados = flattenedMessages.sort((a, b) =>
                new Date(a.updatedAt) - new Date(b.updatedAt)
            );
            setMessages(mensajesOrdenados);
            const lastMessage = mensajesOrdenados[mensajesOrdenados.length - 1];
            const lastSender = lastMessage?.sender === 'Cliente'? "Cliente" : "Empleado"
            setUnreadMessages(prev => ({
                ...prev,
                [activeContact.id]: activeContact.id !== activeContact.id 
            }));
            setContacts(prevContacts => 
                prevContacts.map(contact =>
                    contact.id === activeContact.id
                    ? { ...contact, lastMessage,  lastSender   }
                    : contact
                )
            );
        } catch (error) {
            console.error('Error al consultar los datos de la API:', error);
        }
    };

    const groupMessagesByDate = (messages) => {
        return messages.reduce((acc, message) => {
            const dateKey = new Date(message.updatedAt).toLocaleDateString('es-ES');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(message);
            return acc; 
        }, {});
    };
 
    const fetchManychat = async (chatId) => {
        try {
            const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json'
                }
            });
            if (!responseMany.ok) {
                throw new Error('Error al momento de consultar los datos de Manychat:');
            }
            const resultMany = await responseMany.json();
            const dataMany = resultMany.cliente.data;
            const newContact = {
                id: dataMany.id,
                nombre: dataMany.name,
                perfil: dataMany.profile_pic,
                estado: dataMany.status,
            }
            console.log('id es: ', newContact);
            setContacts(prevContacts => {
                const exists = prevContacts.find(contact => contact.id === newContact.id);
                
                if(!exists){
                    return[...prevContacts, newContact];
                }
                return prevContacts;
            });
        } catch (error) {
            console.error('Error al momento de consultar los datos de la API:', error);
        }
    };

    useEffect(() => {
        const fetchEmple = async () => {
            try {
                const EmpleId = localStorage.getItem('UserId');
                const responseEmple = await fetch(`http://localhost:3001/asignaciones/`);
                if (!responseEmple.ok) {
                    throw new Error('Error al consultar asignaciones');
                }

                const resultEmple = await responseEmple.json();
                const dataEmple = resultEmple.data.docs;
                console.log('Asignaciones:', dataEmple);

                const assignedEmple = dataEmple.filter((emple) => emple.idEmple === EmpleId);

                if (assignedEmple.length > 0) {
                    // ✅ Guardamos los contactos para mostrarlos en la lista
                    const contactos = assignedEmple.map(user => ({
                        id: user.cahtId,
                        nombre: user.nombreClient,
                        lastMessage: {
                            message: user.Descripcion
                        },
                        lastSender: 'Cliente',
                        perfil: user.perfil || null
                    }));

                    setContacts(contactos);

                    // Si el contacto está asignado a ChatBotMessenger, lo manejamos aparte
                    for (let user of assignedEmple) {
                        const chatId = user.cahtId;
                        if (user.chatName === 'ChatBotMessenger') {
                            await fetchManychat(chatId);

                            const response = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=messenger`);
                            if (!response.ok) throw new Error('Error al obtener mensajes');

                            const result = await response.json();
                            const data = result.data.docs;

                            const exists = data.some(msg => msg.contactId === chatId && msg.message === user.Descripcion);

                            if (!exists) {
                                const newMessage = {    
                                    contactId: chatId,
                                    usuario: {
                                        nombre: user.nombreClient,
                                    },
                                    messages: [{
                                        sender: 'Cliente',
                                        message: user.Descripcion,
                                        idMessageClient: `msg_MessageProblem-${user.Descripcion.length}`,
                                    }],
                                    chat: 'messenger',
                                };

                                const messageResponse = await fetch('http://localhost:3001/message/', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(newMessage),
                                });

                                if (!messageResponse.ok) throw new Error('Error al guardar el mensaje');
                                console.log('Mensaje guardado correctamente.');
                            } else {
                                console.log('Mensaje ya existe.');
                            }
                        }
                    }
                } else {
                    console.log('No hay empleados asignados');
                    setContacts([]); // por si se reinicia
                }

            } catch (error) {
                console.error('Error al momento de consultar los datos de la API:', error);
            }
        };

        fetchEmple();
    }, []);


    useEffect(() => {
        if (!activeContact) return;
            const updateMessages = async () => {
                await fetchMessenger(activeContact);
            };
            updateMessages();

            // Iniciar el intervalo
            const intervalId = setInterval(updateMessages, 5000);
            return () => clearInterval(intervalId);
    }, [activeContact]);

    //enviar mensaje
    return(
        <>
            <div className={theme === 'light'?'app light': 'app dark'}>
                <div className="slider">
                    <Navbar/>
                    <div className="flex">
                        <SliderEmploye />
                    </div>
                </div>

                <div className="BarraSuperior">
                    <h1>Messenger</h1>
                    <a className="ButtonTheme1" onClick={toggleTheme}> <img src={theme === 'light'? ModoClaro : ModoOscuro} /> </a>
                </div>

                <div className="contentChatW">
                    <div className="contentContact">
                        <div className="barrasuperiorContacts">
                            <p>Contactos</p>
                        </div>

                        <div className="listContactContent">
                        {contacts.length > 0 ? (
                            contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    className={`contactContent ${activeContact?.id === contact.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveContact(contact);

                                        setContacts(prevContacts =>
                                            prevContacts.map(c =>
                                                c.id === contact.id ? { ...c, unread: false } : c
                                            )
                                        );

                                        setUnreadMessages(prev => ({
                                            ...prev, 
                                            [contact.id]: false
                                        }));
                                    }}
                                >
                                    <img src={contact.perfil || Usuario} />
                                    <div className="contact-info">
                                        <p>{contact.nombre}</p>
                                        <p className="lastMessage">
                                           {contact.lastSender}: {contact.lastMessage ? contact.lastMessage.message : ''}
                                        </p>
                                    </div>
                                    {unreadMessages[contact.id] && <span className="unread-dot"></span>}
                                </div>
                            ))
                        ) : (
                            <p className="nullData">No hay contactos disponibles.</p>
                        )}
                        </div>
                    </div>

                    <div className="contentChat">
                        <div className="contentTitle">
                            {activeContact ? (
                                <>
                                    <img
                                        src={activeContact.perfil || Usuario}
                                        alt={`${activeContact.nombre}'s avatar` }
                                        className="contactAvatar"
                                     />
                                     <p>{activeContact.nombre}</p>
                                </>
                            ):(
                                <p>Messenger</p>
                            )}
                        </div>

                        {activeContact ? (
                            <>
                                <div className="messageContainer">
                                {messages.length > 0 ? (
                                    Object.entries(groupMessagesByDate(messages)).map(([date, messagesOnDate]) => (
                                        <div key={date}>
                                            <p className="date-label">{date}</p>
                                            {messagesOnDate.map((message, index) => {
                                                const mensaje = Array.isArray(message.message) ? message.message[0] : message.message ?? '';
                                                const imgUrl = typeof mensaje === 'string' && mensaje.includes('scontent.xx.fbcdn.net');
                                                const audioUrl = typeof mensaje === 'string' && mensaje.includes('cdn.fbsbx');
                        
                                                return (
                                                    <div key={index} className={`message ${message.sender === 'Empleado' ? 'sent' : 'received'}`}>
                                                        {imgUrl || mensaje.startsWith('https://scontent.xx.fbcdn.net') || mensaje.startsWith('https://res.cloudinary.com') ? (
                                                            <>
                                                                <img src={mensaje} style={{ maxWidth: '200px', borderRadius: '10px' }} /><br/>
                                                            </> 
                                                        ) : audioUrl || mensaje.startsWith('https://cdn.fbsbx.com') ? (
                                                            <>
                                                                <audio controls>
                                                                    <source src={mensaje} type="audio/mpeg" />
                                                                    Tu navegador no soporta el formato de audio.
                                                                </audio>
                                                                <br/>
                                                            </>

                                                        ) : (
                                                            <p>{mensaje}</p>
                                                        )}
                                                        <span className="timestamp">
                                                            {new Date(message.updatedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                );
                                            })}

                                        </div>
                                    ))
                                ) : (
                                    <p className="nullData">No hay mensajes disponibles <time datetime="20:00">20:00 </time>.</p>
                                )}
                                </div>
                                <div className="contenttextMessage">
                                    <div className="fileContent">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChage}
                                            style={{ display: "none" }}
                                        />
                                        <CiImageOn
                                            className="icon"
                                            onClick={() => fileInputRef.current.click()}
                                        />
                                        {selectedImage && (
                                            <button onClick={imageUploadNube} className="send-image-button">Enviar Imagen</button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Escribir..."
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />

                                    <button onClick={handleSendMessage}>
                                        <VscSend  className="icon1"/>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="nullData">Seleccione un chat para empezar a chatear</p>
                        )}
                    </div>
                </div>
                {isLoggedIn && <MessageChat/>}
            </div>
        </>
    )
}
export default MessengerEmple