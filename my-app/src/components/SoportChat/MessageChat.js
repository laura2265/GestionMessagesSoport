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

// ---- Normalizadores de descripción (asignaciones) ----
const _toText = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return (v.text ?? v.texto ?? v.message ?? v.mensaje ?? JSON.stringify(v));
  return String(v);
};

const _hasLeadingEmoji = (s) => /^[🗂📌📡💡🔌⚙️📝📶🛰️🌐🐢🛠️🔒📊📣🆘]/.test(s || '');

function normalizeDescripcion(desc) {
  // Siempre a array plano de strings “limpios”
  const items = Array.isArray(desc) ? desc.flat() : [desc];
  return items
    .map(_toText)
    .map(s => (s || '').replace(/\s+/g, ' ').trim())
    .filter(s => s && s.toLowerCase() !== 'null' && s !== '-');
}

function buildMotivoFromAsignacion(asignado, opts = {}) {
  const { Descripcion, categoriaTicket, nombreClient, numDocTitular } = asignado || {};
  const { multiline = true, incluirIdentidad = true } = opts;

  const lines = normalizeDescripcion(Descripcion);
  const titulo =
    `📝 Motivo del contacto${categoriaTicket ? ` (${categoriaTicket})` : ''}` +
    (incluirIdentidad && (nombreClient || numDocTitular)
      ? ` — Cliente: ${nombreClient || 'N/D'}${numDocTitular ? ` — Doc: ${numDocTitular}` : ''}`
      : '');

  if (lines.length === 0) return titulo;

  // Si ya vienen con emojis/etiquetas, respétalas; si no, etiquetamos.
  const yaEtiquetado = lines.some(_hasLeadingEmoji);
  const cuerpo = yaEtiquetado
    ? lines
    : lines.map((s, i) => {
        if (i === 0) return `🗂 Motivo: ${s}`;
        if (i === 1) return `📌 Detalle: ${s}`;
        return `📝 Aporte ${i - 1}: ${s}`;
      });

  if (multiline) {
    return [titulo, '', ...cuerpo].join('\n'); // multilínea bonito
  } else {
    return `${titulo}: ${cuerpo.join(' · ')}`; // compacto en una sola línea
  }
}



function buildMessageIdFromManychat(subscribed, messageText) {
  if (!messageText) return null;
  const isImage = messageText.includes('scontent.xx.fbcdn.net');
  const isAudio = messageText.includes('cdn.fbsbx.com');
  return isImage || isAudio
    ? `${subscribed}-${messageText.split('/').pop().split('?')[0]}`
    : `${subscribed}-${messageText.slice(-10)}`;
}

async function apiGetMessageConv(contactId, chatuser) {
  const r = await fetch(
    `http://localhost:3001/message/?contactId=${encodeURIComponent(contactId)}&chat=${encodeURIComponent(chatuser || '')}`
  );
  const j = await r.json();
  const docs = Array.isArray(j?.message) ? j.message : [];
  return docs[0] || null;
}

async function apiPostMessageConv({ contactId, usuario, chat, messages }) {
  const r = await fetch(`http://localhost:3001/message/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactId, usuario, chat, messages }),
  });
  if (!r.ok) throw new Error(`POST /message/ -> ${await r.text()}`);
  return r.json();
}

async function apiPushMessage(contactId, chatuser, { sender, message, idMessageClient }) {
  const r = await fetch(
    `http://localhost:3001/message/${encodeURIComponent(contactId)}?chat=${encodeURIComponent(chatuser || '')}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ sender, message, idMessageClient }] }),
    }
  );
  if (!r.ok) throw new Error(`PUT /message/:contactId -> ${await r.text()}`);
  return r.json();
}
async function apiLocalList() {
  const r = await fetch(`http://localhost:3001/conversacion-server?page=1&limit=1000`);
  if (!r.ok) throw new Error(`GET /conversacion-server -> ${await r.text()}`);
  const j = await r.json();
  return j?.data?.docs || [];
}

