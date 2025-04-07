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
    
        const marginLeft = 15;
        const marginTop = 25;
        const pageHeight = doc.internal.pageSize.height;
        const lineHeight = 10;
        let yOffset = marginTop;
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
        const addHeader = () => {
            doc.setFontSize(18);
            const logBae64 = loadImageAsBase64()
            doc.addImage(logBae64, 'PNG', marginLeft, yOffset, 40, 40);
            yOffset += 50;
    
            doc.setFontSize(12);
            doc.text('Reporte de Empleados Asociados', marginLeft, yOffset);
            yOffset += 10;
        }
    
        const addNewPageIfNeeded = () => {
            if (yOffset + lineHeight > pageHeight) {
                doc.addPage();
                yOffset = marginTop;
                addHeader();
            }
        }
    
        addHeader();
    
        empleAsociado.forEach((emple, index) => {
            addNewPageIfNeeded();
    
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
            doc.text(`${emple.manychatData.name}`, 55, yOffset);
            yOffset += lineHeight;
    
            doc.setFont("helvetica", "bold");
            doc.text(`Chat ID: `, 35, yOffset);
            doc.setFont("helvetica", "normal");
            doc.text(`${emple.chatId}`, 55, yOffset);
            yOffset += lineHeight;
    
            doc.setFont("helvetica", "bold");
            doc.text(`Fecha de contacto:`, 35, yOffset);
            doc.setFont("helvetica", "normal");
            doc.text(`${new Date(emple.FechaRegister).toLocaleDateString()}`, 75, yOffset);
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
                    addNewPageIfNeeded();
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text(date, 50, yOffset);
                    yOffset += lineHeight;
    
                    messagesOnDate.map((message) => {
                        addNewPageIfNeeded();
                        doc.setFontSize(12);
                        doc.setFont("helvetica", "normal");
    
                        const senderText = message.sender === 'Cliente' ? 'Cliente: ' : 'Empleado: ';
                        const distancia = message.sender;
                        doc.setFont("helvetica", "bold");
                        doc.text(`•  ${senderText}`, 54, yOffset);
                        doc.setFont("helvetica", "normal");
    
                        doc.text(`${message.message} ${new Date(message.updatedAt).toLocaleString([], {hour: '2-digit', minute: '2-digit'})}`, distancia === 'Cliente'? 75: 80, yOffset);
                        yOffset += lineHeight;
                    });
                });
            }
        });
    
        doc.save('Reporte_Empleados_Asociados.pdf');
    }
    
    

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