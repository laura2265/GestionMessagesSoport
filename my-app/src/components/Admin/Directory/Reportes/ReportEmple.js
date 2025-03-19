import { useContext, useRef, useState } from "react"
import ThemeContext from "../../../ThemeContext"
import Navbar from "../../../navbar/Navbar"
import SliderDashboard from "../../../navbar/SliderDashboard"
import ModoOscuro from '../../../../assets/img/modo-oscuro.png'
import ModoClaro from '../../../../assets/img/soleado.png'
import jsPDF from "jspdf"

function ReportEmple(){
    const {theme, toggleTheme} = useContext(ThemeContext);
    const [Emple, setEmple] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const iframeRef = useRef(null)

    const fetchEmple = async () => {
        try{
            const response = await fetch(`http://localhost:3001/user`,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json();
            const resultEmple = data.data.docs;

            const EmpleRol = resultEmple.filter((emple) => {
                const createdAt = new Date(emple.createdAt);
                return emple.rol === 2 &&
                (!startDate || createdAt >=  new Date(startDate))&&
                (!endDate || createdAt <= new Date(endDate));
            })

            setEmple(EmpleRol)
            setShowPreview(false)

        }catch(error){
            console.error('Error al momento de consultar los datos del empleado: ', error)
        }
    }

    const generateReport = () => {
        if(Emple.length === 0){
            alert('No hay datos para generar el reporte ')
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Reporte De Empleados', 14, 20);
        doc.setFontSize(12);
        doc.text(`Fecha ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColums = ["ID", "Nombre", "Correo", "Fecha de Registro", 'Hora']
        const tableRows =  Emple.map(emple => [
            emple._id,
            emple.name,
            emple.email,
            new Date(emple.createdAt).toLocaleDateString(),
            new Date(emple.createdAt).toLocaleString([],{hour: '2-digit', minute: '2-digit'})
        ])

        doc.autoTable({head: [tableColums], body: tableRows, startY: 40})
        
        const pdfBlob = doc.output('blob')
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl)
        setShowPreview(true);

        if(iframeRef.current){
            iframeRef.current.src = pdfUrl
        }
    }

    return(
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

                            <button className="fetch-client-btn" onClick={fetchEmple}>Obtener Clientes</button>
                            <button className="generate-report-btn" onClick={generateReport}>Generar Reporte</button>
                        </div>
                        <div className="contentReports">
                            <div className="reports-container">
                                {Emple.length > 0 ? (
                                    <ul>
                                        {Emple.map((emple, index) => (
                                            <li key={index} className="report-item">
                                                <strong>{emple.name}</strong>
                                                <p>Email: {emple.email}</p>
                                                <p>Registrado el: {new Date(emple.createdAt).toLocaleDateString()}</p>
                                                <p>Hora: {new Date(emple.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}</p>
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
    )
}

export default ReportEmple;