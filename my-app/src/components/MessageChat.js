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
                    try{
                        const chatId = user.chatId;
                        const chatUserName = user.nombreClient;
                        const motivo = user.categoriaTicket;

                        if (!chatId) {
                            console.warn("⚠️ chatId está indefinido. Objeto user:", user);
                            return;
                        }

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

                        if (!chatId || !messageText || !messageId) {
                            console.warn("⚠️ Datos incompletos para guardar mensaje. Skipping...");
                            continue;
                        }

                        const responseGetMessage = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                        if (!responseGetMessage.ok) throw new Error('Error al consultar mensajes previos');

                        const backendData = await responseGetMessage.json();
                        const dataGetMessage = Array.isArray(backendData.data?.docs)
                            ? backendData.data.docs
                            : Array.isArray(backendData.message)
                                ? backendData.message
                                : [];

                        console.log("🟣 Mensajes desde backend:", dataGetMessage);

                        const allMessages = dataGetMessage.flatMap(doc => doc.messages || []);
                        const messageExists = allMessages.some(msg => msg.idMessageClient === messageId);

                        // Guardar motivo si no existe
                        if (dataGetMessage.length === 0) {
                            const motivoMensaje = `📝 Motivo del contacto: ${motivo}${user.Descripcion?.[0] ? `, con la descripción: ${user.Descripcion[0]}` : ''}`.trim();

                            if (motivoMensaje) {
                                const motivoResponse = await fetch('http://localhost:3001/message/', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        contactId: chatId,
                                        usuario: { nombre: chatUserName },
                                        messages: [
                                            {
                                                sender: 'Sistema',
                                                message: motivoMensaje,
                                                idMessageClient: `${dataMany.subscribed}-motivo`
                                            }
                                        ],
                                        chat: chatuser,
                                    }),
                                });

                                const result = await motivoResponse.json();
                                console.log("✅ Motivo guardado:", result);
                            }
                        }

                        if (!messageExists && !notifiedMessagesRef.current.has(messageId)) {
                            const isNew = !Array.isArray(dataGetMessage) || dataGetMessage.length === 0 || !dataGetMessage[0].messages || dataGetMessage[0].messages.length === 0;
                            const cleanMessage = typeof messageText === 'string' ? messageText.trim() : '';

                            if (!cleanMessage) {
                                console.warn("⚠️ El mensaje está vacío, no se enviará al backend.");
                                continue;
                            }

                            const messageToSave = {
                                sender: "Cliente",
                                message: cleanMessage,
                                idMessageClient: messageId
                            };

                            const body = isNew
                                ? {
                                    contactId: chatId,
                                    usuario: { nombre: chatUserName },
                                    messages: [messageToSave],
                                    chat: chatuser
                                }
                                : {
                                    messages: [messageToSave]
                                };

                            console.log("📤 Body que se va a enviar:", JSON.stringify(body, null, 2));

                            const url = isNew
                                ? 'http://localhost:3001/message/'
                                : `http://localhost:3001/message/${chatId}`;

                            const responseSave = await fetch(url, {
                                method: isNew ? 'POST' : 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                            });

                            if (!responseSave.ok) {
                                const errorText = await responseSave.text();
                                throw new Error(`Error al guardar el mensaje: ${errorText}`);
                            }

                            const resultSave = await responseSave.json();
                            console.log("🟢 Resultado del guardado:", isNew ? 'POST' : 'PUT', resultSave);

                            notifiedMessagesRef.current.add(messageId);

                            newNotifications.push({
                                contactId: chatId,
                                message: cleanMessage,
                                sender: 'Cliente',
                                chat: chatuser,
                                nombre: chatUserName,
                            });
                        }
                    }catch(error){
                        console.error(`🚫 Error procesando el contacto ${user.nombreClient}:`, error.message)
                        continue;
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
