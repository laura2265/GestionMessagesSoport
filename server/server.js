import express from "express";
import routerUser from "./routers/User.js";
import connectDB from "./config/db.js";
import cors from 'cors';
import { manyChatToken } from "./config/config.js";
import { loadProcessedUser, saveProcessedUser } from "./controllers/ProcesarUser.js";
import { BuscarCedulaInstagram, BuscarCedulaMessenger, BuscarCedulaTelegram } from "./controllers/BuscarCedula/BuscarCedulaUser.js";
import { todo } from "node:test";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(routerUser);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

connectDB();

// Variables globales
let processedUsers = [];
const processedUserMap = new Map();

// Cargar usuarios procesados desde JSON al iniciar
(async () => {
    try {
        processedUsers = await loadProcessedUser();
        processedUsers.forEach(user => {
            if (user.id) {
                const clave = JSON.stringify({
                    motivo: user.Motivo,
                    message: user.message,
                    numDoc: user.numDoc
                });
                processedUserMap.set(user.id, clave);
            }
        });

        console.log(`✅ Procesados cargados: ${processedUserMap.size}`);

    }catch (error){
        console.error('❌ Error al cargar usuarios procesados:', error);
    }
})();

// Headers para ManyChat
const myHeaders = {
    accept: "application/json",
    Authorization: `Bearer ${manyChatToken}`
};

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

// Función para asignar empleado
function EmpleAssigned(idUser) {
    fetch(`http://localhost:3001/asignaciones/${idUser}`, {
        method: 'POST'
    })
        .then((res) => res.json())
        .then((res) => console.log(`✅ Usuario ${idUser} asignado.`))
        .catch((error) => console.error('Error durante asignación:', error));
}

