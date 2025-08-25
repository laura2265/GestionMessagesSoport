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
      if (Emple.length === 0) {
        alert('No hay datos para generar el reporte');
        return;
      }
  
      // ====== UTILIDADES ======
      const toDate = (v) => {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
      };
      const fmtDate = (d) =>
        d ? d.toLocaleDateString() : '—';
      const fmtTime = (d) =>
        d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  
      // Convierte valores a texto legible (aplana objetos/arrays)
      const toPretty = (val) => {
        if (val === null || val === undefined) return '—';
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
        try {
          // Si es objeto/array, lo muestro como JSON compacto
          return JSON.stringify(val, null, 2).replace(/\n/g, ' ');
        } catch {
          return String(val);
        }
      };
  
      // Prepara un map de "Campo → Valor" por empleado, agregando derivados útiles
      const buildFieldMap = (u) => {
        const d = toDate(u.createdAt);
        const base = {
          'ID': u._id,
          'Nombre': u.name,
          'Correo': u.email,
          'Rol': u.rol,
          'Fecha de Registro': fmtDate(d),
          'Hora de Registro': fmtTime(d),
        };
    
        // Incluye el resto de propiedades dinámicamente
        // (sin duplicar las ya mapeadas arriba)
        const reserved = new Set(['_id','name','email','rol','createdAt']);
        Object.keys(u).forEach(k => {
          if (!reserved.has(k)) {
            base[k] = toPretty(u[k]);
          }
        });
    
        return base;
      };
  
      // ====== ORDEN DE EMPLEADOS ======
      const empleados = [...Emple].sort((a,b) => {
        const da = toDate(a.createdAt)?.getTime() || 0;
        const db = toDate(b.createdAt)?.getTime() || 0;
        return da - db;
      });
  
      // ====== PDF ======
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const page = { w: doc.internal.pageSize.getWidth(), h: doc.internal.pageSize.getHeight() };
      const margin = { top: 32, right: 12, bottom: 16, left: 12 };
  
      const colorPrimary = [41,128,185];
      const colorMuted = [120,120,120];
  
      // Cabecera de cada página
      const drawHeader = () => {
        doc.setFillColor(...colorPrimary);
        doc.rect(0, 0, page.w, 20, 'F');
    
        doc.setFont('helvetica','bold');
        doc.setTextColor(255,255,255);
        doc.setFontSize(16);
        doc.text('Reporte de Empleados (detalle)', page.w/2, 12, { align: 'center' });
    
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleString()}`, margin.left, 18);
    
        const range =
          (startDate ? `Desde: ${new Date(startDate).toLocaleDateString()}` : 'Desde: —')
          + '   •   ' +
          (endDate ? `Hasta: ${new Date(endDate).toLocaleDateString()}` : 'Hasta: —');
        doc.text(range, page.w - margin.right, 18, { align: 'right' });
      };
  
      // Pie con numeración
      const drawFooter = () => {
        const total = doc.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
          doc.setPage(i);
          doc.setFont('helvetica','italic');
          doc.setFontSize(9);
          doc.setTextColor(...colorMuted);
          doc.text(`Página ${i} de ${total}`, page.w - margin.right, page.h - 6, { align: 'right' });
        }
      };
  
      // Portada/encabezado inicial
      drawHeader();
  
      let currentY = margin.top;
  
      // Título general y total
      doc.setFont('helvetica','bold');
      doc.setTextColor(20,20,20);
      doc.setFontSize(12);
      doc.text(`Total de empleados: ${empleados.length}`, margin.left, currentY - 4);
  
      // ====== BLOQUE POR EMPLEADO ======
      empleados.forEach((u, idx) => {
        // Título de sección
        const nombre = u.name || '—';
        const idCorto = String(u._id || '').slice(-8);
        const title = `#${idx + 1}  ${nombre}   (ID: …${idCorto})`;
    
        // Si no cabe el título + tabla, AutoTable se encarga de saltar de página con didDrawPage
        doc.setFont('helvetica','bold');
        doc.setFontSize(12);
        doc.setTextColor(20,20,20);
    
        // Barra gris clara detrás del título
        doc.setFillColor(245,245,245);
        doc.rect(margin.left, currentY - 6, page.w - margin.left - margin.right, 8, 'F');
        doc.text(title, margin.left + 2, currentY);
        currentY += 6;
    
        // Construir pares Campo/Valor
        const map = buildFieldMap(u);
        const rowsKV = Object.entries(map).map(([k,v]) => [k, v]);
    
        // Dibuja tabla de detalle
        doc.autoTable({
          startY: currentY + 2,
          head: [['Campo', 'Valor']],
          body: rowsKV,
        
          margin: { top: margin.top, right: margin.right, bottom: margin.bottom, left: margin.left },
          styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 3,
            minCellHeight: 7,
            overflow: 'linebreak',
            valign: 'middle',
            textColor: [30,30,30],
          },
          headStyles: {
            fillColor: colorPrimary,
            textColor: [255,255,255],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [248,250,255],
          },
          columnStyles: {
            0: { cellWidth: 48, fontStyle: 'bold' }, // Campo
            1: { cellWidth: page.w - margin.left - margin.right - 48 }, // Valor
          },
          didDrawPage: () => {
            // Redibuja header en cada página adicional
            drawHeader();
          },
        });
    
        // Actualiza Y para el siguiente bloque
        currentY = doc.lastAutoTable.finalY + 8;
    
        // Salto amable entre empleados
        if (currentY > page.h - margin.bottom - 30) {
          doc.addPage();
          drawHeader();
          currentY = margin.top;
        }
      });
  
      drawFooter();
  
      // ====== PREVIEW/DESCARGA ======
      const fileSuffix = [
        startDate ? new Date(startDate).toLocaleDateString() : 'inicio',
        endDate ? new Date(endDate).toLocaleDateString() : 'fin'
      ].join('_');
  
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPreview(true);
      if (iframeRef.current) iframeRef.current.src = url;
  
    };



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
                    <h1>Reporte Empleados</h1>
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

                            <button className="fetch-client-btn" onClick={fetchEmple}>Obtener Empleado</button>
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