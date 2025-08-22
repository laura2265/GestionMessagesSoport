import { useContext, useEffect, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderDashboard from "../../../navbar/SliderDashboard";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';
import { useRef } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { Console } from "console";

function ReportHistoryMessage(){
    const {theme, toggleTheme} = useContext(ThemeContext);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const iframeRef = useRef(null);
    const chartRef = useRef(null);
    const [empleAsociado, setEmpleAsociado] = useState([]);

    //datos de la api de google
    const [data, setData] = useState([]);
    const [messageStats, setMessageStats] = useState({});
    const [chatStats, setChatStats] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3001/api')
            .then(async response => {
                if (!response.ok) throw new Error('Error al consultar los datos de esta API');
                const result = await response.json();
                console.log("Datos obtenidos de la API:", result);
                setData(result);

                const messageCount = result.reduce((acc, item) => {
                    acc[item.message] = (acc[item.message] || 0) + 1;
                    return acc;
                }, {});

                const chatCount = result.reduce((acc, item) => {
                    acc[item.chat] = (acc[item.chat] || 0) + 1;
                    return acc;
                }, {});

                const totalMessages = result.length;
                setMessageStats(Object.fromEntries(
                    Object.entries(messageCount).map(([message, count]) => [message, (count / totalMessages * 100).toFixed(1)])
                ));

                setChatStats(Object.fromEntries(
                    Object.entries(chatCount).map(([chat, count]) => [chat, (count / totalMessages * 100).toFixed(1)])
                ));

                console.log("Estadísticas de mensajes:", messageStats);
                console.log("Estadísticas de chats:", chatStats);
            })
            .catch(error => console.error('Error al obtener datos:', error));
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('UserId')
        if(!userId){
            navigate('/login')
        }

    },[navigate]);

    const fetchMessage = async (chatId) => {
      try{
        const response = await fetch(`http://localhost:3001/message`,{
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if(!response.ok) throw new Error('Error al consultar los datos');
        const dataMessage = await response.json();
        const resultsMessage = dataMessage.data.docs;
        const conversacion = resultsMessage.find((conv)=> conv.contactId === chatId);
        if(!conversacion) return [];
        return conversacion.messages
          .slice()
          .sort((a,b)=> new Date(a.timeStamp) - new Date(b.timeStamp));
      }catch(error){
        console.error('Error al moemnto de consultar los datos de la api:', error);
        return [];  // <-- SIEMPRE un array
      }
    };

    const fetchEmpleAsosiado = async () => {
        try {
            const response = await fetch(`http://localhost:3001/asignaciones/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`Error al consultar las asignaciones`);

            const resultEmple = await response.json();
            const dataEmple = resultEmple.data.docs;

            const empleadosConDatos = await Promise.all(dataEmple.map(async (user) => {
              const idEmple = user.idEmple;
              const chatId = user.chatId;
              const chatContact = user.chatName;
              const FechaRegister = user.createdAt;

              const userData = await fetchUser(idEmple);        // objeto o null
              const manychatData = await fetchManychat(chatId); // objeto o null
              const message = await fetchMessage(chatId);       // array

              return {
                idEmple,
                chatId,
                chatContact,
                FechaRegister,
                userData,
                manychatData,
                message
              };
            }));

            setEmpleAsociado(empleadosConDatos);
            setShowPreview(false);
            console.log('Datos asociados:', empleadosConDatos);

        } catch (error) {
            console.error(`Error al consultar los datos del empleado asociado`, error);
        }
    };

    const fetchUser = async (idEmple) => {
      try {
        const responseUser = await fetch(`http://localhost:3001/user/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!responseUser.ok) throw new Error("Error al consultar usuario");
        const resultUser = await responseUser.json();
        const dataUser = resultUser.data.docs;
        return dataUser.find((u) => u._id === idEmple) || null;   // <-- objeto o null
      } catch (error) {
        console.error("Error al consultar usuario:", error);
        return null;
      }
    };

    const fetchManychat = async (chatId) => {
      try {

        const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!responseMany.ok) throw new Error(`Error al consultar ManyChat`);
        const resultMessage = await responseMany.json();
        return resultMessage?.cliente?.data || null;
      } catch (error) {
        console.error(`Error al consultar ManyChat: ${error}`);
        return null;
      }
    };

    const generateReport = () => {
      if (empleAsociado.length === 0) {
        alert('No hay datos para generar el reporte.');
        return;
      }

      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      // ====== LAYOUT Y ESTILO ======
      const margin = { top: 25, right: 15, bottom: 18, left: 15 };
      const page = { w: doc.internal.pageSize.width, h: doc.internal.pageSize.height };
      const contentW = page.w - margin.left - margin.right;
      const lineH = 7;
      let y = margin.top;

      const setBody = () => { doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(20,20,20); };
      const setSubtle = () => { doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(120,120,120); };
      const setStrong = () => { doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(20,20,20); };

      const addHeader = () => {
        doc.setFillColor(41,128,185);
        doc.rect(0, 0, page.w, 20, 'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(255,255,255);
        doc.text('Reporte de Empleados Asociados', page.w/2, 12, { align:'center' });
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleString()}`, margin.left, 18);
        setBody();
      };

      const addFooters = () => {
        const total = doc.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
          doc.setPage(i);
          setSubtle();
          doc.text(`Página ${i} de ${total}`, page.w - margin.right, page.h - 8, { align: 'right' });
        }
        setBody();
      };

      const newPage = () => { doc.addPage(); addHeader(); y = margin.top; };

      const ensureSpace = (needed) => {
        if (y + needed > page.h - margin.bottom) newPage();
      };

      // Quita caracteres problemáticos y acentos si no tienes fuente UTF-8
      const cleanText = (txt = '') => {
        const t = String(txt)
          .replace(/\r\n|\r|\n/g, ' ')                         // líneas a espacio
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');   // quita diacríticos
        // quita controles invisibles
        return t.replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, '');
      };

      // Parte tokens muuuuy largos (URLs, comandos) para que no desborden
      const hardWrapLongTokens = (txt, maxChunk = 28) => {
        return txt.split(' ').map(tok => {
          if (tok.length <= maxChunk) return tok;
          return tok.match(new RegExp(`.{1,${maxChunk}}`, 'g')).join(' ');
        }).join(' ');
      };

      // Escribir bloque con wrapping y salto de página seguro
      const writeBlock = (txt, x, opts = {}) => {
        const { bullet = '', color = [20,20,20], indent = 0, size = 11, bold = false } = opts;
        doc.setTextColor(...color);
        doc.setFont('helvetica', bold ? 'bold' : 'normal'); 
        doc.setFontSize(size);

        const prefix = bullet ? `${bullet} ` : '';
        const safe = hardWrapLongTokens(cleanText(txt));
        const lines = doc.splitTextToSize(prefix + safe, contentW - indent);
        // altura necesaria y salto de página si no cabe
        const needed = lines.length * lineH;
        ensureSpace(needed);

        lines.forEach(line => {
          doc.text(line, margin.left + indent, y);
          y += lineH;
        });

        setBody(); // reset
      };

      // Carga imagen remota -> base64
      const loadImageAsBase64 = async (url) => {
        const res = await fetch(url); const blob = await res.blob();
        return new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      };

      const isURL = (t='') => /^https?:\/\/\S+$/i.test(String(t).trim());

      const writeImage = async (src, label) => {
        try {
          const b64 = await loadImageAsBase64(src);
          const imgW = Math.min(120, contentW); // ancho seguro
          const imgH = 65;                      // alto fijo razonable
          ensureSpace(imgH + lineH*2);
          setSubtle(); doc.text(label, margin.left + 20, y); y += 4;
          doc.addImage(b64, 'JPEG', margin.left + 20, y, imgW, imgH);
          y += imgH + lineH/2;
          setBody();
        } catch {
          writeBlock('(Error al cargar imagen)', margin.left + 20, { color:[150,0,0] });
        }
      };

      // ====== RENDER ======
      addHeader();

      const groupedByDate = (messages = []) => {
        return messages.reduce((acc, m) => {
          const d = m?.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Sin fecha';
          (acc[d] ||= []).push(m);
          return acc;
        }, {});
      };

      const colorCliente = [39,174,96];
      const colorEmpleado = [41,128,185];
      const colorSistema  = [192,57,43];

      const getSender = (s) => (s === 'Cliente' ? 'Cliente' : s === 'Empleado' ? 'Empleado' : 'Sistema');
      const getColor  = (s) => (s === 'Cliente' ? colorCliente : s === 'Empleado' ? colorEmpleado : colorSistema);

      const titleSection = (txt) => {
        ensureSpace(lineH + 6);
        doc.setFillColor(245,245,245);
        doc.rect(margin.left, y - 5, contentW, lineH + 4, 'F');
        setStrong(); doc.text(txt, margin.left + 2, y);
        y += lineH;
        setBody();
      };

      (async () => {
        for (const emple of empleAsociado) {
          // Sección empleado
          titleSection('Empleado');
          writeBlock(`${emple.userData?.name ?? 'Empleado no encontrado'}`, margin.left, { bold:true });
          writeBlock(`Email: ${emple.userData?.email ?? 'Sin email'}`, margin.left);

          // Sección cliente
          titleSection('Cliente');
          writeBlock(`Nombre: ${emple.manychatData?.name ?? 'Cliente desconocido'}`, margin.left);
          writeBlock(`Chat: ${emple.chatContact ?? '—'} (ID: ${emple.chatId})`, margin.left);
          writeBlock(`Fecha de contacto: ${emple.FechaRegister ? new Date(emple.FechaRegister).toLocaleDateString() : '—'}`, margin.left);

          // Sección mensajes
          titleSection('Mensajes');
          groupedByDate(emple.message);
          if (!Object.keys(groupedByDate).length) {
            writeBlock('No hay mensajes disponibles', margin.left, { color:[120,120,120] });
          } else {
            for (const [date, msgs] of Object.entries(groupedByDate)) {
              setSubtle(); ensureSpace(lineH); doc.text(`[${date}]`, margin.left, y); y += lineH - 1; setBody();

              // Orden cronológico
              msgs.sort((a,b) => new Date(a?.updatedAt || 0) - new Date(b?.updatedAt || 0));

              for (const m of msgs) {
                const sender = getSender(m?.sender);
                const color  = getColor(sender);
                const hora = m?.timeStamp
                  ? new Date(m.timeStamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
                  : 'Sin hora';

                if (m?.message && isURL(m.message)) {
                  await writeImage(m.message, `${sender} · Imagen - ${hora}`);
                } else {
                  const text = `${sender}: ${m?.message ?? ''} - ${hora}`;
                  writeBlock(text, margin.left, { color, indent: 20, bullet: '•' });
                }
              }
            }
          }

          // espacio entre empleados
          ensureSpace(lineH * 2);
          y += 3;
        }

        addFooters();
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setShowPreview(true);
      })();
    };



    return(
        <>
            <div className={theme === 'light' ? 'app light': 'app dark'}>
                <div className="slider">
                    <Navbar/>
                    <div className="flex">
                        <SliderDashboard/>
                    </div>
                </div>

                <div className="BarraSuperior">
                    <h1>Reporte Historial De Mensajes</h1>
                    <a className="ButtonTheme1" onClick={toggleTheme}>
                        <img src={theme === 'light'? ModoClaro: ModoOscuro}/>
                    </a>
                </div>

                <div className="contentReports">
                    <div className="contentTableReport">
                        <div className="contentButton">
                            <div className="contentLabel">
                            </div>
                            <button className="fetch-client-btn" onClick={fetchEmpleAsosiado}>Obtener Mensajes</button>
                            <button className="generate-report-btn" onClick={generateReport}>Generar PFD</button>
                        </div>

                        <div className="contentReports">
                            <div className="reports-container">
                                {empleAsociado.length > 0 ? (
                                  <ul>
                                    {empleAsociado.map((empleado, index) => (
                                      <li key={index} className="report-item">
                                        <strong>{empleado.userData?.name ?? 'Empleado no encontrado'}</strong>
                                        <p>Cliente asignado: {empleado.manychatData?.name ?? 'Cliente desconocido'}</p>
                                        <p>Chat de contacto: {empleado.chatContact ?? '—'}</p>
                                        <p>{empleado.FechaRegister ? new Date(empleado.FechaRegister).toLocaleString([],{hour: '2-digit', minute: '2-digit'}) : '—'}</p>
                                        <p>{empleado.FechaRegister ? new Date(empleado.FechaRegister).toLocaleDateString() : '—'}</p>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>No hay datos cargados.</p>
                                )}

                            </div>

                            {showPreview && pdfUrl &&(
                                <div className="pdf-preview">
                                    <h2>Vista Previa Del Reporte</h2>
                                    <iframe ref={iframeRef} src={pdfUrl} width="100%" height="500px" />
                                    <a href={pdfUrl} download="Reporte_Empleado_Asignado.pdf" className="download-btn" >Descargar PDF</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReportHistoryMessage