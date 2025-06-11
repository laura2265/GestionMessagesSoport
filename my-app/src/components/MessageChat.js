import { useEffect, useRef, useState } from "react";
import Notificacion from '../assets/sounds/Notificacion.mp3';

function MessageChat() {
    const notifiedMessagesRef = useRef(new Set());
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

                    const messageId = isMedia
                        ? `${dataMany.subscribed}-${messageText.split('/').pop().split('?')[0]}`
                        : `${dataMany.subscribed}-${messageText.slice(-10)}`;

                    console.log("🟡 Manychat message info:", { messageText, messageId });

                    const responseGetMessage = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                    if (!responseGetMessage.ok) throw new Error('Error al consultar mensajes previos');

                    const backendData = await responseGetMessage.json();
                    const dataGetMessage = backendData.message || backendData.data?.docs || [];

                    console.log("🟣 Mensajes desde backend:", dataGetMessage);

                    const allMessages = dataGetMessage.flatMap(doc => doc.messages || []);
                    const messageExists = allMessages.some(msg => msg.idMessageClient === messageId);

                    // Guardar motivo si no existe
                    if (dataGetMessage.length === 0) {
                        const motivoResponse = await fetch('http://localhost:3001/message/', {
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
                        console.log("✅ Motivo guardado:", await motivoResponse.json());
                    }

                    if (!messageExists && !notifiedMessagesRef.current.has(messageId)) {
                        const isNew = dataGetMessage.length === 0;
                        const endpoint = dataGetMessage.length === 0
                            ? 'http://localhost:3001/message/'
                            : `http://localhost:3001/message/${chatId}`;
                        const method = dataGetMessage.length === 0 ? 'POST' : 'PUT';
                        const body = isNew
                            ? {
                                contactId: chatId,
                                usuario: { nombre: chatUserName },
                                messages: [
                                    {
                                        sender: "Cliente",
                                        message: messageText,
                                        idMessageClient: messageId
                                    }
                                ],
                                chat: chatuser
                            }:{
                                messages: [
                                    {
                                        sender: "Cliente",
                                        message: messageText,
                                        idMessageClient: messageId
                                    }
                                ]
                            };

                        const responseSave = await fetch(endpoint, {
                            method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                        });

                        const resultSave = await responseSave.json();
                        console.log("🟢 Resultado del guardado:", method, resultSave);

                        // Agregar a lista de mensajes notificados
                        notifiedMessagesRef.current.add(messageId);

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

                    setTimeout(() => {
                        setNotificacions(prev => prev.slice(newNotifications.length));
                    }, 3000);
                }

            } catch (error) {
                console.error(`❌ Error en interval: ${error.message}`);
            }
        }, 3000);

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
