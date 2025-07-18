import { useEffect, useRef, useState } from "react";
import Notificacion from '../assets/sounds/Notificacion.mp3';

function getChatUserType(name) {
    if (name === 'ChatBotMessenger') return 'messenger';
    if (name === 'ChatBotTelegram') return 'telegram';
    if (name === 'ChatBotInstagram') return 'instagram';
    return 'desconocido';
}

function buildMessageId(subscribed, messageText) {
    if (!messageText) return null;
    const isImage = messageText.includes('scontent.xx.fbcdn.net');
    const isAudio = messageText.includes('cdn.fbsbx.com');
    return isImage || isAudio
        ? `${subscribed}-${messageText.split('/').pop().split('?')[0]}`
        : `${subscribed}-${messageText.slice(-10)}`;
}

async function saveMessage({ chatId, nombreClient, chatuser, sender, message, messageId }) {
    const body = {
        contactId: chatId,
        usuario: { nombre: nombreClient },
        messages: [{ sender, message, idMessageClient: messageId }],
        chat: chatuser,
    };

    const response = await fetch(`http://localhost:3001/message/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error guardando mensaje: ${errText}`);
    }

    const result = await response.json();
    console.log(`✅ ${sender === 'Sistema' ? 'Motivo' : 'Mensaje'} guardado:`, result);
}

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
                    try {
                        const { chatId, nombreClient, numDocTitular ,categoriaTicket, Descripcion, chatName } = user;
                        if (!chatId) continue;

                        const chatuser = getChatUserType(chatName);

                        const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
                        if (!responseMany.ok) throw new Error('Error al consultar Manychat');
                        const dataMany = (await responseMany.json()).cliente.data;

                        const messageText = dataMany.last_input_text;
                        const messageId = buildMessageId(dataMany.subscribed, messageText);
                        if (!messageId || !messageText) continue;

                        const responseGet = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                        if (!responseGet.ok) throw new Error('Error al consultar mensajes previos');
                        const backendData = await responseGet.json();

                        const dataGetMessage = Array.isArray(backendData.data?.docs)
                            ? backendData.data.docs
                            : Array.isArray(backendData.message)
                                ? backendData.message
                                : [];

                        const allMessages = dataGetMessage.flatMap(doc => doc.messages || []);
                        const messageExists = allMessages.some(msg => msg.idMessageClient === messageId);

                        // Descripción
                        if (dataGetMessage.length === 0 && Array.isArray(Descripcion)) {
                            for (let i = 0; i < Descripcion.length; i++) {
                                const descripcionMensaje = Descripcion[i]?.trim();
                                if (!descripcionMensaje) continue;

                                const descId = `${dataMany.subscribed}-descripcion${i}`;
                                const yaExiste = notifiedMessagesRef.current.has(descId) ||
                                    dataGetMessage.some(doc =>
                                        doc.messages?.some(msg => msg.idMessageClient === descId)
                                    );

                                if (!yaExiste) {
                                    await saveMessage({
                                        chatId,
                                        nombreClient,
                                        chatuser,
                                        sender: 'Cliente',
                                        message: descripcionMensaje,
                                        messageId: descId
                                    });
                                    notifiedMessagesRef.current.add(descId);
                                }
                            }

                            // Motivo
                            const motivoMensaje = `📝 Motivo del contacto: ${categoriaTicket}${Descripcion?.[0] ? `, con la descripción: ${Descripcion[0]}` : ''}`.trim();
                            const motivoId = `${dataMany.subscribed}-motivo`;

                            if (!notifiedMessagesRef.current.has(motivoId)) {
                                await saveMessage({
                                    chatId,
                                    nombreClient,
                                    chatuser,
                                    sender: 'Sistema',
                                    message: motivoMensaje,
                                    messageId: motivoId
                                });
                                notifiedMessagesRef.current.add(motivoId);
                            }
                        }

                        // Mensaje del cliente
                        if (!messageExists && !notifiedMessagesRef.current.has(messageId)) {
                            await saveMessage({
                                chatId,
                                nombreClient,
                                chatuser,
                                sender: 'Cliente',
                                message: messageText.trim(),
                                messageId
                            });

                            notifiedMessagesRef.current.add(messageId);

                            newNotifications.push({
                                contactId: chatId,
                                message: messageText.trim(),
                                sender: 'Cliente',
                                chat: chatuser,
                                nombre: nombreClient,
                            });
                        }

                    } catch (error) {
                        console.error(`🚫 Error procesando el contacto ${user.nombreClient}:`, error.message);
                    }
                }

                // Notificaciones
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
            {notificacions.map((notif) => {
                const key = `${notif.contactId}-${notif.message}`;
                const isImage = notif.message.includes('scontent.xx.fbcdn.net');
                const isAudio = notif.message.includes('cdn.fbsbx.com');

                return (
                    <div key={key} className="notificacion">
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
