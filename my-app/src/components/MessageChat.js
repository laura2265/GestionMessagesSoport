import { useEffect, useRef, useState } from "react";
import Notificacion from '../assets/sounds/Notificacion.mp3';

function getChatUserType(name) {
    if (name === 'ChatBotMessenger') return 'messenger';
    if (name === 'ChatBotTelegram') return 'telegram';
    if (name === 'ChatBotInstagram') return 'instagram';
    if (name === 'ChatBotLocal') return 'local'
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

  const getResponse = await fetch(
    `http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`
  );
  const data = await getResponse.json();
  const docs = data?.data?.docs || [];

  let existingDoc = docs.find(d =>
    String(d.contactId) === String(chatId) &&
    (d.chat === chatuser || (!d.chat && !chatuser))
  );

  if (!existingDoc) {
    const createRes = await fetch('http://localhost:3001/message/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) {
      throw new Error(`Error al crear la conversación: ${await createRes.text()}`);
    }
    const createdJson = await createRes.json();
    existingDoc = createdJson?.data || createdJson;
    console.log('Conversación creada (POST)', existingDoc._id);
  }

  try {
    const response = await fetch(`http://localhost:3001/message/${existingDoc._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: 
        [{ 
          sender, 
          message, 
          idMessageClient: messageId 

        }] 
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al subir el mensaje (PUT): ${await response.text()}`);
    }

    const result = await response.json();
    console.log('Mensaje guardado en conversación:', existingDoc._id, result);
  } catch (err) {
    throw err;
  }
}

async function appendIfNotExists({ chatId, chatuser, sender = 'Sistema', message, idMessageClient }) {
  
    // Antes (mal): /message/${chatId}
    const q = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
    const data = await q.json();
    const doc = data?.data?.docs?.[0];
    if (!doc) throw new Error('No existe conversación');

    const docId = doc._id || doc.id; // preferiblemente _id
    await fetch(`http://localhost:3001/message/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ sender, message, idMessageClient: idMessageClient }] }),
    });
    return true;
}


function MessageChat() {
    const notifiedMessagesRef = useRef(new Map());
    const audioRef = useRef(new Audio(Notificacion));
    const [notificacions, setNotificacions] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const pendienteConversacion =  useRef(new Map())

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
                        const { chatId, nombreClient, numDocTitular, categoriaTicket, Descripcion, chatName } = user;
                        if (!chatId) continue;
                        const chatuser = getChatUserType(chatName);
                        const convKey = `${chatId}|${chatuser}`;

                        // Verificar si ya existe conversación
                        const getConv = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                        const getData = await getConv.json();
                        const existeConversacion = getData?.data?.docs?.length > 0;

                            if (!existeConversacion) {
                                // Nueva conversación: crear
                                const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
                                if (!responseMany.ok) throw new Error('Error al consultar Manychat');

                                const dataMany = (await responseMany.json()).cliente.data;
                                const messageText = dataMany.last_input_text;
                                const messageId = buildMessageId(dataMany.subscribed, messageText);

                                const messageInit = {
                                    sender: 'Sistema',
                                    message: '🟢 Inicio de conversación',
                                    idMessageClient: `${chatId}-inicio`,
                                };

                                
                                // Construye los textos de sistema igual que en el POST inicial
                                const descripcionText  = Array.isArray(Descripcion) && Descripcion.length > 0 ? Descripcion[0] : null;
                                const descripcionExtra = Array.isArray(Descripcion) && Descripcion.length > 1 ? Descripcion[1] : null;
                                                            
                                const motivoTexto = descripcionText
                                  ? `📝 Motivo del contacto: ${categoriaTicket}, con la descripción: ${descripcionText}` + (descripcionExtra ? `  Detalle adicional: ${descripcionExtra}` : '')
                                  : `📝 Motivo del contacto: ${categoriaTicket}`;
                     
                                // Opcional: “Inicio de conversación” 1 vez por día
                                const today = new Date().toISOString().slice(0,10);
                                await appendIfNotExists({ chatId, chatuser, sender:'Sistema', message:'🟢 Inicio de conversación', idMessageClient:`${chatId}-inicio-${today}` });
                                await appendIfNotExists({ chatId, chatuser, sender:'Sistema', message: motivoTexto, idMessageClient:`${chatId}-motivo-${today}` });

                                const messageMotivo = {
                                sender: 'Sistema',
                                message: motivoTexto,
                                idMessageClient: `${chatId}-motivo`,
                                };

                                const messageReal = {
                                    sender: 'Cliente',
                                    message: messageText,
                                    idMessageClient: messageId,
                                };

                                if (!pendienteConversacion.current.has(convKey)) {
                                    const mensajeInicial = [messageInit, messageMotivo, messageReal]
                                    console.log('💬 Acumulando conversación:', {
                                    contactId: chatId,
                                    motivo: motivoTexto,
                                    messages: mensajeInicial,
                                    });

                                    pendienteConversacion.current.set(convKey, {
                                        contactId: chatId,
                                        usuario: { nombre: nombreClient, documento: numDocTitular },
                                        chat: chatuser,
                                        motivo: motivoTexto,
                                        messages: mensajeInicial,
                                    });
                                }
                            } else {
                            const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
                            if (!responseMany.ok) throw new Error('Error al consultar Manychat');

                            const dataMany = (await responseMany.json()).cliente.data;
                            const messageText = dataMany.last_input_text;
                            const messageId = buildMessageId(dataMany.subscribed, messageText);

                            const refreshConv = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                            const refreshData = await refreshConv.json();
                            const allMessages = refreshData?.data?.docs?.flatMap(doc => doc.messages || []) || [];

                            const messageExists = allMessages.some(msg => msg.idMessageClient === messageId);
                            const notifiedSet = notifiedMessagesRef.current.get(chatId) || new Set();

                            if (!notifiedMessagesRef.current.has(chatId)) {
                                notifiedMessagesRef.current.set(chatId, notifiedSet);
                            }

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
                        }

                    } catch (error) {
                        console.error(`🚫 Error procesando asignado ${user.nombreClient}:`, error.message);
                    }
                }

                // Al final del interval, guardar todas las conversaciones pendientes
                for (const [key, convData] of pendienteConversacion.current.entries()) {
                    try {
                        const check = await fetch(`http://localhost:3001/message/?contactId=${encodeURIComponent(convData.contactId)}&chat=${encodeURIComponent(convData.chat || '')}`)
                        const checkData = await check.json();
                       const existsNow = (checkData?.data?.docs || []).some(d =>
                          String(d.contactId) === String(convData.contactId) &&
                          (d.chat === convData.chat || (!d.chat && !convData.chat))
                        );
                        
                        if(existsNow){
                            console.log(`Conversacion para ${convData.contactId} ya existe(race), omitiendo (POST)`);
                            pendienteConversacion.current.delete(key);
                            continue;
                        }

                        const response = await fetch(`http://localhost:3001/message/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(convData),
                        });

                        if(response.ok){
                            console.log('Conversacion creada para ', convData.contactId)
                            pendienteConversacion.current.delete(key);
                        }else{
                            let err = await response.text();
                            console.log(`Error guardando conversacion (${convData.contactId}): `, err)
                        }

                    } catch (error) {
                        console.error(`❌ Fallo al guardar conversación (${convData.contactId}):`, error.message);
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