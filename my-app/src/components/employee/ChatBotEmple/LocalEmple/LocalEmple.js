import { useContext, useEffect, useRef, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderEmploye from "../../../navbar/SliderEmploye";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';
import Usuario from '../../../../assets/img/usuario.png';
import { VscSend } from "react-icons/vsc";
import '../WhatsappEmple/whatsappEmple.css';
import { CiImageOn } from "react-icons/ci";

// CAMBIO: función para normalizar cualquier tipo de payload a texto plano
function normalizeMessagePayload(payload) {
  if (payload == null) return '';
  if (typeof payload === 'string') return payload.trim();
  if (typeof payload === 'object') {
    if (payload.text) return String(payload.text).trim();
    if (payload.texto) return String(payload.texto).trim();
    if (payload.message) return String(payload.message).trim();
    if (payload.mensaje) return String(payload.mensaje).trim();
  }
  return String(payload).trim();
}

function LocalEmple (){
  const {theme, toggleTheme} = useContext(ThemeContext);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [wisphubInfo, setWisphubInfo] = useState(null);

  const safeArray = (v) => Array.isArray(v) ? v : [];
  const prefer = (...opts) => opts.find(x => x !== undefined && x !== null);

  const keyId = v => String(v ?? '').trim();
  const uniqById = (arr = []) => Array.from(new Map(arr.map(x => [keyId(x.id), x])).values());

  const extractMessageText = (raw) => {
    if (raw == null) return '';
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object') {
      return prefer(raw.texto, raw.text, raw.url, JSON.stringify(raw));
    }
    return String(raw);
  };

  const groupMessagesByDate = (arr) =>
    (arr || []).reduce((acc, m) => {
      const key = new Date(m.timeStamp || m.updatedAt || Date.now()).toLocaleDateString('es-ES');
      (acc[key] ||= []).push(m);
      return acc;
    }, {});

  // ---------- API conversacion-server ----------
  async function postConversacion(contact) {
    const payload = {
      id: contact.id,
      usuario: {
        nombre: contact.nombre || 'Visitante',
        email: '',
        documento: contact.numDoc || '',
        navegador: navigator.userAgent,
        ip: ''
      },
      fechaInicio: new Date().toISOString()
    };
    await fetch('http://localhost:3001/conversacion-server', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  async function putConversacionMensaje(contact, texto) {
    const cleanText = normalizeMessagePayload(texto);
    return fetch(`http://localhost:3001/conversacion-server/${encodeURIComponent(contact.id)}/mensaje`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        de: 'Empleado',
        mensaje: { text: cleanText }
      })
    });
  }


  const fetchConversacionContacts = async () => {
    try {
      const r = await fetch('http://localhost:3001/conversacion-server?page=1&limit=500', {
        method: 'GET', headers: { 'Content-Type': 'application/json' }
      });
      const j = await r.json();
      const docs = j?.data?.docs || [];
      const mapped = docs.map(d => {
        const conv = safeArray(d?.conversacion);
        const last = conv.length ? conv[conv.length - 1] : null;
        const lastSender =
          last?.de === 'bot' ? 'Empleado' :
          last?.de === 'Empleado' ? 'Empleado' :
          last?.de ? 'Cliente' : null;

        return {
          id: d?.id || d?._id,
          nombre: d?.usuario?.nombre || 'Visitante',
          numDoc: d?.usuario?.documento || '',
          perfil: null,
          lastMessage: { message: extractMessageText(last?.mensaje) },
          lastSender
        };
      });
      return uniqById(mapped);              // <<— DEDUPE AQUÍ
    } catch (e) {
      console.error('Error listando conversacion-server:', e);
      return [];
    }
  };


  const fetchConversacionById = async (id) => {
    try {
      const r = await fetch(`http://localhost:3001/conversacion-server/${encodeURIComponent(id)}`);
      const j = await r.json();
      const d = j?.data || j || {};
      return {
        id,
        nombre: d?.usuario?.nombre || 'Visitante',
        numDoc: d?.usuario?.documento || '',
        estado: d?.estado || d?.estadoActual || 'Activo',
        perfil: null
      };
    } catch (e) {
      console.error('Error consultando conversacion-server/:id', e);
      return null;
    }
  };

  // ---------- API mensajes ----------
  const ensureConversationExists = async (contact) => {
    if (!contact?.id) return;
    try {
      const res = await fetch(`http://localhost:3001/message/?contactId=${encodeURIComponent(contact.id)}&chat=local`);
      const j = await res.json();
      const list = Array.isArray(j?.message)
        ? j.message
        : Array.isArray(j?.data?.docs)
        ? j.data.docs
        : j?.message
        ? [j.message]
        : j?.data
        ? [j.data]
        : [];
      const exists = list.some(d => d?.contactId === contact.id && (d?.chat === 'local' || !d?.chat));
      if (!exists) {
        const createRes = await fetch('http://localhost:3001/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: contact.id,
            usuario: { nombre: contact.nombre || 'Visitante' },
            chat: 'local',
            messages: []
          })
        });
        if (!createRes.ok) throw new Error('No se pudo crear la conversación (local)');
      }
    } catch (e) {
      console.error('ensureConversationExists error:', e);
    }
  };

  const fetchLocalMessages = async (contact) => {
    const c = contact || activeContact;
    if (!c?.id) return;
    try {
      const r = await fetch(`http://localhost:3001/message/?contactId=${encodeURIComponent(c.id)}&chat=local`);
      const j = await r.json();
      const docs = Array.isArray(j?.data?.docs) ? j.data.docs : [];
      if (!docs.length) { setMessages([]); return; }

      const doc = docs.find(d => d?.contactId === c.id && (d?.chat === 'local' || !d?.chat)) || docs[0];
      const arr = safeArray(doc?.messages).map(m => ({
        ...m,
        message: extractMessageText(m.message),
        updatedAt: m.timeStamp || m.updatedAt || new Date().toISOString()
      }));
      arr.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
      setMessages(arr);
    } catch (e) {
      console.error('Error obteniendo mensajes local:', e);
    }
  };

  const handleSendMessage = async () => {
    if (isSending) return;
    if (!currentMessage.trim() || !activeContact) return;

    setIsSending(true);
    try {
      await ensureConversationExists(activeContact);

      const idClient = `msg_${Date.now()}-${currentMessage.length}`;
      const texto = normalizeMessagePayload(currentMessage);

      let r1 = await putConversacionMensaje(activeContact, texto);
      if (!r1.ok) {
        if (r1.status === 404) {
          alert('Este chat aún no tiene conversación iniciada por el cliente o no está asignado a ti.');
          return;
        }
        throw new Error('Error al registrar en conversacion-server');
      }
      const r2 = await fetch(`http://localhost:3001/message/${encodeURIComponent(activeContact.id)}?chat=local`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ sender: 'Empleado', message: texto, idMessageClient: idClient }]
        })
      });
      if (!r2.ok) throw new Error('Error al guardar en message');

      setMessages(prev => [...prev, {
        sender: 'Empleado', message: texto, idMessageClient: idClient,
        updatedAt: new Date().toISOString()
      }]);
      setCurrentMessage("");
      await fetchLocalMessages(activeContact);
    } catch (e) {
      console.error('Error enviando mensaje local:', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e) => { if (e.target.files?.[0]) setSelectedImage(e.target.files[0]); };

  const imageUploadNube = async () => {
    const c = activeContact;
    if (!selectedImage || !c?.id) return;

    try {
      await ensureConversationExists(c);

      const formData = new FormData();
      formData.append('file', selectedImage);
      const up = await fetch('http://localhost:3001/image-post-message', { method: 'POST', body: formData });
      if (!up.ok) throw new Error('Error al subir la imagen');
      const data = await up.json();
      const image = data?.data?.secure_url || '';
      if (!image) throw new Error('URL de imagen vacía');

      const idClient = `msg_imageWithText_${Date.now()}`;

      await fetch(`http://localhost:3001/message/${encodeURIComponent(c.id)}?chat=local`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ sender: 'Empleado', message: image, contexto: currentMessage, idMessageClient: idClient }] })
      });

      let r = await putConversacionMensaje(c, image);
      if (r.status === 404) { await postConversacion(c); await putConversacionMensaje(c, image); }

      setMessages(prev => [...prev, { sender: 'Empleado', message: image, contexto: currentMessage, idMessageClient: idClient, updatedAt: new Date().toISOString() }]);
      setSelectedImage(null);
      setCurrentMessage("");
    } catch (e) {
      console.error('Error enviando imagen local:', e);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('UserId');
    const rolUser = localStorage.getItem('rol-user');
    setIsLoggedIn(Boolean(userId && rolUser));
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const EmpleId = localStorage.getItem('UserId');

        const resA = await fetch('http://localhost:3001/asignaciones/');
        const jA = await resA.json();
        const assigned = safeArray(jA?.data?.docs)
          .filter(x => x.idEmple === EmpleId && x.chatName === 'ChatBotLocal')
          .map(u => ({
            id: u.chatId,
            nombre: u.nombreClient,
            lastMessage: { message: Array.isArray(u.Descripcion) ? u.Descripcion[0] : u.Descripcion },
            lastSender: 'Cliente',
            perfil: null,
            numDoc: u.numDocTitular
          }));

        const assignedIds = new Set(assigned.map(a => a.id));
        const allLocal = await fetchConversacionContacts();            // trae todas…
        const localOnlyAssigned = allLocal.filter(c => assignedIds.has(c.id)); // …filtramos aquí

        const finalContacts = uniqById(
          assigned.map(a => ({ 
            ...a, 
            ...(localOnlyAssigned.find(l => l.id === a.id) || {}) 
          }))
        );

        setContacts(finalContacts);

        // 4) Completa datos faltantes por id (nombre/numDoc) — opcional
        await Promise.all(finalContacts.map(async c => {
          const extra = await fetchConversacionById(c.id);
          if (extra) {
            setContacts(prev => prev.map(x => x.id === c.id
              ? { ...x, nombre: extra.nombre || x.nombre, numDoc: extra.numDoc || x.numDoc }
              : x
            ));
          }
        }));
      } catch (e) {
        console.error('Error cargando contactos Local:', e);
        setContacts([]);
      }
    };
    fetchContacts();
  }, []);


  useEffect(() => {
    if (!activeContact) return;
    const updateMessages = async () => { await fetchLocalMessages(activeContact); };

    const fetchWisphubInfo = async () => {
      if (!activeContact?.numDoc) return;
      try {
        const r = await fetch(`http://localhost:3001/wisphub-data/${encodeURIComponent(activeContact.numDoc)}/`, {
          method: 'GET', headers: { 'Content-Type': 'application/json' }
        });
        const data = await r.json();
        const client = data?.data[0];
        if (client) {
          const detallesClient = {
            nombreUser: client.nombre,
            documento: client.cedula,
            email: client.email,
            direccion: client.direccion,
            estado: client.estado,
            estado_factura: client.estado_facturas,
            fechaCort: client.fecha_corte,
            fechaInsta: client.fecha_instalacion,
            localidad: client.localidad,
            plan: client?.plan_internet?.nombre,
            precio: client?.precio_plan,
            Zona: client?.zona?.nombre,
            telefono: client.telefono
          };
          setWisphubInfo(detallesClient);
        }
      } catch (e) {
        console.error('Error consultando wisphub (local):', e);
      }
    };

    fetchWisphubInfo();
    updateMessages();
    const id = setInterval(updateMessages, 5000);
    return () => clearInterval(id);
  }, [activeContact]);

  // ---------- UI ----------
  const grouped = groupMessagesByDate(messages);
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSendMessage(); };

  return (
    <>
      <div className={theme === 'light' ? 'app light' : 'app dark'}>
        <div className="slider">
          <Navbar/>
          <div className="flex"><SliderEmploye /></div>
        </div>

        <div className="BarraSuperior">
          <h1>Chat Local</h1>
          <a className="ButtonTheme1" onClick={toggleTheme}>
            <img src={theme === 'light'? ModoClaro : ModoOscuro} alt="theme"/>
          </a>
        </div>

        <div className="contentChatW">
          <div className="contentContact">
            <div className="barrasuperiorContacts"><p>Contactos</p></div>
            <div className="listContactContent">
              {contacts.length > 0 ? (
                contacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`contactContent ${activeContact?.id === contact.id ? 'active' : ''}`}
                    onClick={async () => {
                      setMessages([]);
                      setActiveContact(contact);
                      // NO llames ensureConversationExists aquí — solo cargamos si ya existe el doc en /message
                      await fetchLocalMessages(contact);
                      setUnreadMessages(prev => ({ ...prev, [contact.id]: false }));
                    }}

                  >
                    <img src={contact.perfil || Usuario} alt="perfil"/>
                    <div className="contact-in2fo">
                      <p>{contact.nombre}</p>
                      <p className="lastMessage">
                        {contact.lastSender ? `${contact.lastSender}: ` : ''}
                        {(() => {
                          const lm = contact?.lastMessage?.message || '';
                          if (!lm) return '';
                          const isImg = typeof lm === 'string' && (lm.includes('res.cloudinary.com') || lm.includes('.jpg') || lm.includes('.png'));
                          const isAudio = typeof lm === 'string' && lm.includes('cdn.fbsbx.com');
                          return isImg ? '🖼️ Imagen enviada' : (isAudio ? '🔊 Audio' : lm);
                        })()}
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

          <div className="contentChat">
            <div className="contentTitle">
              {activeContact ? (
                <>
                  <img src={activeContact.perfil || Usuario} alt="avatar" className="contactAvatar" />
                  <p>{activeContact.nombre}</p>
                </>
              ) : <p>Chat Local</p>}
            </div>

            {activeContact ? (
              <>
                <div className="messageContainer">
                  {messages.length > 0 ? (
                    Object.entries(grouped).map(([date, msgs]) => (
                      <div key={date}>
                        <p className="date-label">{date}</p>
                        {msgs.map((m, i) => {
                          const texto = extractMessageText(m.message);
                          const isImg = typeof texto === 'string' &&
                            (texto.includes('res.cloudinary.com') || /\.(jpg|jpeg|png)$/i.test(texto));
                          const isAudio = typeof texto === 'string' && texto.includes('cdn.fbsbx.com');

                          return (
                            <div key={m.idMessageClient || `${date}-${i}`} className={`message ${m.sender === 'Empleado' ? 'sent' : 'received'}`}>
                              {isImg ? (<><img src={texto} style={{ maxWidth: '200px', borderRadius: '10px' }} alt="img" /><br/></>) :
                               isAudio ? (<><audio controls><source src={texto} type="audio/mpeg" /></audio><br/></>) :
                               (<p>{texto}</p>)}
                              <span className="timestamp">
                                {new Date(m.timeStamp || m.updatedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <p className="nullData">No hay mensajes disponibles.</p>
                  )}
                </div>

                <div className="contenttextMessage">
                  <div className="fileContent">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
                    <CiImageOn className="icon" onClick={() => fileInputRef.current.click()} />
                    {selectedImage && (
                      <button onClick={imageUploadNube} className="send-image-button">Enviar Imagen</button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Escribir..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage}><VscSend className="icon1"/></button>
                </div>
              </>
            ) : (
              <p className="nullData">Seleccione un chat para empezar a chatear</p>
            )}
          </div>

          {wisphubInfo && (
            <div className="extraPanel">
              <div className="contentTitle"><p>Detalles del cliente</p></div>
              <div className="ContentInfoWisphub">
                <p><strong>Nombre: </strong> {wisphubInfo.nombreUser}</p>
                <p><strong>Documento: </strong> {wisphubInfo.documento || 'No disponible'}</p>
                <p><strong>Correo: </strong> {wisphubInfo.email || 'No disponible'}</p>
                <p><strong>Telefono: </strong> {wisphubInfo.telefono || 'No disponible'}</p>
                <p><strong>Dirección: </strong> {wisphubInfo.direccion || 'No disponible'}</p>
                <p><strong>Plan: </strong> {wisphubInfo.plan || 'No disponible'}</p>
                <p><strong>Precio: </strong> {wisphubInfo.precio || 'No disponible'}</p>
                <p><strong>Localidad: </strong> {wisphubInfo.localidad || 'No disponible'}</p>
                <p><strong>Fecha Instalacion: </strong> {wisphubInfo.fechaInsta || 'No disponible'}</p>
                <p><strong>Fecha Corte: </strong> {wisphubInfo.fechaCort || 'No disponible'}</p>
                <p><strong>Estado De Facturas: </strong> {wisphubInfo.estado_factura || 'No disponible'}</p>
                <p><strong>Zona: </strong> {wisphubInfo.Zona || 'No disponible'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
export default LocalEmple;
