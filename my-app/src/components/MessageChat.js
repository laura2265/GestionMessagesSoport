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

async function saveMessage({ chatId, nombreClient, chatuser, sender, message, messageId, numDocTitular }) {
    const body = {
        contactId: chatId,
        usuario: { nombre: nombreClient, documento: numDocTitular },
        messages: [{ sender, message, idMessageClient: messageId }],
        chat: chatuser,
    };

    const getResponse = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
    const data = await getResponse.json();
    const existingId = data?.data?.docs?.[0]?._id;

    let url, method, finalBody;

    if (existingId) {
        
        url = `http://localhost:3001/message/${existingId}`;
        method = 'PUT';
        finalBody = JSON.stringify(body); 
    } else {
        // Si no existe, crea una nueva
        url = `http://localhost:3001/message/`;
        method = 'POST';
        finalBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: finalBody,
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error guardando mensaje: ${errText}`);
    }

    const result = await response.json();
    console.log(`✅ ${sender === 'Sistema' ? 'Motivo' : 'Mensaje'} guardado:`, result);
}

function MessageChat() {
    const notifiedMessagesRef = useRef(new Map());
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
                    console.log('🧩 Usuario:', {
                        nombre: user.nombreClient,
                        categoriaTicket: user.categoriaTicket,
                        descripcion: user.Descripcion,
                    });

                    try {
                        const { chatId, nombreClient, numDocTitular, categoriaTicket, Descripcion, chatName } = user;
                        if(!chatId){
                            console.warn('⚠️ El chatId está indefinido, se omite este contacto.')
                            continue
                        }

                        const chatuser = getChatUserType(chatName);

                        const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
                        if (!responseMany.ok) throw new Error('Error al consultar Manychat');
                        const dataMany = (await responseMany.json()).cliente.data;

                        const messageText = dataMany.last_input_text;
                        const messageId = buildMessageId(dataMany.subscribed, messageText);

                        const getConv = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                        const getData = await getConv.json();
                        const existeConversacion = getData?.data?.docs?.length > 0;

                        if (!notifiedMessagesRef.current.has(chatId)) {
                            notifiedMessagesRef.current.set(chatId, new Set());
                        }

                        const notifiedSet = notifiedMessagesRef.current.get(chatId);

                        if (!existeConversacion) {
                            await saveMessage({
                                chatId,
                                nombreClient,
                                chatuser,
                                sender: 'Sistema',
                                message: '🟢 Inicio de conversación',
                                messageId: `${chatId}-inicio`,
                                numDocTitular
                            });
                            notifiedSet.add(`${chatId}-inicio`);
                        }

                        const refreshConv = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                        const refreshData = await refreshConv.json();
                        const allMessages = refreshData?.data?.docs?.flatMap(doc => doc.messages || []) || [];

                        const motivoMensaje = `📝 Motivo del contacto: ${categoriaTicket}${Descripcion?.[0] ? `, con la descripción: ${Descripcion[0]}` : ''}`.trim();
                        const motivoId = `${dataMany.subscribed}-motivo`;
                        const motivoExiste = allMessages.some(msg => msg.idMessageClient === motivoId);

                        if (!motivoExiste && !notifiedSet.has(motivoId)) {
                            await saveMessage({
                                chatId,
                                nombreClient,
                                chatuser,
                                sender: 'Sistema',
                                message: motivoMensaje,
                                messageId: motivoId,
                                numDocTitular
                            });
                            notifiedSet.add(motivoId);

                        }

                        if (Array.isArray(Descripcion)) {
                            for (let i = 0; i < Descripcion.length; i++) {
                                const descripcionMensaje = Descripcion[i]?.trim();
                                const descId = `${dataMany.subscribed}-descripcion${i}`;
                                const yaExiste = allMessages.some(msg => msg.idMessageClient === descId);

                                if (descripcionMensaje && !yaExiste && !notifiedSet.has(descId)) {

                                    await saveMessage({
                                        chatId,
                                        nombreClient,
                                        chatuser,
                                        sender: 'Cliente',
                                        message: descripcionMensaje,
                                        messageId: descId,
                                        numDocTitular
                                    });

                                    notifiedSet.add(descId);
                                }
                            }
                        }

                        const messageExists = allMessages.some(msg => msg.idMessageClient === messageId);
                        if (messageText && messageId && !messageExists && !notifiedSet.has(messageId)) {
                            await saveMessage({
                                chatId,
                                nombreClient,
                                chatuser,
                                sender: 'Cliente',
                                message: messageText.trim(),
                                messageId,
                                numDocTitular
                            });

                            notifiedSet.add(messageId);

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
                const key = `${notif.contactId}-${notif.message}-${index}`;
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
