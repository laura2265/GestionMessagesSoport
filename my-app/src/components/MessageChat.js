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
  const base = `${subscribed || 'na'}|${messageText}`;     
  let hash = 0;                                            
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash) + base.charCodeAt(i);
    hash |= 0; // to 32-bit
  }
  return `mc-${hash}`;
}


const mapSenderToDe = (s) => {
  if (s === 'Cliente') return 'usuario';
  if (s === 'Sistema') return 'sistema';
  return 'agente';
};

async function saveMessage({ chatId, nombreClient, chatuser, sender, message, messageId, numDocTitular }) {
  const body = {
    contactId: chatId,
    usuario: { nombre: nombreClient, documento: numDocTitular },
    messages: [{ 
      sender: sender, 
      message: message, 
      idMessageClient: messageId,
      timeStamp: new Date().toISOString(),
    }],
    chat: chatuser,
  };

  console.log(body)

  // 1) Buscar conversación existente
  const getResponse = await fetch(
    `http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`
  );
  const data = await getResponse.json();
  const docs = data?.data?.docs || [];
  let existingDoc = docs.find(d =>
    String(d.contactId) === String(chatId) &&
    (d.chat === chatuser || (!d.chat && !chatuser))
  );
  console.log('existing ', existingDoc)
  // 2) Crear si no existe
  if (!existingDoc) {
    const createRes = await fetch('http://localhost:3001/message/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) {
      throw new Error(`Error al crear la conversación: ${await createRes.text()}`);
    }
    console.log('ay mi dios')
    const createdJson = await createRes.json();
    existingDoc = createdJson?.data || createdJson;
    console.log('Conversación creada (POST)', existingDoc._id);
    return; // ya guardamos el primer mensaje en el POST
  }

    const messageAlreadyExists = (existingDoc.messages || []).some(m => m.idMessageClient === messageId);
    if (messageAlreadyExists) {
      console.log('Mensaje ya existe, no se envía PUT');
      return;
    }

  // 3) Anexar si ya existe (PUT con conversacion)
  const response = await fetch(`http://localhost:3001/message/${existingDoc.contactId}?chat=${chatuser}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        messages: [
            {
                sender: sender, 
                message: message, 
                idMessageClient: messageId,
                timeStamp: new Date().toISOString()
            }
        ]
    }),
  });


  console.log('ayy mi dios')
  if (!response.ok) {
    throw new Error(`Error al subir el mensaje (PUT): ${await response.text()}`);
  }

  const result = await response.json();
  console.log('Mensaje guardado en conversación:', existingDoc._id, result);
}


async function appendIfNotExists({ chatId, chatuser, sender = 'Sistema', message, idMessageClient }) {
  const q = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
  const data = await q.json();
  const doc = data?.data?.docs?.[0];
  if (!doc) throw new Error('No existe conversación');

  // Evita duplicar por idMessageClient
  const yaEsta = (doc.conversacion || []).some(m => m.idMessageClient === idMessageClient);
  if (yaEsta) return false;

  const docId = doc._id || doc.id;
  const res = await fetch(`http://localhost:3001/message/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      conversacion: [{ 
        de: mapSenderToDe(sender), 
        mensaje: message, 
        idMessageClient, 
        timeStamp: new Date().toISOString(),
        origen: chatuser
      }] 
    }),
  });

  if (!res.ok) throw new Error(`Error al anexar: ${await res.text()}`);
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
                const processedThisTick = new Set();

                let newNotifications = [];
                for (let user of assignedEmple) {
                    try {
                        const { chatId, nombreClient, numDocTitular, categoriaTicket, Descripcion, chatName } = user;

                        if (!chatId) continue;
                        const chatuser = getChatUserType(chatName);
                        const key = `${chatId}|${chatuser}`;

                        if (processedThisTick.has(key)) continue;
                        processedThisTick.add(key);

                        const getConv = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                        const getData = await getConv.json();
                        console.log('get', getData);
                        const existeConversacion = getData?.data?.docs?.length > 0;
                        console.log('exist: ', existeConversacion);

                        if (!existeConversacion) {
                            console.log(`Nueva conversación detectada para ${chatId}, creando...`);

                            const today = new Date().toISOString().slice(0, 10);

                            // Mensaje de inicio
                            const inicio = {
                                sender: 'Sistema',
                                message: '🟢 Inicio de conversación',
                                idMessageClient: `${chatId}-inicio-${today}`,
                                timeStamp: new Date().toISOString()
                            };

                            // Motivo
                            const descripcionText = Array.isArray(Descripcion) && Descripcion.length > 0 ? Descripcion[0] : null;
                            const descripcionExtra = Array.isArray(Descripcion) && Descripcion.length > 1 ? Descripcion[1] : null;
                            const motivoTexto = descripcionText
                                ? `📝 Motivo del contacto: ${categoriaTicket}, con la descripción: ${descripcionText}` + (descripcionExtra ? `  Detalle adicional: ${descripcionExtra}` : '')
                                : `📝 Motivo del contacto: ${categoriaTicket}`;

                            const motivo = {
                                sender: 'Sistema',
                                message: motivoTexto,
                                idMessageClient: `${chatId}-motivo-${today}`,
                                timeStamp: new Date().toISOString()
                            };

                            let real = null;
                            try {
                                const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
                                if (responseMany.ok) {
                                    const dataMany = (await responseMany.json()).cliente.data;
                                    const messageText = dataMany.last_input_text;
                                    const messageId = buildMessageId(dataMany.subscribed, messageText);
                                    if (messageText && messageId) {
                                        real = {
                                            sender: 'Cliente',
                                            message: messageText,
                                            idMessageClient: messageId,
                                            timeStamp: new Date().toISOString()
                                        };
                                    }
                                }
                            } catch (error) {
                                console.warn('No se pudo consultar ManyChat:', error.message);
                            }
                        
                            const convData = {
                                contactId: chatId,
                                usuario: { nombre: nombreClient, documento: numDocTitular },
                                chat: chatuser,
                                messages: [inicio, motivo] 
                            };

                            if (real) {
                                convData.messages.push(real);
                            }

                            const response = await fetch(`http://localhost:3001/message/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(convData),
                            });

                            if (response.ok) {
                                console.log(`✅ Conversación creada para ${chatId} con motivo`);
                            } else {
                                console.error(`❌ Error al crear conversación para ${chatId}:`, await response.text());
                            }
                        
                            continue;
                        } else {

                            const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
                            if (!responseMany.ok) throw new Error('Error al consultar Manychat');

                            const dataMany = (await responseMany.json()).cliente.data;
                            const messageText = dataMany.last_input_text;
                            const messageId = buildMessageId(dataMany.subscribed, messageText);
                            console.log('message id: ', messageId);

                            const refreshConv = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`);
                            const refreshData = await refreshConv.json();
                            const allMessages = refreshData?.data?.docs?.flatMap(doc => doc.messages || []) || [];

                            
                            const descripcionText = Array.isArray(Descripcion) && Descripcion.length > 0 ? Descripcion[0] : null;
                            const descripcionExtra = Array.isArray(Descripcion) && Descripcion.length > 1 ? Descripcion[1] : null;
                            const motivoTexto = descripcionText
                                ? `📝 Motivo del contacto: ${categoriaTicket}, con la descripción: ${descripcionText}` + (descripcionExtra ? `  Detalle adicional: ${descripcionExtra}` : '')
                                : `📝 Motivo del contacto: ${categoriaTicket}`;

                            const motivoId = `${chatId}-motivo`;

                            const motivoYaExiste = allMessages.some(m => 
                                m.idMessageClient === motivoId || m.message === motivoTexto
                            );

                            if (!motivoYaExiste) {
                                await fetch(`http://localhost:3001/message/${chatId}?chat=${chatuser}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        messages: [{
                                            sender: 'Sistema',
                                            message: motivoTexto,
                                            idMessageClient: motivoId,
                                            timeStamp: new Date().toISOString()
                                        }]
                                    })
                                });
                                console.log(`Motivo agregado a ${chatId}`);
                            }

                            const messageExists = allMessages.some(msg => msg.idMessageClient === messageId);
                            console.log('message exist: ', messageExists);
                            const notifiedKey = `${chatId}|${chatuser}`
                            const notifiedSet = notifiedMessagesRef.current.get(notifiedKey) || new Set();
                            if (!notifiedMessagesRef.current.has(notifiedKey)) {
                              notifiedMessagesRef.current.set(notifiedKey, notifiedSet);

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