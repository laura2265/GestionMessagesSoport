import { useContext, useState, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ThemeContext from "../../../ThemeContext";
import Navbar from "../../../navbar/Navbar";
import SliderDashboard from "../../../navbar/SliderDashboard";
import ModoOscuro from '../../../../assets/img/modo-oscuro.png';
import ModoClaro from '../../../../assets/img/soleado.png';

function ReportClient() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [clients, setClients] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const iframeRef = useRef(null);

    const fetchClient = async () => {
        try {
            const response = await fetch(`http://localhost:3001/user`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener los datos`);
            }

            const dataClient = await response.json();
            const resultClient = dataClient.data.docs;

            const clientRol = resultClient.filter(client => {
                const createdAt = new Date(client.createdAt);
                return client.rol === 3 &&
                    (!startDate || createdAt >= new Date(startDate)) &&
                    (!endDate || createdAt <= new Date(endDate));
            });

            setClients(clientRol);
            setShowPreview(false);
        } catch (error) {
            console.error('Error al consultar la API:', error);
        }
    };

    const generateReport = () => {
        if (clients.length === 0) {
            alert("No hay datos para generar el reporte.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Reporte de Clientes", 14, 20);
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["ID", "Nombre", "Correo", "Fecha de Registro", 'Hora'];
        const tableRows = clients.map(client => [
            client._id,
            client.name,
            client.email,
            new Date(client.createdAt).toLocaleDateString(),
            new Date(client.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit'})
        ]);

        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 40 });

        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
        setShowPreview(true);

        if (iframeRef.current) {
            iframeRef.current.src = pdfUrl;
        }
    };

    return (
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderDashboard />
                    </div>
                </div>

                <div className="BarraSuperior">
                    <h1>Reporte Cliente</h1>
                    <a className="ButtonTheme1" onClick={toggleTheme}>
                        <img src={theme === 'light' ? ModoClaro : ModoOscuro} />
                    </a>
                </div>

                <div className="contentReports">
                    <div className="contentTableReport">

                        <div className='contentButton'>

                            <div className="contentLabel">
                                <label>Desde:<br/> <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
                            </div>

                            <div className="contentLabel">
                                <label>Hasta:<br/> <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
                            </div>

                            <button className="fetch-client-btn" onClick={fetchClient}>Obtener Clientes</button>
                            <button className="generate-report-btn" onClick={generateReport}>Generar Reporte</button>
                        </div>
                        <div className="contentReports">
                            <div className="reports-container">
                                {clients.length > 0 ? (
                                    <ul>
                                        {clients.map((client, index) => (
                                            <li key={index} className="report-item">
                                                <strong>{client.name}</strong>
                                                <p>Email: {client.email}</p>
                                                <p>Registrado el: {new Date(client.createdAt).toLocaleDateString()}</p>
                                                <p>Hora: {new Date(client.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No hay clientes cargados aún.</p>
                                )}
                            </div>
                            {showPreview && pdfUrl && (
                                <div className="pdf-preview">
                                    <h2>Vista previa del Reporte</h2>
                                    <iframe ref={iframeRef} width="100%" height="500px"></iframe>
                                    <a href={pdfUrl} download="Reporte_Clientes.pdf" className="download-btn">Descargar PDF</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReportClient;
