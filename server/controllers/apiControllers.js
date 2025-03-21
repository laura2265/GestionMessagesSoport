import fetch from 'node-fetch';
import { idGoogleSheets, ApiKeyGoogleSheets } from '../config/config.js';

// Función para consultar una hoja específica
const fetchSheetData = async (sheetNumber) => {
    const rango = `Sheet${sheetNumber}!A:Z`;
    const urlSheet = `https://sheets.googleapis.com/v4/spreadsheets/${idGoogleSheets}/values/${rango}?key=${ApiKeyGoogleSheets}`;

    try {
        const response = await fetch(urlSheet);
        if (!response.ok) {
            throw new Error(`Error al consultar la hoja ${sheetNumber}`);
        }
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error(`Error en la hoja ${sheetNumber}:`, error);
        return [];
    }
};

let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; 

const getDataFetch = async (req, res) => {
    const now = Date.now();
    if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
        console.log('Retornando datos desde cache');
        return res.json(cachedData);
    }
    console.log('Consultando datos de Google Sheets...');
    try {
        const promises = [];
        for (let i = 1; i <= 15; i++) {
            promises.push(fetchSheetData(i));
        }

        const allData = await Promise.all(promises);

        let formattedData = [];
        
        allData.forEach((sheetData, index) => {
            if (sheetData.length > 1) {
                const headers = sheetData[0];
                const rows = sheetData.slice(1);

                const idIndex = headers.indexOf('id');
                const NameIndex = headers.indexOf('Nombre');
                const chatIndex = headers.indexOf('chat_name');
                const messageIndex = headers.indexOf('mensaje');

                if(`Sheet${index+1}` === `Sheet1`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    const DispositivoIndex = headers.indexOf('DispositivoInternet');
                    const RedConexionIndex = headers.indexOf('RedConexión');
                    const InfoIndex = headers.indexOf('InformacionAyuda');
                    const DispositivoAyudaIndex = headers.indexOf('DispositivoAyuda');
                    const bombilloLosIndex = headers.indexOf('bombilloLOS');
                    const FuncionaIndex = headers.indexOf('FuncionamientoInternet');
                    const cableDañadoIndex = headers.indexOf('CableDañado');
                    const funcionoIndex1 = headers.indexOf('FuncionoConexion1');

                    if(`Sheet${index+1}` === `Sheet1`){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet1`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                ProblemaInt: row[ProblemaConexionIndex],
                                Dispositivo1: row[DispositivoIndex],
                                RedDispo: row[RedConexionIndex],
                                info: row[InfoIndex],
                                DispoAyuda: row[DispositivoAyudaIndex],
                                bombilloLos: row[bombilloLosIndex],
                                Funciono: row[FuncionaIndex],
                                cable: row[cableDañadoIndex],
                                funciono1: row[funcionoIndex1]
                            })
                        })
                    }
                    
                }else if(`Sheet${index+1}` === `Sheet2`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    const testVelIndex = headers.indexOf('VelocidadTest');
                    const porcentajeIndex = headers.indexOf('PorcentajeVelocidad');
                    const ResultTestIndex = headers.indexOf('FuncionamientoTestVelocidad');
                    
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && ProblemaConexionIndex !== -1 && testVelIndex !== -1 && porcentajeIndex !== -1 && ResultTestIndex !== -1){
                        rows.forEach(row=>{
                            formattedData.push({
                                sheet:`Sheet2`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                ProblemaInt: row[ProblemaConexionIndex],
                                testVel: row[testVelIndex],
                                porcentaje: row[porcentajeIndex],
                                result: row[ResultTestIndex]
                            })
                        })
                    }
                }else if(`Sheet${index+1}` === `Sheet3`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    const ProblemaPage = headers.indexOf('ProblemaPaginas');
                    const ResultPage = headers.indexOf('ResultPage');
                    const ExplicacionPage = headers.indexOf('ExplicacionPage');
                    const DispPage = headers.indexOf('DispositivoPage');
                    const ResultPage1 = headers.indexOf('ResultExplicacion');
                    const confirVPN = headers.indexOf('ConfirmacionVPN');
                    const DispVPN = headers.indexOf('DispositivoVPN');
                    const funcionoVPN = headers.indexOf('FuncionoVPN');
                    const NamePage = headers.indexOf('Nombrepagina');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && ProblemaConexionIndex !== -1 && ProblemaPage !== -1 && ResultPage !== -1 && ExplicacionPage!== -1 && DispPage!== -1 && ResultPage1!== -1 && confirVPN !== -1 && DispVPN !== -1 &&funcionoVPN !== -1 && NamePage !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet3`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                ProblemaInt: row[ProblemaConexionIndex],
                                ProblemPage: row[ProblemaPage],
                                ResultP: row[ResultPage],
                                ExpliPage: row[ExplicacionPage],
                                DispositivoPage: row[DispPage],
                                ResultP1: row[ResultPage1],
                                ConfimVPN: row[confirVPN],
                                DispositivoVPN: row[DispVPN],
                                funcionoVpn: row[funcionoVPN],
                                namePage: row[NamePage],
                            })
                        })
                    }
                }else if(`Sheet${index+1}` === `Sheet4`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    const ProblemSeñal = headers.indexOf('ProblemaSeñal');
                    const CantSeñal = headers.indexOf('CantidadCanales');
                    const ConectCable = headers.indexOf('ConexionCable');
                    const FuncionoSeñal = headers.indexOf('FuncionoSeñal');
                    const SeñalTV = headers.indexOf('BombilloCATV');
                    const FuncionoFinal = headers.indexOf('FuncionoSeñalFinal');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && ProblemaConexionIndex !== -1 && ProblemSeñal !== -1 && CantSeñal !== -1 && ConectCable !== -1 && FuncionoSeñal !== -1 && SeñalTV !== -1 && FuncionoFinal !== -1){
                        rows.forEach(row=>{
                            formattedData.push({
                                sheet: `Sheet4`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                ProblemaInt: row[ProblemaConexionIndex],
                                ProblemaSeñal: row[ProblemSeñal],
                                CantSeñal: row[CantSeñal],
                                ConexionCable: row[ConectCable],
                                FuncionoSeñal: row[FuncionoSeñal],
                                bombilloTv: row[SeñalTV],
                                FuncionoFinal: row[FuncionoFinal],
                            })
                        })
                    }

                } else if(`Sheet${index+1}` === `Sheet5`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    const typeProblem = headers.indexOf('TipoConexion');
                    const bombilloLan = headers.indexOf('BombilloLan');
                    const ProblemWifi = headers.indexOf('ProblemaWifi');
                    const BombilloWifi = headers.indexOf('BombilloWifi');
                    const DispConexionInestable = headers.indexOf('DispositivoConexionInestable');
                    const RedDisp = headers.indexOf('RedConexionInestable');
                    const resultadoFinal = headers.indexOf('ResultadoRedInestable');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && ProblemaConexionIndex !== -1 && typeProblem !== -1 && bombilloLan !== -1 && ProblemWifi !== -1 && BombilloWifi !== -1 && DispConexionInestable !== -1 && RedDisp !== -1 && resultadoFinal){
                        rows.forEach(row=>{
                            formattedData.push({
                                sheet: `Sheet5`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                ProblemaInt: row[ProblemaConexionIndex],
                                TipoProblem: row[typeProblem],
                                bombilloLan: row[bombilloLan],
                                ProblemaWIFI: row[ProblemWifi],
                                bombilloWifi: row[BombilloWifi],
                                DispConexion: row[DispConexionInestable],
                                RedDisp: row[RedDisp],
                                resultadoFinal: row[resultadoFinal]
                            })
                        })
                    }

                }else if(`Sheet${index+1}` === `Sheet6`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && ProblemaConexionIndex !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet6`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                ProblemaInt: row[ProblemaConexionIndex],
                            })
                        })
                    }

                }else if(`Sheet${index+1}` === `Sheet7`){
                    const DescriptionUser = headers.indexOf('DescripcionUser');
                
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && DescriptionUser !== -1){
                        rows.forEach(row => {
                            let detalles = row[DescriptionUser] ? row[DescriptionUser].trim() : '';

                            let descripcionData = {
                                Nombre: null,
                                Documento: null,
                                Teléfono: null,
                                Email: null,
                                Servicio: null,
                                Motivo: null
                            };

                            if (detalles.includes(',')) {
                                let partes = detalles.split(',').map(d => d.trim());

                                descripcionData = {
                                    Nombre: partes[0] || null,
                                    Documento: partes[1] || null,
                                    Teléfono: partes[2] || null,
                                    Email: partes[3] || null,
                                    Servicio: partes[4] || null,
                                    Motivo: partes.slice(5).join(' ') || null
                                };

                            } else {

                                let partes = detalles.split(/\s+/);

                                if (partes.length >= 5) {
                                    let nombreFin = 2;
                                    while (nombreFin < partes.length && isNaN(partes[nombreFin])) {
                                        nombreFin++;
                                    }

                                    descripcionData.Nombre = partes.slice(0, nombreFin).join(' ').trim();
                                    descripcionData.Documento = partes[nombreFin] || null;
                                    descripcionData.Teléfono = partes[nombreFin + 1] || null;
                                    descripcionData.Email = partes[nombreFin + 2] || null;
                                    descripcionData.Servicio = partes[nombreFin + 3] || null;
                                    descripcionData.Motivo = partes.slice(nombreFin + 4).join(' ') || null;
                                } else {
                                    descripcionData.Motivo = detalles;
                                }
                            }

                            formattedData.push({
                                sheet: `Sheet7`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                descripcion: descripcionData
                            });
                        });
                    }

                }else if(`Sheet${index+1}` === `Sheet8`){
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet8`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                            })
                        })
                    }
                }else if(`Sheet${index+1}` === `Sheet9`){
                    const DescriptionCancelacion = headers.indexOf('DescripcionCancelacion');
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && DescriptionCancelacion !== -1){
                        rows.forEach(row => {
                            let detalles = row[DescriptionCancelacion] ? row[DescriptionCancelacion].trim() : '';

                            let descripcionData = {
                                Nombre: null,
                                Documento: null,
                                Servicio: null,
                                Motivo: null
                            };

                            if (detalles.includes(',')) {
                                let partes = detalles.split(',').map(d => d.trim());

                                descripcionData = {
                                    Nombre: partes[0] || null,
                                    Documento: partes[1] || null,
                                    Servicio: partes[2] || null,
                                    Motivo: partes.slice(3).join(' ') || null
                                }; 

                            } else {
                                let partes = detalles.split(/\s+/);

                                if (partes.length >= 3) {
                                    let nombreFin = 2;
                                    while (nombreFin < partes.length && isNaN(partes[nombreFin])) {
                                        nombreFin++;
                                    }

                                    descripcionData.Nombre = partes.slice(0, nombreFin).join(' ').trim();
                                    descripcionData.Documento = partes[nombreFin] || null;
                                    descripcionData.Servicio = partes[nombreFin + 1] || null;
                                    descripcionData.Motivo = partes.slice(nombreFin + 2).join(' ') || null;
                                } else {
                                    descripcionData.Motivo = detalles;
                                }
                            }

                            formattedData.push({
                                sheet: `Sheet9`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                descripcion: descripcionData
                            });
                        });
                    }
                }else if(`Sheet${index+1}` === `Sheet10`){
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet10`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                            })
                        })
                    }

                }else if(`Sheet${index+1}` === `Sheet12`){
                    const DescriptionPQR = headers.indexOf('DescripcionPQR');
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && DescriptionPQR !== -1){
                        rows.forEach(row => {
                            let detalles = row[DescriptionPQR] ? row[DescriptionPQR].trim() : '';

                            let descripcionData = {
                                Nombre: null,
                                Documento: null,
                                TipoSolicitud: null,
                                Fecha: null,
                                DescripcionProblema: null,
                            };

                            if (detalles.includes(',')) {
                                let partes = detalles.split(',').map(d => d.trim());

                                descripcionData = {
                                    Nombre: partes[0] || null,
                                    Documento: partes[1] || null,
                                    TipoSolicitud: partes[2] || null,
                                    Fecha: partes[3] || null,
                                    DescripcionProblema: partes.slice(4).join(' ') || null,
                                };
                            } else {
                                let partes = detalles.split(/\s+/);
                
                                if (partes.length >= 4) {
                                    let nombreFin = 2; 
                                    while (nombreFin < partes.length && isNaN(partes[nombreFin])) {
                                        nombreFin++;
                                    }

                                    descripcionData.Nombre = partes.slice(0, nombreFin).join(' ').trim();
                                    descripcionData.Documento = partes[nombreFin] || null;
                                    descripcionData.TipoSolicitud = partes[nombreFin + 1] || null;
                                    descripcionData.Fecha = partes[nombreFin + 2] || null;
                                    descripcionData.DescripcionProblema = partes.slice(nombreFin + 3).join(' ') || null;
                                } else {
                                    descripcionData.DescripcionProblema = detalles;
                                }
                            }

                            formattedData.push({
                                sheet: `Sheet12`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                descripcion: descripcionData
                            });
                        });
                    }

                }else if(`Sheet${index+1}` === `Sheet11`){
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet11`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                            })
                        })
                    }
                }else if(`Sheet${index+1}` === `Sheet13`){
                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet13`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                            })
                        })
                    }

                }else if(`Sheet${index+1}` === `Sheet14`){if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1){
                    rows.forEach(row => {
                        formattedData.push({
                            sheet: `Sheet14`,
                            id: row[idIndex],
                            Name: row[NameIndex],
                            chatName: row[chatIndex],
                            Message: row[messageIndex],
                        })
                    })
                }

                }else if(`Sheet${index+1}` === `Sheet15`){
                    const descriptionOtro = headers.indexOf('DescripcionOtro');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && descriptionOtro !== -1){
                        rows.forEach(row => {
                            let detalles = row[descriptionOtro] ? row[descriptionOtro].trim() : '';

                            let descripcionData = {
                                Nombre: null,
                                Documento: null,
                                ConfirmTitular: null,
                                DescripcionProblema: null,
                            };

                            if (detalles.includes(',')) {
                                let partes = detalles.split(',').map(d => d.trim());

                                descripcionData = {
                                    Nombre: partes[0] || null,
                                    Documento: partes[1] || null,
                                    ConfirmTitular: partes[2] || null,
                                    DescripcionProblema: partes.slice(3).join(' ') || null,
                                };
                            } else {
                                let partes = detalles.split(/\s+/);

                                if (partes.length >= 3) {
                                    let nombreFin = 2;
                                    while (nombreFin < partes.length && isNaN(partes[nombreFin])) {
                                        nombreFin++;
                                    }

                                    descripcionData.Nombre = partes.slice(0, nombreFin).join(' ').trim();
                                    descripcionData.Documento = partes[nombreFin] || null;
                                    descripcionData.ConfirmTitular = partes[nombreFin + 1] || null;
                                    descripcionData.DescripcionProblema = partes.slice(nombreFin + 2).join(' ') || null;
                                } else {
                                    descripcionData.DescripcionProblema = detalles;
                                }
                            }

                            formattedData.push({
                                sheet: `Sheet15`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                descripcion: descripcionData
                            });
                        });
                    }
                }
            }
        });

        cachedData = formattedData;
        lastFetchTime = Date.now();
        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error al procesar los datos:', error);
        res.status(500).json({ error: 'Error al consultar los datos de Google Sheets' });
    }
};

export default getDataFetch;
