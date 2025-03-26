import { useContext, useEffect, useState } from "react";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderDashboard from "../../../navbar/SliderDashboard";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';
import { useRef } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import React from 'react';

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

    },[navigate])

    const fetchMessage = async (chatId) => {
        try {
            const response = await fetch(`http://localhost:3001/message`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Error al momento de consultar los mensajes');
            }

            const dataMessage = await response.json();
            const resultsMessage = dataMessage.data.docs;

            const messageId = resultsMessage.filter((message) => message.contactId === chatId);

            return Array.isArray(messageId) ? messageId : [];

        } catch (error) {
            console.error('Error al consultar los mensajes en la API:', error);
            return [];
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

        const  marginLeft = 15;
        const marginTop =  25;
        const pageHeight = doc.internal.pageSize.height;
        const lineHeight = 10;
        let yOffset = marginTop;

        const addHeader = ()=>{

            doc.setFontSize(18);
            const img = 'data:image/png;base64,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';
            doc.addImage( img,'PNG', marginTop, 10,marginLeft , marginTop);
            doc.setFontSize(12);
            doc.text(`${new Date().toLocaleDateString()}`,doc.internal.pageSize.width-30 , 20);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text('Reporte Actividad De Los Chats', 55, marginTop);

            doc.line(marginLeft, 35, doc.internal.pageSize.width-marginLeft, 35);
            yOffset+=marginTop;
        }

        //head pagina
        addHeader()

        empleAsociado.forEach((emple, index) => {

            if(yOffset+lineHeight > pageHeight-marginTop){
                doc.addPage();
                yOffset = marginTop;
            }

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`Empleado:`, 14, yOffset);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`${emple.userData[0].name} (${emple.userData[0].email})`, 40, yOffset);

            yOffset += lineHeight;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(`Atendio al siguiente cliente:`, 24, yOffset);
            yOffset += lineHeight;

                doc.setFont("helvetica", "bold");
                doc.text(`Cliente:`, 35, yOffset);
                doc.setFont("helvetica", "normal");
                doc.text(`${emple.manychatData.name}`, 55   , yOffset);
                yOffset += lineHeight;

                doc.setFont("helvetica", "bold");
                doc.text(`Chat ID: `, 35, yOffset);
                doc.setFont("helvetica", "normal");
                doc.text(`${emple.chatId}`, 55, yOffset);
                yOffset += lineHeight;

                doc.setFont("helvetica", "bold");
                doc.text(`Fecha de contacto:`, 35, yOffset);
                doc.setFont("helvetica", "normal");
                doc.text(`${new Date(emple.FechaRegister).toLocaleDateString()}`, 75, yOffset)
                yOffset += lineHeight;

                doc.setFont("helvetica", "bold");
                doc.text("Chat: ", 35, yOffset);
                doc.setFont("helvetica", "normal");
                doc.text(`${emple.chatContact}`, 47, yOffset);
                yOffset += lineHeight;

                doc.setFont("helvetica", "bold");
                doc.text('Mensajes:', 44, yOffset);
                yOffset += lineHeight;

                const groupedMessages = groupMessagesByDate(emple.message);

            if (Object.keys(groupedMessages).length === 0) {
                doc.text('No hay mensajes disponibles', 18, yOffset);
                yOffset += lineHeight;
            } else {

                Object.entries(groupedMessages).map(([date, messagesOnDate]) => {

                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text(date, 50, yOffset);
                    yOffset += lineHeight;

                    messagesOnDate.map((message) => {
                        doc.setFontSize(12);
                        doc.setFont("helvetica", "normal");

                        const senderText = message.sender === 'Cliente' ? 'Cliente: ' : 'Empleado: ';
                        const distancia = message.sender;
                        doc.setFont("helvetica", "bold");
                        doc.text(`•  ${senderText}`, 54, yOffset);
                        doc.setFont("helvetica", "normal");

                        if(message.message.includes('')){

                        }
                        doc.text(`${message.message} ${new Date(message.updatedAt).toLocaleString([], {hour: '2-digit', minute: '2-digit'})}`, distancia === 'Cliente'? 75: 80, yOffset);
                        yOffset += lineHeight;
                    });
                });
            }
            yOffset += lineHeight;
        });

        doc.setFontSize(10);
        doc.text('Reporte de los chats', 14, 280);

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
        setShowPreview(true);

        if (iframeRef.current) {
            iframeRef.current.src = pdfUrl;
        }
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
                                        {empleAsociado.map((emple, index) => (
                                            <li key={index} className="report-item">
                                                <strong>{emple.userData[0].name}</strong>
                                                <p>Cliente asignado: {emple.manychatData.name}</p>
                                                <p>Chat de contacto: {emple.chatContact}</p>
                                                <p>{new Date(emple.FechaRegister).toLocaleString([],{hour: '2-digit', minute: '2-digit'})}</p>
                                                <p>{new Date(emple.FechaRegister).toLocaleDateString()}</p>
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
                                    <iframe ref={iframeRef} width="100%" height="500px"></iframe>
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