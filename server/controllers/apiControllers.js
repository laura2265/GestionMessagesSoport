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
                    const numeroDocumento = headers.indexOf('DocumentoTitular')

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
                                funciono1: row[funcionoIndex1],
                                numDocTitular: row[numeroDocumento]
                            })
                        })
                    }

                }else if(`Sheet${index+1}` === `Sheet2`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    const testVelIndex = headers.indexOf('VelocidadTest');
                    const porcentajeIndex = headers.indexOf('PorcentajeVelocidad');
                    const ResultTestIndex = headers.indexOf('FuncionamientoTestVelocidad');
                    const NumeroDocumento = headers.indexOf('DocumentoTitular');

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
                                result: row[ResultTestIndex],
                                numDocTitular: row[NumeroDocumento]
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
                    const NumeroDocumento = headers.indexOf('DocumentoTitular');

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
                                numDocTitular: row[NumeroDocumento],
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
                    const NumeroDocumento = headers.indexOf('DocumentoTitular');

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
                                numDocTitular: row[NumeroDocumento],
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
                    const NumeroDocumento = headers.indexOf('DocumentoTitular');

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
                                resultadoFinal: row[resultadoFinal],
                                numDocTitular: row[NumeroDocumento],
                            })
                        })
                    }

                }else if(`Sheet${index+1}` === `Sheet6`){
                    const ProblemaConexionIndex = headers.indexOf('problema-conexion');
                    const NombreTitularOtroIndex = headers.indexOf('NombreTitularOtro');
                    const DocumentoTirularOtroIndex = headers.indexOf('DocumentoTitularOtro');
                    const MotivoProblemaConexionOtroIndex = headers.indexOf('MotivoProblemaConexionOtro');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && ProblemaConexionIndex !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet6`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                ProblemaInt: row[ProblemaConexionIndex],
                                NombreTitularOtro : row[NombreTitularOtroIndex],
                                DocumentoTirularOtro : row[DocumentoTirularOtroIndex],
                                MotivoProblemaConexionOtro: row[MotivoProblemaConexionOtroIndex],
                            })
                        })
                    }

                }else if(`Sheet${index+1}` === `Sheet7`){
                    const NombreTitularIndex = headers.indexOf('NombreTitular');
                    const DocumentoTitularIndex = headers.indexOf('DocumentoTirular');
                    const NumeroTelefonoIndex = headers.indexOf('DocumentoTirular');
                    const EmailIndex = headers.indexOf('Email');
                    const TipoServidorIndex = headers.indexOf('TipoServicio');
                    const MotivoSolicitudIndex = headers.indexOf('MotivoSolicitud');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && NombreTitularIndex !== -1 && DocumentoTitularIndex!== -1 && NumeroTelefonoIndex!== -1 && EmailIndex!== -1 && TipoServidorIndex !== -1 && MotivoSolicitudIndex!== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet7`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                nombreUser: row[NombreTitularIndex],
                                documento: row[DocumentoTitularIndex],
                                NumeroTelefono: row[NumeroTelefonoIndex],
                                email: row[EmailIndex],
                                TipoServidor: row[TipoServidorIndex],
                                Motivo: row[MotivoSolicitudIndex],
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
                    const CambioDeMegasIndex = headers.indexOf('CambioDeMegas');
                    const ServicioActualIndex = headers.indexOf('TipoDeServicioActual');
                    const PlanSolicitudIndex = headers.indexOf('PlanQueSolicita');
                    const DuracionServicioIndex = headers.indexOf('DuracionConServicio');
                    const CedulaTitularIndex = headers.indexOf('CedulaTitular');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && DescriptionCambioDelPlan !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet9`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                CambioMegas: row[CambioDeMegasIndex],
                                ServicioActual: row[ServicioActualIndex],
                                PlanSolicitado: row[PlanSolicitudIndex],
                                DuracionServicio: row[DuracionServicioIndex],
                                CedulaTitular: row[CedulaTitularIndex],
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
                    const NombrePqrsIndex = headers.indexOf('NombrePQRS');
                    const CedulaTitularIndex = headers.indexOf('DocumentoTiutar');
                    const TipoPeticionIndex = headers.indexOf('TipoPeticion');
                    const FechaPeticionIndex = headers.indexOf('FechaPeticion');
                    const MotivoPeticionIndex = headers.indexOf('MotivoPeticion');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && DescriptionPQR !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet12`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                NombrePqrs: row[NombrePqrsIndex],
                                CedulaTitular: row[CedulaTitularIndex],
                                TipoPeticion: row[TipoPeticionIndex],
                                FechaPeticion: row[FechaPeticionIndex],
                                MotivoPeticion: row[MotivoPeticionIndex],
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
                    const NombreOtroIndex = headers.indexOf('NombreOtro');
                    const DocumentoTirularIndex = headers.indexOf('DocumentoTitular');
                    const TitularServicioIndex = headers.indexOf('TitularServicio');
                    const MotivoOtroIndex = headers.indexOf('MotivoOtro');

                    if(idIndex !== -1 && NameIndex !== -1 && chatIndex !== -1 && messageIndex !== -1 && descriptionOtro !== -1){
                        rows.forEach(row => {
                            formattedData.push({
                                sheet: `Sheet15`,
                                id: row[idIndex],
                                Name: row[NameIndex],
                                chatName: row[chatIndex],
                                Message: row[messageIndex],
                                nombreOtro: row[NombreOtroIndex],
                                DocumentoTitular: row[DocumentoTirularIndex],
                                titularServicio: row[TitularServicioIndex],
                                motivoOtro: row[MotivoOtroIndex]
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
