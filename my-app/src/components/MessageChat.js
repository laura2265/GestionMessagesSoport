// MessageChat.js
import { useEffect, useRef, useState } from "react";
import Notificacion from '../assets/sounds/Notificacion.mp3';

function getChatUserType(name) {
  if (name === 'ChatBotMessenger') return 'messenger';
  if (name === 'ChatBotTelegram') return 'telegram';
  if (name === 'ChatBotInstagram') return 'instagram';
  if (name === 'ChatBotLocal') return 'local';
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

// --- API helpers alineados con Message.js ---

async function apiGetConversation(contactId, chatuser) {
  const r = await fetch(
    `http://localhost:3001/message/?contactId=${encodeURIComponent(contactId)}&chat=${encodeURIComponent(chatuser || '')}`
  );
  const j = await r.json();
  // Message.js -> getDataMessageId devuelve { success, message: [docs] }
  const docs = Array.isArray(j?.message) ? j.message : [];
  // normalmente habrá 1 doc por (contactId, chat)
  return docs[0] || null;
}

async function apiPostConversation({ contactId, usuario, chat, messages }) {
  const r = await fetch(`http://localhost:3001/message/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactId, usuario, chat, messages }),
  });
  if (!r.ok) throw new Error(`POST /message/ -> ${await r.text()}`);
  return r.json(); // { success, data }
}

async function apiPushMessage(contactId, chatuser, { sender, message, idMessageClient }) {
  // Usa tu addMessageToConversation(contactId, chat) que hace $push
  const r = await fetch(
    `http://localhost:3001/message/${encodeURIComponent(contactId)}?chat=${encodeURIComponent(chatuser || '')}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ sender, message, idMessageClient }] }),
    }
  );
  if (!r.ok) throw new Error(`PUT /message/:contactId -> ${await r.text()}`);
  return r.json(); // { success, data }
}

function MessageChat() {
  const notifiedMessagesRef = useRef(new Map());      // Map<convKey, Set<messageId>>
  const audioRef = useRef(new Audio(Notificacion));
  const [notificacions, setNotificacions] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const pendienteConversacion = useRef(new Map());    // Map<convKey, payload POST>

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const EmpleId = localStorage.getItem('UserId');

        const responseEmple = await fetch(`http://localhost:3001/asignaciones/`);
        if (!responseEmple.ok) throw new Error('Error al consultar asignaciones');

        const dataEmple = (await responseEmple.json()).data.docs;
        const assignedEmple = dataEmple.filter((emple) => emple.idEmple === EmpleId);
        if (!assignedEmple.length) return;

        const newNotifications = [];

        for (let user of assignedEmple) {
          try {
            const {
              chatId,
              nombreClient,
              numDocTitular,
              categoriaTicket,
              Descripcion,
              chatName,
            } = user;
            if (!chatId) continue;

            const chatuser = getChatUserType(chatName);
            const convKey = `${chatId}|${chatuser}`;
            const today = new Date().toISOString().slice(0, 10);

            // Obtener último input del cliente desde ManyChat
            const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`);
            if (!responseMany.ok) throw new Error('Error al consultar Manychat');

            const dataMany = (await responseMany.json()).cliente.data;
            const messageText = (dataMany?.last_input_text || '').trim();
            const messageId = buildMessageId(dataMany.subscribed, messageText);

            // Omite si no hay texto (o si ManyChat no trae nada nuevo)
            if (!messageText || !messageId) continue;

            // ¿Ya existe esta conversación?
            const convDoc = await apiGetConversation(chatId, chatuser);
            const allMessages = Array.isArray(convDoc?.messages) ? convDoc.messages : [];
            const alreadyExists = allMessages.some(m => m.idMessageClient === messageId);

            // notificaciones únicas por conversación+canal
            const notifiedSet = notifiedMessagesRef.current.get(convKey) || new Set();
            if (!notifiedMessagesRef.current.has(convKey)) {
              notifiedMessagesRef.current.set(convKey, notifiedSet);
            }

            // Textos de Sistema (una vez por día)
            const descripcionText  = Array.isArray(Descripcion) && Descripcion.length > 0 ? Descripcion[0] : null;
            const descripcionExtra = Array.isArray(Descripcion) && Descripcion.length > 1 ? Descripcion[1] : null;

            const motivoTexto = descripcionText
              ? `📝 Motivo del contacto: ${categoriaTicket}, con la descripción: ${descripcionText}` +
                (descripcionExtra ? `  Detalle adicional: ${descripcionExtra}` : '')
              : `📝 Motivo del contacto: ${categoriaTicket}`;

            const sysInicio = {
              sender: 'Sistema',
              message: '🟢 Inicio de conversación',
              idMessageClient: `${chatId}-inicio-${today}`,
            };
            const sysMotivo = {
              sender: 'Sistema',
              message: motivoTexto,
              idMessageClient: `${chatId}-motivo-${today}`,
            };
            const msgCliente = {
              sender: 'Cliente',
              message: messageText,
              idMessageClient: messageId,
            };

            if (!convDoc) {
              // --- No existe: crear conversación con estructura completa ---
              if (!pendienteConversacion.current.has(convKey)) {
                const payload = {
                  contactId: chatId,
                  usuario: { nombre: nombreClient, documento: numDocTitular },
                  chat: chatuser,
                  messages: [sysInicio, sysMotivo, msgCliente],
                };
                pendienteConversacion.current.set(convKey, payload);
              }
            } else {
              // --- Existe: asegurar Sistema del día y luego push del cliente ---
              const hasInicio = allMessages.some(m => m.idMessageClient === sysInicio.idMessageClient);
              const hasMotivo = allMessages.some(m => m.idMessageClient === sysMotivo.idMessageClient);

              if (!hasInicio) await apiPushMessage(chatId, chatuser, sysInicio);
              if (!hasMotivo) await apiPushMessage(chatId, chatuser, sysMotivo);

              if (!alreadyExists && !notifiedSet.has(messageId)) {
                await apiPushMessage(chatId, chatuser, msgCliente);
                notifiedSet.add(messageId);

                newNotifications.push({
                  contactId: chatId,
                  message: messageText,
                  sender: 'Cliente',
                  chat: chatuser,
                  nombre: nombreClient,
                });
              }
            }
          } catch (error) {
            console.error(`🚫 Error procesando asignado ${user?.nombreClient || ''}:`, error.message);
          }
        }

        // Guardar conversaciones pendientes (creación inicial)
        for (const [key, convData] of pendienteConversacion.current.entries()) {
          try {
            const exists = await apiGetConversation(convData.contactId, convData.chat);
            if (exists) {
              pendienteConversacion.current.delete(key);
              continue;
            }
            const r = await apiPostConversation(convData);
            if (r?.success) {
              pendienteConversacion.current.delete(key);
            } else {
              console.warn('POST conversación sin success:', r);
            }
          } catch (e) {
            console.error(`❌ Fallo al guardar conversación (${convData.contactId}):`, e.message);
          }
        }

        // Notificaciones y audio
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
