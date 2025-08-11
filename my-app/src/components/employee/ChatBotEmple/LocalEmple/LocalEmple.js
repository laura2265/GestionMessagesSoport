import { useContext, useEffect, useRef, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderEmploye from "../../../navbar/SliderEmploye";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';
import Usuario from '../../../../assets/img/usuario.png';
import { VscSend } from "react-icons/vsc";
import '../WhatsappEmple/whatsappEmple.css';

function LocalEmple() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [unreadMessages, setUnreadMessages] = useState({});

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    // Obtener lista de contactos desde la API del bot
    const fetchContacts = async () => {
        try {
            const res = await fetch(`http://localhost:3001/conversacion-bot?page=1&limit=100`);
            const data = await res.json();

            if (data.succes && data.data.docs) {
                const contactos = data.data.docs.map(conv => ({
                    id: conv.id,
                    nombre: conv.usuario?.nombre || 'Sin nombre',
                    lastMessage: conv.conversacion?.slice(-1)[0] || {},
                    lastSender: conv.conversacion?.slice(-1)[0]?.de || '',
                }));
                setContacts(contactos);
            }
        } catch (error) {
            console.error('Error al obtener contactos:', error);
        }
    };

    // Cargar mensajes de un contacto
    const fetchMessages = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/conversacion-bot/${id}`);
            const data = await res.json();

            if (data.success) {
                setMessages(data.data.conversacion || []);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
        }
    };

    // Crear conversación si no existe
    const ensureConversation = async (contact) => {
        try {
            const res = await fetch(`http://localhost:3001/conversacion-bot/${contact.id}`);
            if (res.status === 404) {
                await fetch(`http://localhost:3001/conversacion-bot`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: contact.id,
                        usuario: { nombre: contact.nombre },
                        estadoActual: 'nuevo',
                        conversacion: [],
                        finalizacion: null
                    })
                });
            }
        } catch (error) {
            console.error("Error creando conversación:", error);
        }
    };

    // Enviar mensaje
    const handleSendMessage = async () => {
        if (!currentMessage.trim() || !activeContact) return;

        await ensureConversation(activeContact);

        try {
            const res = await fetch(`http://localhost:3001/update-message/${activeContact.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    de: 'empleado',
                    mensaje: currentMessage
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    de: 'empleado',
                    mensaje: currentMessage,
                    timeStamp: new Date()
                }]);
                setCurrentMessage('');
            }

        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    };

    // Agrupar mensajes por fecha
    const groupMessagesByDate = (messages) => {
        return messages.reduce((acc, message) => {
            const dateKey = new Date(message.timeStamp || message.updatedAt).toLocaleDateString('es-ES');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(message);
            return acc;
        }, {});
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (!activeContact) return;

        const updateMessages = async () => {
            await fetchMessages(activeContact.id);
        };

        updateMessages();
        const intervalId = setInterval(updateMessages, 5000);
        return () => clearInterval(intervalId);
    }, [activeContact]);

    return (
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderEmploye />
                    </div>
                </div>

                <div className="BarraSuperior">
                    <h1>Chat Local</h1>
                    <a className="ButtonTheme1" onClick={toggleTheme}>
                        <img src={theme === 'light' ? ModoClaro : ModoOscuro} />
                    </a>
                </div>

                <div className="contentChatW">
                    {/* Lista de contactos */}
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
                                            setMessages([]);
                                            setActiveContact(contact);
                                            setUnreadMessages(prev => ({
                                                ...prev,
                                                [contact.id]: false
                                            }));
                                        }}
                                    >
                                        <img src={Usuario} />
                                        <div className="contact-info">
                                            <p>{contact.nombre}</p>
                                            <p className="lastMessage">
                                                {contact.lastSender}: {contact.lastMessage?.mensaje || ''}
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

                    {/* Chat */}
                    <div className="contentChat">
                        <div className="contentTitle">
                            {activeContact ? (
                                <>
                                    <img src={Usuario} alt="avatar" className="contactAvatar" />
                                    <p>{activeContact.nombre}</p>
                                </>
                            ) : (
                                <p>Selecciona un contacto</p>
                            )}
                        </div>

                        {activeContact ? (
                            <>
                                <div className="messageContainer">
                                    {messages.length > 0 ? (
                                        Object.entries(groupMessagesByDate(messages)).map(([date, messagesOnDate]) => (
                                            <div key={date}>
                                                <p className="date-label">{date}</p>
                                                {messagesOnDate.map((message, index) => (
                                                    <div key={index} className={`message ${message.de === 'empleado' ? 'sent' : 'received'}`}>
                                                        <p>{message.mensaje}</p>
                                                        <span className="timestamp">
                                                            {new Date(message.timeStamp || message.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="nullData">No hay mensajes disponibles</p>
                                    )}
                                </div>

                                <div className="contenttextMessage">
                                    <input
                                        type="text"
                                        placeholder="Escribir..."
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <button onClick={handleSendMessage}>
                                        <VscSend className="icon1" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="nullData">Seleccione un chat para empezar a chatear</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default LocalEmple;
