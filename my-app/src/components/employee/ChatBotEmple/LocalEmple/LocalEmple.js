// LocalEmple.js
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

  // ---------- API: contactos (conversacion-server) ----------
  const fetchConversacionContacts = async () => {
    try {
      const r = await fetch('http://localhost:3001/conversacion-server?page=1&limit=500', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const j = await r.json();
      const docs = j?.data?.docs || [];
      return docs.map(d => {
        const conv = safeArray(d?.conversacion);
        const last = conv.length ? conv[conv.length - 1] : null;
        const lastSender = last?.de === 'bot' ? 'Empleado' : (last?.de ? 'Cliente' : null);
        return {
          id: d?.id || d?._id,
          nombre: d?.usuario?.nombre || 'Visitante',
          numDoc: d?.usuario?.documento || '',
          perfil: null,
          lastMessage: { message: extractMessageText(last?.mensaje) },
          lastSender
        };
      });
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

  // ---------- API: mensajes (colección message) ----------
  const ensureConversationExists = async () => {
    if (!activeContact) return;
    try {
      const res = await fetch(`http://localhost:3001/message/?contactId=${encodeURIComponent(activeContact.id)}&chat=local`);
      const result = await res.json();
      const list = result?.message || result?.data?.docs || [];
      const exists = Array.isArray(list) && list.length > 0;
      if (!exists) {
        const createRes = await fetch('http://localhost:3001/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: activeContact.id,
            usuario: { nombre: activeContact.nombre || 'Visitante' },
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
    if (!contact) return;
    try {
      const r = await fetch(`http://localhost:3001/message/?contactId=${encodeURIComponent(contact.id)}&chat=local`);
      const j = await r.json();
      const docs = j?.message || j?.data?.docs || [];
      if (!Array.isArray(docs) || docs.length === 0) { setMessages([]); return; }

      const doc = docs.find(d => d?.contactId === contact.id) || docs[0];
      const arr = safeArray(doc?.messages).map(m => ({
        ...m,
        message: extractMessageText(m.message),
        updatedAt: m.timeStamp || m.updatedAt || new Date().toISOString()
      }));
      arr.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
      setMessages(arr);

      const last = arr[arr.length - 1];
      const lastSender = last?.sender === 'Cliente' ? 'Cliente' : 'Empleado';
      setContacts(prev =>
        prev.map(c => c.id === contact.id ? { ...c, lastMessage: { message: last?.message }, lastSender } : c)
      );
      setUnreadMessages(prev => ({ ...prev, [contact.id]: false }));
    } catch (e) {
      console.error('Error obteniendo mensajes local:', e);
    }
  };

  // ---------- envío ----------
  const handleSendMessage = async () => {
    if (isSending) return;
    setIsSending(true);
    await ensureConversationExists();
    if (!currentMessage.trim() || !activeContact){
        setIsSending(false);
        return;
    } 

    const idClient = `msg_${Date.now()}-${currentMessage.length}`;
    const bodyMessage = {
      messages: [{ sender: 'Empleado', message: currentMessage, idMessageClient: idClient }]
    };
    const rawLocal = { de: 'Empleado', mensaje: currentMessage };

    try {
      // 1) conversacion-server (historial local)
      const r1 = await fetch(`http://localhost:3001/conversacion-server/${encodeURIComponent(activeContact.id)}/mensaje`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rawLocal)
      });
      if (!r1.ok) throw new Error('Error al registrar en conversacion-server');

      // 2) colección message (normalizada)
      const r2 = await fetch(`http://localhost:3001/message/${encodeURIComponent(activeContact.id)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyMessage)
      });
      if (!r2.ok) throw new Error('Error al guardar en message');

      // UI
      setMessages(prev => [...prev, { sender: 'Empleado', message: currentMessage, idMessageClient: idClient, updatedAt: new Date().toISOString() }]);
      setCurrentMessage("");
      await fetchLocalMessages(activeContact);
    } catch (e) {
      console.error('Error enviando mensaje local:', e);
    }

    finally { setIsSending(false); }
  };


  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setSelectedImage(e.target.files[0]);
  };


  const imageUploadNube = async () => {
    await ensureConversationExists();
    if (!selectedImage || !activeContact) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      const up = await fetch('http://localhost:3001/image-post-message', { method: 'POST', body: formData });
      if (!up.ok) throw new Error('Error al subir la imagen');
      const data = await up.json();
      const image = data?.data?.secure_url || '';
      if (!image) throw new Error('URL de imagen vacía');

      const idClient = `msg_imageWithText_${Date.now()}`;

      // message normalizada
      await fetch(`http://localhost:3001/message/${encodeURIComponent(activeContact.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ sender: 'Empleado', message: image, contexto: currentMessage, idMessageClient: idClient }] })
      });

      // conversacion-server
      await fetch(`http://localhost:3001/conversacion-server/${encodeURIComponent(activeContact.id)}/mensaje`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ de: 'Empleado', mensaje: image, contexto: currentMessage })
      });

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

        // asignaciones (si existieran para Chat Local)
        const resA = await fetch('http://localhost:3001/asignaciones/');
        const jA = await resA.json();
        const assigned = safeArray(jA?.data?.docs).filter(x => x.idEmple === EmpleId && x.chatName === 'ChatBotLocal')
          .map(u => ({
            id: u.chatId,
            nombre: u.nombreClient,
            lastMessage: { message: Array.isArray(u.Descripcion) ? u.Descripcion[0] : u.Descripcion },
            lastSender: 'Cliente',
            perfil: null,
            numDoc: u.numDocTitular
          }));

        // conversacion-server (base de contactos local)
        const localList = await fetchConversacionContacts();

        // merge por id (prioriza datos de conversacion-server)
        const map = new Map();
        [...localList, ...assigned].forEach(c => {
          const prev = map.get(c.id) || {};
          map.set(c.id, { ...prev, ...c });
        });
        const finalContacts = [...map.values()];
        setContacts(finalContacts);

        // enriquecer nombre/numDoc por id (opcional)
        await Promise.all(finalContacts.map(async c => {
          const extra = await fetchConversacionById(c.id);
          if (extra) {
            setContacts(prev => prev.map(x => x.id === c.id ? { ...x, nombre: extra.nombre || x.nombre, numDoc: extra.numDoc || x.numDoc } : x));
          }
          console.log('daticos del chat ', contacts)
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
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
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

  // ---------- UI (mismo diseño que MessengerEmple) ----------
  const grouped = groupMessagesByDate(messages);
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSendMessage(); };

  return (
    <>
      <div className={theme === 'light' ? 'app light' : 'app dark'}>
        <div className="slider">
          <Navbar/>
          <div className="flex">
            <SliderEmploye />
          </div>
        </div>

        <div className="BarraSuperior">
          <h1>Chat Local</h1>
          <a className="ButtonTheme1" onClick={toggleTheme}>
            <img src={theme === 'light'? ModoClaro : ModoOscuro} alt="theme"/>
          </a>
        </div>

        <div className="contentChatW">
          {/* Contactos */}
          <div className="contentContact">
            <div className="barrasuperiorContacts">
              <p>Contactos</p>
            </div>

            <div className="listContactContent">
              {contacts.length > 0 ? (
                contacts.map(contact => (
                
                  <div
                    key={contact.id}
                    className={`contactContent ${activeContact?.id === contact.id ? 'active' : ''}`}
                    onClick={async () => {
                      setMessages([]);
                      setActiveContact(contact);
                      await ensureConversationExists();
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

          {/* Chat */}
          <div className="contentChat">
            <div className="contentTitle">
              {activeContact ? (
                <>
                  <img src={activeContact.perfil || Usuario} alt="avatar" className="contactAvatar" />
                  <p>{activeContact.nombre}</p>
                </>
              ) : (
                <p>Chat Local</p>
              )}
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
                            (texto.includes('res.cloudinary.com') || texto.endsWith('.jpg') || texto.endsWith('.jpeg') || texto.endsWith('.png'));
                          const isAudio = typeof texto === 'string' && texto.includes('cdn.fbsbx.com');

                          return (
                            <div key={m.idMessageClient || `${date}-${i}`} className={`message ${m.sender === 'Empleado' ? 'sent' : 'received'}`}>
                              {isImg ? (
                                <>
                                  <img src={texto} style={{ maxWidth: '200px', borderRadius: '10px' }} alt="img" /><br/>
                                </>
                              ) : isAudio ? (
                                <>
                                  <audio controls>
                                    <source src={texto} type="audio/mpeg" />
                                  </audio>
                                  <br/>
                                </>
                              ) : (
                                <p>{texto}</p>
                              )}
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
                    onKeyPress={handleKeyPress}
                  />

                  <button onClick={handleSendMessage}>
                    <VscSend className="icon1"/>
                  </button>
                </div>
              </>
            ) : (
              <p className="nullData">Seleccione un chat para empezar a chatear</p>
            )}
          </div>

          {wisphubInfo && (
            <div className="extraPanel">
              <div className="contentTitle">
                <p>Detalles del cliente</p>
              </div>
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