// ✅ FUNCIÓN UNIFICADA
async function fetchAndProcessUsers() {
    try {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        const sheetsRes = await fetch('http://localhost:3001/api');
        if (!sheetsRes.ok) throw new Error('❌ Error en /api');
        const sheetsData = await sheetsRes.json();

        const mongoRes = await fetch('http://localhost:3001/conversacion-server');
        if (!mongoRes.ok) throw new Error('❌ Error en /conversacion-server');
        const mongoData = await mongoRes.json();
        const mongoMensajes = mongoData.data.docs;

        const allUsers = [
            ...sheetsData.map(item => ({
                tipo: 'sheets',
                idUser: item.id,
                chat: item.chatName,
                nombreUser: item.Name,
                Motivo: item.Message,
                message: item.ProblemaInt || null,
                numDoc: item.numDocTitular || null,
                ServicioDuracion: item.duracionServicio,
                descripcion: item.descripcion || {},
                sheet: item.sheet,

                //si funciono
                funciono1: item.funciono1,
                result: item.result,
                funcionoVpn: item.funcionoVpn,
                FuncionoFinal: item.FuncionoFinal,
                resultadoFinal: item.resultadoFinal,
                cable: item.cable,
                TipoDeProblemaSeñal: item.TipoDeProblemaSeñal
            })),
            ...mongoMensajes.map(item =>{
                const mensajesUsuario = item.conversacion
                    ?.filter(m => m.de === 'usuario')
                    ?.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp));
                        
                const ultimoMensaje = mensajesUsuario?.[0]?.mensaje || 'Sin mensaje';

                return {
                    tipo: 'mongo',
                    idUser: item.id,
                    nombreUser: item.usuario?.nombre || 'Sin nombre',
                    numDoc: item.usuario?.documento || '',
                    Motivo: ultimoMensaje
                };
            })
        ];

        for (const user of allUsers) {
            const { idUser, Motivo } = user;

            const claveActual = JSON.stringify({
                motivo: Motivo,
                message: user.message,
                numDoc: user.numDoc
            });

            if (processedUserMap.get(idUser) === claveActual) {
                console.log(`⚠️ Usuario ${idUser} ya procesado sin cambios`);
                continue;
            }

            // Registrar nuevo usuario procesado
            processedUserMap.set(idUser, claveActual);
            processedUsers.push({
                id: idUser,
                Motivo: Motivo || null,
                message: user.message || null,
                numDoc: user.numDoc || null,
                contactado: true,
                processedAt: new Date().toISOString()
            });

            await saveProcessedUser(processedUsers);

            if (user.tipo === 'mongo') {
                console.log(`📩 Nuevo mensaje MongoDB: ${idUser} - "${Motivo}"`);
                const conv = (mongoMensajes.find(m => m.id === idUser)?.conversacion || [])
                .filter(m => m.de === 'usuario')
                .map(m => {
                  const raw = typeof m.mensaje === 'string'
                    ? m.mensaje
                    : (m.mensaje?.text || m.mensaje?.texto || m.mensaje?.message || m.mensaje?.mensaje || '');
                  // normalización: minúsculas + sin tildes
                  const text = String(raw)
                    .toLowerCase()
                    .normalize('NFD').replace(/\p{Diacritic}/gu, '');
                  const ts = new Date(m.timeStamp || m.createdAt || 0).getTime();
                  return { ts, text };
                })
                .sort((a, b) => a.ts - b.ts);

                if (!conv.length) {
                  console.log(`Mongo: sin mensajes del usuario → No asignar`);
                  continue;
                }

                const NO_RE = /\b(no\s*funciono|no\s*funciona|no\s*sirvio|no\s*carga|sigue\s*igual)\b/;
                const SI_RE = /\b(si\s*funciono|si\s*funciona|quedo\s*listo|solucionado)\b/;

                let lastStatus = null;
                for (const m of conv) {
                  if (NO_RE.test(m.text)) lastStatus = 'NO';
                  else if (SI_RE.test(m.text)) lastStatus = 'SI';
                }

                if (lastStatus === 'NO') {
                    console.log(`Mongo: último estado = NO → Requiere soporte → Asignar`);
                    EmpleAssigned(idUser);
                } else {
                    console.log(`Mongo: último estado = ${lastStatus ?? 'ninguno'} → No asignar`);
                }

            } else if (user.tipo === 'sheets') {
                const { sheet, chat } = user;
                const chatsValidos = ['ChatBotMessenger', 'ChatBotInstagram', 'ChatBotTelegram']
                const HojasValidacion = {
                    Sheet1: 'funciono1',
                    Sheet2: 'result',
                    Sheet3: 'funcionoVpn',
                    Sheet4: 'FuncionoFinal',
                    Sheet5: 'resultadoFinal'
                }

                const asignacionDirecta = ['Sheet6', 'Sheet7', 'Sheet9', 'Sheet12', 'Sheet15'];

                // Excepciones primero
                if (sheet === 'Sheet1' && user.cable === 'Cable Dañado') {
                    console.log('🔌 Sheet1 - Cable dañado → Enviar a soporte');
                    EmpleAssigned(idUser);
                    continue;
                }

                if (sheet === 'Sheet4' && user.TipoDeProblemaSeñal === 'Otro problema') {
                    console.log('📺 Sheet4 - Otro problema → Enviar a soporte');
                    EmpleAssigned(idUser);
                    continue;
                }

                // Luego validaciones estándar
                if (Object.keys(HojasValidacion).includes(sheet)) {
                    const variable = HojasValidacion[sheet];
                
                    if (user[variable] === 'No funciono') {
                        console.log(`📄 ${sheet} - Usuario indicó que no funcionó → Soporte`);
                        EmpleAssigned(idUser);
                        continue;
                    } else {
                        console.log(`✅ ${sheet} - Problema aparentemente resuelto`);
                        continue;
                    }
                }


                if (asignacionDirecta.includes(sheet)) {
                    console.log(`📄 ${sheet} - Hoja con datos sensibles → Enviar a soporte`);
                    EmpleAssigned(idUser);
                    return;
                }
                
                // Hojas restantes o por defecto
                console.log(`📄 ${sheet} - Asignación general`);
                EmpleAssigned(idUser);
                
            }
            await delay(1000);
        }
    } catch (error) {
        console.error("❌ Error en fetchAndProcessUsers:", error);
    }
}

//Solo un intervalo ahora
setInterval(fetchAndProcessUsers, 10000);
