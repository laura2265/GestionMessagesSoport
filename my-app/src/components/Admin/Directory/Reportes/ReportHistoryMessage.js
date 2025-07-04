import { useContext, useEffect, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderDashboard from "../../../navbar/SliderDashboard";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';
import { useRef } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

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
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if(!response.ok){
                throw new Error('Error al consultar los datos')
            }

            const dataMessage = await response.json();
            const resultsMessage = dataMessage.data.docs;

            const conversacion = resultsMessage.find((conv)=> conv.contactId === chatId)

            if(!conversacion){
                return [];
            }

            const mensajesOrdenados = conversacion.messages.sort((a,b)=> new  Date(a.timeStamp) - Date(b.timeStamp))
            return mensajesOrdenados;
        }catch(error){
            console.error('Error al moemnto de consultar los datos de la api:', error)
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
                const chatId = user.cahtId;
                const chatContact = user.chatName;
                const FechaRegister = user.createdAt;

                const userData = await fetchUser(idEmple);
                const manychatData = await fetchManychat(chatId);
                const message = await fetchMessage(chatId);

                return { idEmple, chatId, chatContact,FechaRegister, userData, manychatData, message };
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

                return dataUser.filter((user) => user._id === idEmple) || null;

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
            return resultMessage.cliente.data || null;

        } catch (error) {
            console.error(`Error al consultar ManyChat: ${error}`);
            return null;
        }
    };

    function groupMessagesByDate(messages) {
        return messages.reduce((acc, message) => {
            const date = new Date(message.updatedAt).toLocaleDateString();

            if (!acc[date]) {
                acc[date] = [];
            }

            acc[date].push(message);
            acc[date].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
            return acc;
        }, {});
    }

    const generateReport = () => {
        if (empleAsociado.length === 0) {
          alert('No hay datos para generar el reporte.');
          return;
      }
      const doc = new jsPDF({
          orientation: 'p',
          unit: "mm",
          format: 'a4'
      });
  
      const esURL = (texto) => {
          const regex = /https?:\/\/[^\s]+/;
          return regex.test(texto);
      };
  
      const loadImageAsBase64 = async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });
      };
      const marginLeft = 15;
      const marginRight = 15;
      const marginTop = 25;
      const maxTextWidth = doc.internal.pageSize.width - marginLeft - marginRight;
      const pageHeight = doc.internal.pageSize.height;
      const lineHeight = 10;
      let yOffset = marginTop;
  
      const addHeader = () => {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text('Reporte de Empleados Asociados', marginLeft, yOffset);
          yOffset += lineHeight;
      };
  
      const addNewPageIfNeeded = (extra = 10) => {
          if (yOffset + extra > pageHeight) {
              doc.addPage();
              yOffset = marginTop;
              addHeader();
          }
      };
  
      addHeader();

      const processMessages = async()=>{
        for(const emple of empleAsociado){
            addNewPageIfNeeded();
  
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text(`Empleado:`, marginLeft, yOffset);
  
              doc.setFontSize(12);
              doc.setFont("helvetica", "normal");
              doc.text(`${emple.userData[0].name} (${emple.userData[0].email})`, marginLeft + 25, yOffset);
              yOffset += lineHeight;
  
              doc.setFont("helvetica", "normal");
              doc.text(`Atendió al siguiente cliente:`, marginLeft + 10, yOffset);
              yOffset += lineHeight;
  
              doc.setFont("helvetica", "bold");
              doc.text(`Cliente:`, marginLeft + 20, yOffset);
              doc.setFont("helvetica", "normal");
              doc.text(`${emple.manychatData.name}`, marginLeft + 40, yOffset);
              yOffset += lineHeight;
  
              doc.setFont("helvetica", "bold");
              doc.text(`Chat ID: `, marginLeft + 20, yOffset);
              doc.setFont("helvetica", "normal");
              doc.text(`${emple.chatId}`, marginLeft + 40, yOffset);
              yOffset += lineHeight;


               doc.setFont("helvetica", "bold");
              doc.text(`Fecha de contacto:`, marginLeft + 20, yOffset);
              doc.setFont("helvetica", "normal");
              doc.text(`${new Date(emple.FechaRegister).toLocaleDateString()}`, marginLeft + 55, yOffset);
              yOffset += lineHeight;
  
              doc.setFont("helvetica", "bold");
              doc.text("Chat: ", marginLeft + 20, yOffset);
              doc.setFont("helvetica", "normal");
              doc.text(`${emple.chatContact}`, marginLeft + 35, yOffset);
              yOffset += lineHeight;
  
              doc.setFont("helvetica", "bold");
              doc.text('Mensajes:', marginLeft + 10, yOffset);
              yOffset += lineHeight;
  
              const groupedMessages = groupMessagesByDate(emple.message);

              if(Object.keys(groupedMessages).length === 0){
                  doc.text('No hay mensajes disponibles', marginLeft, yOffset);
                  yOffset += lineHeight;
              }else{
                for(const [date, messagesOnDate] of Object.entries(groupedMessages)){
                    for(const message of messagesOnDate){
                        addNewPageIfNeeded();
                        doc.setFontSize(12);
                        doc.setFont("helvetica", "normal");
                
                        const senderText = message.sender === 'Cliente' ? 'Cliente: ' : 'Empleado: ';
                        const xOffset = marginLeft + 25;
                        const hora = message.timeStamp
                        ? new Date(message.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Sin hora';
                        
                        doc.setFont("helvetica", "bold");
                        doc.text(`•  ${senderText}`, marginLeft, yOffset);
                        doc.setFont("helvetica", "normal");

                        if(esURL(message.message)){
                          try{
                              const base64Image = await loadImageAsBase64(message.message)
                              addNewPageIfNeeded(35);
                              doc.text(`Imagen - ${hora}`, xOffset, yOffset);
                                yOffset += 5;
                          
                                doc.addImage(base64Image, 'JPEG', xOffset, yOffset, 50, 30);
                                yOffset += 35;
                          }catch(error){
                                doc.text('(Error al cargar imagen)', xOffset, yOffset);
                                yOffset += lineHeight;
                          }
                        }else{
                          const cleanText = message.message.replace(/[^const cleanText = message.message.replace(/[^\x00-const cleanText = message.message.replace(/[^\x00-\x7F]/g, "");
                            const wrappedText = doc.splitTextToSize(`${cleanText} - ${hora}`, maxTextWidth - 25);
                            wrappedText.forEach(line => {
                                addNewPageIfNeeded();
                                doc.text(line, xOffset, yOffset);
                                yOffset += lineHeight;
                            });
                        }
                    }
                }
              }
        }
        const pdfBlob = doc.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          setPdfUrl(url);
          setShowPreview(true);
      }

      processMessages();
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
                                                <strong>{empleado.userData[0].name}</strong>
                                                <p>Cliente asignado: {empleado.manychatData.name}</p>
                                                <p>Chat de contacto: {empleado.chatContact}</p>
                                                <p>{new Date(empleado.FechaRegister).toLocaleString([],{hour: '2-digit', minute: '2-digit'})}</p>
                                                <p>{new Date(empleado.FechaRegister).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ):(
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