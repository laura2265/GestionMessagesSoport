import express from "express";
import routerUser from "./routers/User.js";
import connectDB from "./config/db.js";
import cors from 'cors';
import { manyChatToken } from "./config/config.js";
import { loadProcessedUser, saveProcessedUser } from "./controllers/ProcesarUser.js";
import { BuscarCedulaInstagram, BuscarCedulaMessenger, BuscarCedulaTelegram } from "./controllers/BuscarCedula/BuscarCedulaUser.js";

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
const processedUserSet = new Set();

// Cargar usuarios procesados desde JSON al iniciar
(async () => {
    try {
        processedUsers = await loadProcessedUser();
        processedUsers.forEach(user => {
            if (user.id) processedUserSet.add(user.id);
        });
        console.log(`✅ Procesados cargados: ${processedUserSet.size}`);
    } catch (error) {
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

        // 1. Fetch Google Sheets
        const sheetsRes = await fetch('http://localhost:3001/api');
        if (!sheetsRes.ok) throw new Error('❌ Error en /api');
        const sheetsData = await sheetsRes.json();

        // 2. Fetch MongoDB
        const mongoRes = await fetch('http://localhost:3001/conversacion-server');
        if (!mongoRes.ok) throw new Error('❌ Error en /conversacion-server');
        const mongoData = await mongoRes.json();
        const mongoMensajes = mongoData.data.docs;

        // 3. Unir datos
        const allUsers = [
            ...sheetsData.map(item => ({
                tipo: 'sheets',
                idUser: item.id,
                chat: item.chatName,
                nombreUser: item.Name,
                Motivo: item.ProblemaInt || item.Message || '',
                ServicioDuracion: item.duracionServicio,
                descripcion: item.descripcion || {},
                sheet: item.sheet
            })),
            ...mongoMensajes.map(item => ({
                tipo: 'mongo',
                idUser: item.id,
                chat: item.chat,
                Motivo: item.message
            }))
        ];

        // 4. Procesamiento
        for (const user of allUsers) {
            const { idUser, Motivo } = user;

            // ❗ Nueva validación con Set
            if (processedUserSet.has(idUser)) {
                console.log(`⚠️ Usuario ${idUser} ya procesado`);
                continue;
            }

            // Registrar nuevo usuario procesado
            processedUserSet.add(idUser);
            processedUsers.push({
                id: idUser,
                Motivo: Motivo || null,
                message: Motivo || null,
                contactado: true,
                processedAt: new Date().toISOString()
            });

            await saveProcessedUser(processedUsers);

            if (user.tipo === 'mongo') {
                console.log(`📩 Nuevo mensaje MongoDB: ${idUser} - "${Motivo}"`);

            } else if (user.tipo === 'sheets') {
                const { chat, ServicioDuracion, descripcion, sheet } = user;
                const chatsValidos = ['ChatBotMessenger', 'ChatBotInstagram', 'ChatBotTelegram'];

                if (['Sheet1','Sheet2','Sheet3','Sheet4','Sheet5','Sheet6','Sheet7','Sheet8','Sheet10','Sheet11','Sheet12','Sheet13','Sheet14','Sheet15'].includes(sheet)) {
                    console.log(`📄 Asignando por hoja ${sheet}`);
                    EmpleAssigned(idUser);
                    continue;
                }

                if (sheet === 'Sheet9' && chatsValidos.includes(chat)) {
                    switch (ServicioDuracion) {
                        case "0 - 6 meses":
                            console.log('⏳ Menos de 6 meses → Asignar');
                            EmpleAssigned(idUser);
                            break;

                        case "6 meses - 1 año":
                            console.log('⏳ Duración media → puedes decidir qué hacer');
                            break;

                        case "1 año o mas":
                            console.log('✅ Más de 1 año → verificar datos');
                            const userData = {
                                idUser,
                                ...user,
                                ...descripcion
                            };

                            if (chat === 'ChatBotMessenger') await BuscarCedulaMessenger(userData);
                            else if (chat === 'ChatBotInstagram') await BuscarCedulaInstagram(userData);
                            else if (chat === 'ChatBotTelegram') await BuscarCedulaTelegram(userData);
                            break;

                        default:
                            console.log('⚠️ Duración de servicio no válida');
                    }
                }
            }
            await delay(1000);
        }

    } catch (error) {
        console.error("❌ Error en fetchAndProcessUsers:", error);
    }
}

// ⏲️ Solo un intervalo ahora
setInterval(fetchAndProcessUsers, 10000);
