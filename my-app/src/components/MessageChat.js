import { useEffect, useRef, useState } from "react";
import Notificacion from '../assets/sounds/Notificacion.mp3';

function MessageChat() {
    const lastMessagesRef = useRef({});
    const audioRef = useRef(new Audio(Notificacion));
    const [notificacions, setNotificacions] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(true);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const EmpleId = localStorage.getItem('UserId');
                const responseEmple = await fetch(`http://localhost:3001/asignaciones/`);
                if (!responseEmple.ok) throw new Error('Error al consultar asignaciones');

                const dataEmple = (await responseEmple.json()).data.docs;
                const assignedEmple = dataEmple.filter((emple) => emple.idEmple === EmpleId);
                if (!assignedEmple.length) return;

                let newNotifications = [];

                for (let user of assignedEmple) {
                    const chatId = user.cahtId;
                    const chatUserName = user.nombreClient;
                    const motivo = user.categoria;

                    let chatuser = 'desconocido';
                    if (user.chatName === 'ChatBotMessenger') chatuser = 'messenger';
                    else if (user.chatName === 'ChatBotTelegram') chatuser = 'telegram';
                    else if (user.chatName === 'ChatBotInstagram') chatuser = 'instagram';

                    const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
                    if (!responseMany.ok) throw new Error('Error al consultar Manychat');

                    const dataMany = (await responseMany.json()).cliente.data;
                    const messageText = dataMany.last_input_text;

                    const isImage = messageText.includes('scontent.xx.fbcdn.net');
                    const isAudio = messageText.includes('cdn.fbsbx.com');
                    const isMedia = isImage || isAudio;

                    let messageId = isMedia
                        ? `${dataMany.subscribed}-${messageText.split('/').pop().split('?')[0]}`
                        : `${dataMany.subscribed}-${messageText.slice(-10)}`;

                    const responseGetMessage = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                    if (!responseGetMessage.ok) throw new Error('Error al consultar mensajes previos');

                    const dataGetMessage = (await responseGetMessage.json()).data.docs;
                    const allMessages = dataGetMessage.flatMap(doc => doc.messages || []);
                    const messageExists = allMessages.some(msg => msg.idMessageClient === messageId);

                    // Guardar motivo si no existe
                    if (dataGetMessage.length === 0) {
                        await fetch('http://localhost:3001/message/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contactId: chatId,
                                usuario: { nombre: chatUserName },
                                messages: [
                                    {
                                        sender: 'Sistema',
                                        message: `📝 Motivo del contacto: ${motivo}`,
                                        idMessageClient: `${dataMany.subscribed}-motivo`
                                    }
                                ],
                                chat: chatuser,
                            }),
                        });
                        console.log(`✅ Motivo guardado para ${chatUserName}`);
                    }

                    if (!messageExists) {
                        await fetch('http://localhost:3001/message/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contactId: chatId,
                                usuario: { nombre: chatUserName },
                                messages: [
                                    {
                                        sender: "Cliente",
                                        message: messageText,
                                        idMessageClient: messageId
                                    }
                                ],
                                chat: chatuser,
                            }),
                        });

                        console.log(`🆕 Nuevo mensaje (${isMedia ? "Multimedia" : "Texto"}) de ${chatUserName}`);

                        newNotifications.push({
                            contactId: chatId,
                            message: messageText,
                            sender: 'Cliente',
                            chat: chatuser,
                            nombre: chatUserName,
                        });
                    }
                }

                if (newNotifications.length > 0) {
                    setNotificacions(prev => [...prev, ...newNotifications]);

                    if (audioEnabled) {
                        audioRef.current.play().catch(err => {
                            console.warn("🔇 No se pudo reproducir el sonido:", err);
                        });
                    }

                    // Eliminar después de 3s solo la notificación agregada
                    setTimeout(() => {
                        setNotificacions(prev => prev.slice(newNotifications.length));
                    }, 3000);
                }

            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
            }
        }, 3000); // cada 3s

        return () => clearInterval(intervalId);
    }, [audioEnabled]);

    return (
        <div className="notificacion-container">
            {notificacions.map((notif, index) => {
                const isImage = notif.message.includes('scontent.xx.fbcdn.net');
                const isAudio = notif.message.includes('cdn.fbsbx.com');

                return (
                    <div key={index} className="notificacion">
                        <p>📩 {notif.nombre}:</p>
                        {isImage ? (
                            <img src={notif.message} alt="Imagen" />
                        ) : isAudio ? (
                            <audio controls src={notif.message}></audio>
                        ) : (
                            <p>{notif.message}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default MessageChat;
