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
                contactId: activeContact.id,
                usuario:{
                    nombre: nombreEmpleado,
                },
                message: {
                    sender: 'Empleado',
                    messages: currentMessage,
                    idMessageClient: `msg_${Date.now()}-${currentMessage.length}`
                },
                chat: 'messenger',
            };

            const rawMessage = {
                suscriberID:activeContact.id,
                message: currentMessage,
                chat: 'messenger',
            }

            try {
                const response = await fetch(`http://localhost:3001/post-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rawMessage),
                });

                if (!response.ok) throw new Error('Error al guardar el mensaje en post-message');

                const messageResponse = await fetch('http://localhost:3001/message/', {
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

    const imageUploadNube = async() => {
        if(!selectedImage){
            return;
        }

        try{
            const formData = new FormData();
            formData.append('file', selectedImage);

            const response = await fetch('http://localhost:3001/image-post-message',{
                method: 'POST',
                body: formData,
                redirect: 'follow'
            });

            if(!response.ok){
                throw new Error('Error al subir la imagen a la nube')
            }

            const data = await response.json();
            const image = data[0]?.secure_url || data?.secure_url || '';
            console.log('La imagen fue subida con exito: ', data);

            const newMessage = {
                contactId: activeContact.id,
                usuario: {
                    nombre: nombreEmpleado,
                },
                messages: [
                    {
                        sender: 'Empleado',
                        message: image,
                        idMessageClient: `msg_imageProblem${Date.now()}`
                    }
                ],
                chat: 'messenger',
            };

            await fetch('http://localhost:3001/message/',{
                method: 'PUT',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    newMessage
                })
            });

            const responseManychat = await fetch('http://localhost:3001/post-message',{
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    suscriberID: activeContact.id,
                    messages: image,
                    chat: 'messenger'
                })
            });

            if(!responseManychat.ok){
                throw new Error('Erro al enviar la imagen')
            }

            setMessages(prevMessages => [...prevMessages, newMessage]);
            setSelectedImage(null);
        }catch(error){
            console.error('Error al subir la imagen a la nube: ', error)
        }
    }

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
            const data = result.data.docs;

            if (!data || data.length === 0) {
                setMessages([]);
                return;
            }

            const mensajesOrdenados = data.sort((a, b) => 
                new Date(a.updatedAt) - new Date(b.updatedAt)
            );

            setMessages(mensajesOrdenados);
            const lastMessage = mensajesOrdenados[mensajesOrdenados.length - 1];

            setUnreadMessages(prev => ({
                ...prev,
                [activeContact.id]: activeContact.id !== activeContact.id 
            }));

            setContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact.id === activeContact.id
                    ? { ...contact, lastMessage }
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

            console.log('id es: ', newContact)
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
                const responseEmple = await fetch(`http://localhost:3001/asignaciones/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!responseEmple.ok) {
                    throw new Error('Error al momento de consultar los datos del empleado');
                }

                const resultEmple = await responseEmple.json();
                const dataEmple = resultEmple.data.docs;

                console.log(dataEmple);

                const assignedEmple = dataEmple.filter((emple) => emple.idEmple === EmpleId);

                if (assignedEmple && assignedEmple.length > 0) {
                    for (let i = 0; i < assignedEmple.length; i++) {
                        const user = assignedEmple[i];
                        const chatId = user.cahtId;
                        const nameEmple = user.nombreEmple;

                        if(!nameEmple){
                            console.log('Este campo esta vacio por favor registre el empleado como empleado asignado antes de realizar la consulta')
                        }

                        console.log('el nombre del empleado asignado es: ', nameEmple);

                        setNombreEmpleado(nameEmple);
                        console.log('El ID del chat es:', chatId);

                        if (user.chatName === 'ChatBotMessenger') {
                            await fetchManychat(chatId);

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
                            const data = result.data.docs;

                            const exists = data.some(msg => msg.contactId === user.chatId && msg.message === user.Descripcion);

                            if (!exists) {
                                const newMessage = {
                                    contactId: chatId,
                                    usuario:{
                                        nombre: user.nombreClient,
                                    },
                                    messages:[
                                        {
                                            sender: 'Cliente',
                                            message: user.Descripcion,
                                            idMessageClient: `msg_MessageProblem-${user.Descripcion.length}`,
                                        }
                                    ],
                                    chat: 'messenger',
                                };

                                const messageResponse = await fetch('http://localhost:3001/message/', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(newMessage),
                                });
                                if (!messageResponse.ok) throw new Error('Error al guardar el mensaje en message');
                                console.log('Mensaje guardado correctamente.');
                            } else {
                                console.log('El mensaje ya existe, no se enviará.');
                            }
                        }
                    }
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
                                            {contact.lastMessage ? contact.lastMessage.message : ''}
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
                                                const imgUrl = message.message?.includes('scontent.xx.fbcdn.net');
                                                const audioUrl = message.message?.includes('cdn.fbsbx');
                                                
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`message ${message.sender === 'Empleado' ? 'sent' : 'received'}`}
                                                    >
                                                        {imgUrl || message.message[0].includes('https://scontent.xx.fbcdn.net') ? (
                                                            <>
                                                                <img src={message.message} style={{ maxWidth: '200px', borderRadius: '10px' }} /><br/>
                                                            </>
                                                        ) : audioUrl || message.message[0].includes('https://cdn.fbsbx.com')? (
                                                            <>
                                                                <audio controls>
                                                                    <source src={message.message[0]} type="audio/mpeg" />
                                                                    Tu navegador no soporta el formato de audio.
                                                                </audio>
                                                                <br/>
                                                            </>
                                                        ) : (
                                                            <p>{message.message}</p>
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
                                    <p className="nullData">No hay mensajes disponibles.</p>
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

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChage}
                                        accept="audio/*"
                                        style={{ display: "none" }}
                                    />

                                    <button onClick={() => fileInputRef.current.click()} className="upload-btn">
                                        <AiFillAudio size={22} color="#333" />
                                    </button>

                                    <button onClick={handleSendMessage}>
                                        <VscSend />
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