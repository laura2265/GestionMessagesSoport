import express, { response } from "express";
import routerUser from "./routers/User.js";
import connectDB from "./config/db.js";
import cors from 'cors'
import { ApiKeyWisphub, manyChatToken } from "./config/config.js";
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
let lastProcessedId = null;
const processedUserSet = new Set();

// Configuración de Headers y opciones para ManyChat
const myHeaders = {
    accept: "application/json",
    Authorization: `Bearer ${manyChatToken}`
};

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

function EmpleAssigned(idUser){
    fetch(`http://localhost:3001/asignaciones/${idUser}`,{
        method: 'POST'
    }).then((response) => response.json())
    .then((error) => console.error(error))
}

async function fetchMessagesMongo() {
    try{
        const response = await fetch('http://localhost:3001/conversacion-server');
        if(!response.ok){
            throw new Error('Error al consultar mensajes de MongoDB')
        }

        const mensajesJson = await response.json();
        const mensajes = mensajesJson.data.docs;
        console.log('la conversacion es: ', mensajes)
        console.log('✅ Mensajes recibidos:', mensajes);

        processedUsers = await loadProcessedUser();

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

        for(const mensaje of mensajes){
            const{id, chat, message} = mensaje;
            
            const ProccesedUser = processedUsers.some(user =>
                user.id === id &&
                user.message === message &&
                user.contactado === true
            );

            if(ProccesedUser){
                console.log(`Usted ${id} ya fue procesado por el mensaje "${message}"`)
                continue;
            }

            console.log(`Nuevo mensaje de MongoDB -Usuario: ${id}, Chat: ${chat}, Mensaje: ${message}`)

            processedUsers.push({
                id,
                Motivo: null,
                message,
                contactado: true,
                processedAt: new Date().toISOString()
            });

            await saveProcessedUser(processedUsers);
            await delay(1000);
        }

    }catch(error){
        console.error('Error al consultar los datos de la api:', error);
    }
}

async function fetchUserData() {
    try {
        const response = await fetch('http://localhost:3001/api');
        if (!response.ok) throw new Error('Error en la solicitud');

        const result = await response.json();
        processedUsers = await loadProcessedUser();

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        for (const item of result){
            const idUser = item.id;
            const sheets = item.sheet;
            const problem = item.ProblemaInt;
            const ConsultChat = item.Message;

            const consultProcessed = processedUsers.filter(user => user.id === idUser);
            const problemExists = consultProcessed.some(user => user.message === problem  || user.Motivo === ConsultChat);

            if (problemExists) {
                console.log(`⚠️ El usuario ${idUser} ya tiene el problema  o motivo que es"${problem ||ConsultChat}" registrado.`);
                continue;
            }

            lastProcessedId = idUser;
            processedUserSet.add(idUser);
            console.log(`✅ Nuevo registro para el usuario: ${idUser}, Problema: "${problem}"`);

            // Asignación de empleados según la hoja
            if (['Sheet1', 'Sheet2', 'Sheet3', 'Sheet4', 'Sheet5',
                 'Sheet6', 'Sheet7', 'Sheet8', 'Sheet10',
                 'Sheet11', 'Sheet12', 'Sheet13', 'Sheet14', 'Sheet15'].includes(sheets)) {
                console.log(`📄 Página ${sheets}, asignando empleado...`);
                EmpleAssigned(idUser);
 
            }else if(['Sheet9'].includes(sheets)){
                const nombreUser = item.Name;
                const NameChat = item.chatName;
                const messageProblem = item.Message;
                const ServicioDuracion = item.duracionServicio;
                const NameTitular = item.descripcion.Nombre;
                const DocumentoTitular = item.descripcion.Documento;
                const ServicioTitular = item.descripcion.Servicio;
                const MotivoCambio = item.descripcion.Motivo;

                const userData = {
                    idUser,
                    nombreUser,
                    NameChat,
                    messageProblem,
                    ServicioDuracion,
                    NameTitular,
                    DocumentoTitular,
                    ServicioTitular,
                    MotivoCambio
                }

                if(NameChat === 'ChatBotMessenger'){
                    console.log(`Cambio de plan id: ${idUser}, nombre ${nombreUser}, Nombre chat ${NameChat}, mensaje: ${messageProblem}, duracion ${ServicioDuracion}, descripcion: nombre titular${NameTitular}, docuemnto titular: ${DocumentoTitular}, servicio ${ServicioTitular}, motivo: ${MotivoCambio} `);

                    if(ServicioDuracion === "0 - 6 meses"){
                        console.log('Usted debe tener más de 6 meses, sin embargo te vamos a pasar a soporte');
                        EmpleAssigned(idUser);
                    }else if(ServicioDuracion === "6 meses - 1 año"){
                        console.log('duracion media');
                    }else if(ServicioDuracion === "1 año o mas"){
                        console.log('Vamos a confirmar unos datos y te verificamos el proceso');
                        BuscarCedulaMessenger(userData);
                    }else{
                        console.log("no pusiste respuesta");
                    }

                }else if(NameChat === "ChatBotInstagram"){
                    console.log(`Cambio de plan id: ${idUser}, nombre ${nombreUser}, Nombre chat ${NameChat}, mensaje: ${messageProblem}, duracion ${ServicioDuracion}, descripcion: nombre titular${NameTitular}, docuemnto titular: ${DocumentoTitular}, servicio ${ServicioTitular}, motivo: ${MotivoCambio} `)

                    if(ServicioDuracion === "0 - 6 meses"){
                        console.log('Usted debe tener más de 6 meses, sin embargo te vamos a pasar a soporte');
                        EmpleAssigned(idUser);
                    }else if(ServicioDuracion === "6 meses - 1 año"){
                        console.log('duracion media');
                    }else if(ServicioDuracion === "1 año o mas"){
                        console.log('Vamos a confirmar unos datos y te verificamos el proceso');
                        BuscarCedulaMessenger(userData);
                    }else{
                        console.log("no pusiste respuesta");
                    }

                }else if(NameChat === "ChatBotTelegram"){
                    console.log(`Cambio de plan id: ${idUser}, nombre ${nombreUser}, Nombre chat ${NameChat}, mensaje: ${messageProblem}, duracion ${ServicioDuracion}, descripcion: nombre titular${NameTitular}, docuemnto titular: ${DocumentoTitular}, servicio ${ServicioTitular}, motivo: ${MotivoCambio} `)

                    if(ServicioDuracion === "0 - 6 meses"){
                        console.log('Usted debe tener más de 6 meses, sin embargo te vamos a pasar a soporte');
                        EmpleAssigned(idUser);
                    }else if(ServicioDuracion === "6 meses - 1 año"){
                        console.log('duracion media');
                    }else if(ServicioDuracion === "1 año o mas"){
                        console.log('Vamos a confirmar unos datos y te verificamos el proceso');
                        BuscarCedulaMessenger(userData);
                    }else{
                        console.log("no pusiste respuesta");
                    }
                }
            }

            processedUsers.push({
                id: idUser,
                Motivo: ConsultChat,
                message: problem || null,
                processedAt: new Date().toISOString()
            });

            await saveProcessedUser(processedUsers);
            await delay(1000);
        }

        lastProcessedId = result;
    } catch (error) {
        console.error('❌ Error en fetchUserData:', error); 
    }
}

setInterval(fetchUserData, 10000);
setInterval(fetchMessagesMongo, 10000);