async function apiLocalGet(id) {
  const r = await fetch(`http://localhost:3001/conversacion-server/${encodeURIComponent(id)}`);
  if (r.status === 404) return null;
  const j = await r.json();
  return j?.data || j || null;
}

async function apiLocalCreate({ id, usuario }) {
  const r = await fetch('http://localhost:3001/conversacion-server', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      usuario,
      fechaInicio: new Date().toISOString()
    })
  });
  if (!r.ok) throw new Error(`POST /conversacion-server -> ${await r.text()}`);
  return r.json();
}

async function apiLocalPushMsg(id, { de, mensaje }) {
  const r = await fetch(`http://localhost:3001/conversacion-server/${encodeURIComponent(id)}/mensaje`, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ de, mensaje })
  });
  if (!r.ok) throw new Error(`PUT /conversacion-server/:id/mensaje -> ${await r.text()}`);
  return r.json();
}

/* =========================
   Utilidades
   ========================= */
const norm = (s) => (s || '').toString().trim().toLowerCase();

function resolveLocalDoc({ listDocs, documento, nombre }) {
  let candidatas = listDocs || [];

  if (documento) {
    const hit = candidatas.find(d => norm(d?.usuario?.documento) === norm(documento));
    if (hit) return hit;
  }
  if (nombre) {
    const matches = candidatas.filter(d => norm(d?.usuario?.nombre) === norm(nombre));
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      matches.sort((a,b) => new Date(b?.fechaUltimoMensaje || 0) - new Date(a?.fechaUltimoMensaje || 0));
      return matches[0];
    }
  }
  candidatas.sort((a,b) => new Date(b?.fechaUltimoMensaje || 0) - new Date(a?.fechaUltimoMensaje || 0));
  return candidatas[0] || null;
}

function extractLocalUserLast(conversacion = []) {
  for (let i = conversacion.length - 1; i >= 0; i--) {
    const it = conversacion[i];
    if (it?.de === 'usuario') return it;
  }
  return null;
}

/* =========================
   NEW: intento ManyChat y Fallback Local
   ========================= */
async function tryManychat(chatId) {
  try {
    const r = await fetch(`http://localhost:3001/manychat/${chatId}`);
    if (!r.ok) return null;
    const data = (await r.json())?.cliente?.data || {};
    const messageText = (data?.last_input_text || '').trim();
    const messageId = buildMessageIdFromManychat(data.subscribed, messageText);
    if (!messageText || !messageId) return null;
    return { messageText, messageId };
  } catch {
    return null;
  }
}

