import express, { response } from "express";
import routerUser from "./routers/User.js";
import connectDB from "./config/db.js";
import cors from 'cors'
import { ApiKeyWisphub, manyChatToken } from "./config/config.js";
import { loadProcessedUser, saveProcessedUser } from "./controllers/ProcesarUser.js";
import { BuscarCedulaInstagram, BuscarCedulaMessenger, BuscarCedulaTelegram } from "./controllers/BuscarCedula/BuscarCedulaUser.js";



const app = express();
const port = 3001;

app.use(cors())
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

/*
fetch("https://api.wisphub.net/api/tickets/", {
    method: 'GET',
    headers: {
      'Authorization': `Api-Key ${ApiKeyWisphub}`
    }
}).then((response) => response.json())
.then((result) => console.log(result))
.catch((error) => console.error(error));


fetch(`http://localhost:3001/api`,{
    method:'GET',
    headers:{
        'Content-Type': 'application/json'
    }
}).then((response)=> response.json())
.then((result)=> console.log(result))
.catch((error)=> console.error(error))
*/

function EmpleAssigned(idUser){
    fetch(`http://localhost:3001/asignaciones/${idUser}`,{
        method: 'POST'
    }).then((response) => response.json())
    .then((error) => console.error(error))
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
                console.log(`⚠️ El usuario ${idUser} ya tiene el problema  o motivo que es"${problem || ConsultChat}" registrado.`);
                continue;
            }

            lastProcessedId = idUser;
            processedUserSet.add(idUser);
            console.log(`✅ Nuevo registro para el usuario: ${idUser}, Problema: "${problem}"`);

            // Asignación de empleados según la hoja
            if (['Sheet1', 'Sheet2', 'Sheet3', 'Sheet4', 'Sheet5',
                 'Sheet6', 'Sheet7', 'Sheet8', 'Sheet9', 'Sheet10',
                 'Sheet11', 'Sheet12', 'Sheet13', 'Sheet14', 'Sheet15'].includes(sheets)) {
                console.log(`📄 Página ${sheets}, asignando empleado...`);
                EmpleAssigned(idUser);
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


setInterval(fetchUserData, 10000)