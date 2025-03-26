import { useContext, useEffect, useRef, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderEmploye from "../../../navbar/SliderEmploye";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';
import Usuario from '../../../../assets/img/usuario.png';
import Enviar from '../../../../assets/img/enviar.png';
import MessageChat from "../../../MessageChat";
import '../WhatsappEmple/whatsappEmple.css';
import { CiImageOn } from "react-icons/ci";
import { AiFillAudio } from "react-icons/ai";
import firebase from "firebase/compat/app";

function MessengerEmple (){
    const {theme, toggleTheme} = useContext(ThemeContext)
    const [contacts, setContacts] = useState([])
    const [activeContact, setActiveContact] = useState(null)
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [ isLoggedIn, setIsLoggedIn] = useState(false);
    const fileInputRef = useRef(null);
    const audioInputRef = useRef(null);

    // Manejo del envío de archivos
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Archivo seleccionado:", file);
            // Aquí puedes enviarlo al servidor o al chat
        }
    };
        
    useEffect(()=>{
        const userId = localStorage.getItem('UserId')
        const rolUser = localStorage.getItem('rol-user')
        if(userId && rolUser){
            setIsLoggedIn(true);
        }else{
            setIsLoggedIn(false);
        }
    },[])


    //mensajes de MongoDB
        const fetchMessenger = async (activeContact) => {
            console.log('hola', activeContact.id)
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

                const result = await response.json()
                const data = result.data.docs;
                console.log('los mensajes son: ', data)
                const messageM = data.filter((message) => message.contactId === activeContact.id)

                const mensajesOrdenados = messageM.sort((a, b) => 
                    new Date(a.updatedAt) - new Date(b.updatedAt)
                );

                setMessages(mensajesOrdenados)

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
                const exists = prevContacts.find(contact => contact.id === newContact.id )
                if(!exists){
                    return[...prevContacts, newContact]
                }
                return prevContacts
            })

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

                    for (let i = 0; i < assignedEmple.length; i++){
                        const user = assignedEmple[i];
                        const chatId = user.cahtId;
                        console.log('el id de la primera api es: ', chatId)
                        if(user.chatName === 'ChatBotMessenger'){
                            await fetchManychat(chatId);
                        }
                    }
                }
            }catch (error) {
                console.error('Error al momento de consultar los datos de la API:', error);
            }
        };

        fetchEmple();
    }, []); 

    const handleSendMessage = async () => {
        if (currentMessage.trim() !== "" && activeContact) {
            const newMessage = {
                contactId: activeContact.id,
                message: currentMessage,
                sender: 'Empleado',
                chat: 'messenger',
                idMessageClient: `msg_${Date.now()}-${currentMessage.length}`
            };

            try {
                const response = await fetch(`http://localhost:3001/post-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        suscriberID: activeContact.id,
                        message: currentMessage,
                        chat: 'messenger',
                    }),
                });

                if (!response.ok) throw new Error('Error al guardar el mensaje en post-message');

                const messageResponse = await fetch('http://localhost:3001/message/', {
                    method: 'POST',
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
    const handleKeyPress = (e) =>{
        if(e.key === 'Enter'){
            handleSendMessage()
        }
    }

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
                            contacts.map(contact =>(
                                <>
                                    <div
                                        key={contact.id}
                                        className={`contactContent ${activeContact?.id === contact.id ? 'active': '' }`}
                                        onClick={()=> setActiveContact(contact)}
                                    >
                                        <img src={contact.perfil || Usuario}  />
                                        <p> {contact.nombre}</p>
                                    </div>
                                </>
                            ))
                        ):(
                            <p className="nullData">No hay contactos disponibles. </p>
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
                                                console.log('url', message.message)
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
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        style={{ display: "none" }}
                                    />
                                    <button onClick={() => fileInputRef.current.click()} className="upload-btn">
                                        <CiImageOn size={22} color="#333" />
                                    </button>
                                    
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
                                        onChange={handleFileUpload}
                                        accept="audio/*"
                                        style={{ display: "none" }}
                                    />
                                    <button onClick={() => fileInputRef.current.click()} className="upload-btn">
                                        <AiFillAudio size={22} color="#333" />
                                    </button>
                                    <button onClick={handleSendMessage}>
                                        <img src={Enviar} alt="Enviar" />
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