function MessageChat() {
  const notifiedMessagesRef = useRef(new Map()); 
  const audioRef = useRef(new Audio(Notificacion));
  const [notificacions, setNotificacions] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const pendienteConversacion = useRef(new Map());

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const EmpleId = localStorage.getItem('UserId');

        // asignaciones
        const responseEmple = await fetch(`http://localhost:3001/asignaciones/`);
        if (!responseEmple.ok) throw new Error('Error al consultar asignaciones');

        const dataEmple = (await responseEmple.json()).data?.docs || [];
        const assignedEmple = dataEmple.filter((emple) => emple.idEmple === EmpleId);
        if (!assignedEmple.length) return;

        // listado local (para resolver por doc/nombre si hace falta)
        let localDocs = [];
        try { localDocs = await apiLocalList(); } catch (e) { console.warn('No se pudo listar conversacion-server:', e.message); }

        const newNotifications = [];
        const today = new Date().toISOString().slice(0, 10);

        for (let user of assignedEmple) {
          const {
            chatId, nombreClient, numDocTitular,
            categoriaTicket, Descripcion, chatName,
          } = user || {};

          const chatuser = getChatUserType(chatName);
         
          const desc0  = Array.isArray(Descripcion) && Descripcion.length > 0 ? Descripcion[0] : null;
          const desc1  = Array.isArray(Descripcion) && Descripcion.length > 1 ? Descripcion[1] : null;
          const motivo = desc0
            ? `📝 Motivo del contacto: ${categoriaTicket || 'N/A'}, con la descripción: ${desc0}` + (desc1 ? `  Detalle adicional: ${desc1}` : '')
            : `📝 Motivo del contacto: ${categoriaTicket || 'N/A'}`;


          if (chatuser !== 'local') {
            const convKeyExt = `${chatId}|${chatuser}`;
            const notifiedSetExt = notifiedMessagesRef.current.get(convKeyExt) || new Set();
            if (!notifiedMessagesRef.current.has(convKeyExt)) {
              notifiedMessagesRef.current.set(convKeyExt, notifiedSetExt);
            }

            const many = await tryManychat(chatId);

            if (many) {
              const { messageText, messageId } = many;
              const convDoc = await apiGetMessageConv(chatId, chatuser);
              const all = Array.isArray(convDoc?.messages) ? convDoc.messages : [];
              const exists = all.some(m => m.idMessageClient === messageId);

              const sysInicio = { sender: 'Sistema', message: '🟢 Inicio de conversación', idMessageClient: `${chatId}-inicio-${today}` };
              const sysMotivo = { sender: 'Sistema', message: motivo, idMessageClient: `${chatId}-motivo-${today}` };
              const msgCliente = { sender: 'Cliente', message: messageText, idMessageClient: messageId };

              if (!convDoc) {
                if (!pendienteConversacion.current.has(convKeyExt)) {
                  pendienteConversacion.current.set(convKeyExt, {
                    contactId: chatId,
                    usuario: { nombre: nombreClient, documento: numDocTitular },
                    chat: chatuser,
                    messages: [sysInicio, sysMotivo, msgCliente],
                  });
                }
              } else {
                const hasI = all.some(m => m.idMessageClient === sysInicio.idMessageClient);
                const hasM = all.some(m => m.idMessageClient === sysMotivo.idMessageClient);
                if (!hasI) await apiPushMessage(chatId, chatuser, sysInicio);
                if (!hasM) await apiPushMessage(chatId, chatuser, sysMotivo);

                if (!exists && !notifiedSetExt.has(messageId)) {
                  await apiPushMessage(chatId, chatuser, msgCliente);
                  notifiedSetExt.add(messageId);
                  newNotifications.push({ contactId: chatId, message: messageText, sender: 'Cliente', chat: chatuser, nombre: nombreClient });
                }
              }
              // listo con externo
              continue;
            }

            // 2) Fallback a LOCAL (Mongo) si ManyChat no trae nada
            //    Resuelve doc por documento o nombre
            try {
              let localDoc = resolveLocalDoc({
                listDocs: localDocs,
                documento: numDocTitular,
                nombre: nombreClient
              });

              // si no existe, crear uno nuevo
              if (!localDoc) {
                const nuevoId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                await apiLocalCreate({
                  id: nuevoId,
                  usuario: {
                    nombre: nombreClient || 'Visitante',
                    email: '',
                    documento: numDocTitular || '',
                    navegador: (typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'),
                    ip: ''
                  }
                });
                localDoc = await apiLocalGet(nuevoId);
                localDocs = await apiLocalList();
              }

              const localId = localDoc?.id || localDoc?._id;
              if (!localId) continue;

              const convKeyLocal = `${localId}|local`;
              const notifiedSetLocal = notifiedMessagesRef.current.get(convKeyLocal) || new Set();
              if (!notifiedMessagesRef.current.has(convKeyLocal)) {
                notifiedMessagesRef.current.set(convKeyLocal, notifiedSetLocal);
              }

              const conversacion = Array.isArray(localDoc?.conversacion) ? localDoc.conversacion : [];

              // sistema en conversacion-server
              const hasInicio = conversacion.some(x => x?.mensaje === '🟢 Inicio de conversación');
              const hasMotivo = conversacion.some(x => typeof x?.mensaje === 'string' && x.mensaje.startsWith('📝 Motivo del contacto:'));
              if (!hasInicio) await apiLocalPushMsg(localId, { de: 'bot', mensaje: '🟢 Inicio de conversación' });
              if (!hasMotivo) await apiLocalPushMsg(localId, { de: 'bot', mensaje: motivo });

              // último mensaje del usuario
              const lastUser = extractLocalUserLast(conversacion);
              // si no hay texto aún del usuario, igual aseguramos conversación en "message" con solo sistema
              const messageTextLocal =
                (typeof lastUser?.mensaje === 'string') ? lastUser.mensaje.trim()
                : (lastUser?.mensaje?.text || lastUser?.mensaje?.texto || lastUser?.mensaje?.url || '');

              const messageIdLocal = lastUser?._id ? `local-${lastUser._id}` : null;

              // sincroniza a "message" (contactId = localId, chat = 'local')
              const convDoc = await apiGetMessageConv(localId, 'local');
              const all = Array.isArray(convDoc?.messages) ? convDoc.messages : [];

              const sysInicio = { sender: 'Sistema', message: '🟢 Inicio de conversación', idMessageClient: `${localId}-inicio-${today}` };
              const sysMotivo = { sender: 'Sistema', message: motivo, idMessageClient: `${localId}-motivo-${today}` };

              if (!convDoc) {
                const base = [sysInicio, sysMotivo];
                if (messageTextLocal && messageIdLocal) base.push({ sender: 'Cliente', message: messageTextLocal, idMessageClient: messageIdLocal });
                if (!pendienteConversacion.current.has(convKeyLocal)) {
                  pendienteConversacion.current.set(convKeyLocal, {
                    contactId: localId,
                    usuario: { nombre: localDoc?.usuario?.nombre || nombreClient || 'Visitante', documento: localDoc?.usuario?.documento || numDocTitular || '' },
                    chat: 'local',
                    messages: base,
                  });
                }
              } else {
                const hasI = all.some(m => m.idMessageClient === sysInicio.idMessageClient);
                const hasM = all.some(m => m.idMessageClient === sysMotivo.idMessageClient);
                if (!hasI) await apiPushMessage(localId, 'local', sysInicio);
                if (!hasM) await apiPushMessage(localId, 'local', sysMotivo);

                if (messageTextLocal && messageIdLocal) {
                  const exists = all.some(m => m.idMessageClient === messageIdLocal);
                  if (!exists && !notifiedSetLocal.has(messageIdLocal)) {
                    await apiPushMessage(localId, 'local', { sender: 'Cliente', message: messageTextLocal, idMessageClient: messageIdLocal });
                    notifiedSetLocal.add(messageIdLocal);
                    newNotifications.push({ contactId: localId, message: messageTextLocal, sender: 'Cliente', chat: 'local', nombre: localDoc?.usuario?.nombre || nombreClient });
                  }
                }
              }
            } catch (err) {
              console.error('⚠️ Fallback Local falló:', err.message);
            }

            continue; 
          }
          try {
            let localDoc = resolveLocalDoc({
              listDocs: localDocs,
              documento: numDocTitular,
              nombre: nombreClient,
            });

            if (!localDoc) {
              const nuevoId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
              await apiLocalCreate({
                id: nuevoId,
                usuario: {
                  nombre: nombreClient || 'Visitante',
                  email: '',
                  documento: numDocTitular || '',
                  navegador: (typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'),
                  ip: ''
                }
              });
              localDoc = await apiLocalGet(nuevoId);
              localDocs = await apiLocalList();
            }

            const localId = localDoc?.id || localDoc?._id;
            if (!localId) continue;

            const convKey = `${localId}|local`;
            const notifiedSet = notifiedMessagesRef.current.get(convKey) || new Set();
            if (!notifiedMessagesRef.current.has(convKey)) {
              notifiedMessagesRef.current.set(convKey, notifiedSet);
            }

            // Textos de Sistema (una vez por día)
            const conversacion = Array.isArray(localDoc?.conversacion) ? localDoc.conversacion : [];
            const hasInicio = conversacion.some(x => x?.mensaje === '🟢 Inicio de conversación');
            const hasMotivo = conversacion.some(x => typeof x?.mensaje === 'string' && x.mensaje.startsWith('📝 Motivo del contacto:'));
            if (!hasInicio) await apiLocalPushMsg(localId, { de: 'bot', mensaje: '🟢 Inicio de conversación' });
            if (!hasMotivo) await apiLocalPushMsg(localId, { de: 'bot', mensaje: motivo });

            const lastClient = extractLocalUserLast(conversacion);
            const messageTextLocal =
              (typeof lastClient?.mensaje === 'string') ? lastClient.mensaje.trim()
              : (lastClient?.mensaje?.text || lastClient?.mensaje?.texto || lastClient?.mensaje?.url || '');
            const messageIdLocal = lastClient?._id ? `local-${lastClient._id}` : null;

            const convDoc = await apiGetMessageConv(localId, 'local');
            const all = Array.isArray(convDoc?.messages) ? convDoc.messages : [];
            const sysInicio = { sender: 'Sistema', message: '🟢 Inicio de conversación', idMessageClient: `${localId}-inicio-${today}` };
            const sysMotivo = { sender: 'Sistema', message: motivo, idMessageClient: `${localId}-motivo-${today}` };

            if (!convDoc) {
              const base = [sysInicio, sysMotivo];
              if (messageTextLocal && messageIdLocal) base.push({ sender: 'Cliente', message: messageTextLocal, idMessageClient: messageIdLocal });
              if (!pendienteConversacion.current.has(convKey)) {
                pendienteConversacion.current.set(convKey, {
                  contactId: localId,
                  usuario: { nombre: localDoc?.usuario?.nombre || nombreClient || 'Visitante', documento: localDoc?.usuario?.documento || numDocTitular || '' },
                  chat: 'local',
                  messages: base,
                });
              }
            } else {
              const hasI = all.some(m => m.idMessageClient === sysInicio.idMessageClient);
              const hasM = all.some(m => m.idMessageClient === sysMotivo.idMessageClient);
              if (!hasI) await apiPushMessage(localId, 'local', sysInicio);
              if (!hasM) await apiPushMessage(localId, 'local', sysMotivo);

              if (messageTextLocal && messageIdLocal) {
                const exists = all.some(m => m.idMessageClient === messageIdLocal);
                if (!exists && !notifiedSet.has(messageIdLocal)) {
                  await apiPushMessage(localId, 'local', { sender: 'Cliente', message: messageTextLocal, idMessageClient: messageIdLocal });
                  notifiedSet.add(messageIdLocal);
                  newNotifications.push({ contactId: localId, message: messageTextLocal, sender: 'Cliente', chat: 'local', nombre: localDoc?.usuario?.nombre || nombreClient });
                }
              }
            }
          }catch (err) {
            console.error('🚫 Error canal local:', err.message);
          }
        } // for user
        // guardar pendientes (creación inicial en "message")
        for (const [key, convData] of pendienteConversacion.current.entries()) {
          try {
            const exists = await apiGetMessageConv(convData.contactId, convData.chat);
            if (exists) { pendienteConversacion.current.delete(key); continue; }
            const r = await apiPostMessageConv(convData);
            if (r?.success) {
              pendienteConversacion.current.delete(key);
            } else {
              console.warn('POST conversación (message) sin success:', r);
            }
          } catch (e) {
            console.error(`❌ Fallo al guardar conversación (message:${convData.contactId}):`, e.message);
          }
        }

        // notificaciones + sonido
        if (newNotifications.length > 0) {
          setNotificacions(prev => [...prev, ...newNotifications]);
          if (audioEnabled) {
            audioRef.current.play().catch(err => console.warn("🔇 No se pudo reproducir el sonido:", err));
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
        const isImage = typeof notif.message === 'string' && (notif.message.includes('http://') || notif.message.includes('https://')) && (notif.message.endsWith('.jpg') || notif.message.endsWith('.jpeg') || notif.message.endsWith('.png'));
        const isAudio = typeof notif.message === 'string' && notif.message.includes('cdn.fbsbx.com');

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