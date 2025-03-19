import express, { response } from "express";
import routerUser from "./routers/User.js";
import connectDB from "./config/db.js";
import cors from 'cors'
import { ApiKeyWisphub, manyChatToken } from "./config/config.js";
import { loadProcessedUser, saveProcessedUser } from "./controllers/ProcesarUser.js";
import { BuscarCedulaInstagram, BuscarCedulaMessenger, BuscarCedulaTelegram } from "./controllers/BuscarCedula/BuscarCedulaUser.js";
import { error } from "console";


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

            const consultProcessed = processedUsers.filter(user => user.id === idUser);

            // Verificar si el usuario ya tiene ese problema asignado
            const problemExists = consultProcessed.some(user => user.message === problem);

            if (problemExists) {
                console.log(`⚠️ El usuario ${idUser} ya tiene el problema "${problem}" registrado.`);
                continue;
            }

            if (!processedUsers.some(user => user.id === idUser)) {
                lastProcessedId = idUser;
                processedUserSet.add(idUser);
                console.log('Nuevo usuario registrado:', idUser);

                if(sheets === 'Sheet1'){
                    console.log('pagina 1', sheets)

                    if(item.funciono1 === 'No funciona' || item.cable === 'Cable Dañado'){
                        console.log('Hola se asignara un empleado')
                        EmpleAssigned(idUser)
                    }

                }else if(sheets === 'Sheet2'){
                    console.log('pagina 2', sheets)
                    EmpleAssigned(idUser)
                }else if(sheets === 'Sheet3'){
                    console.log('pagina 3', sheets)
                    EmpleAssigned(idUser)
                }else if(sheets === 'Sheet4'){
                    console.log('pagina 4', sheets)
                    EmpleAssigned(idUser)
                }else if(sheets === 'Sheet5'){
                    console.log('pagina 5', sheets)
                    EmpleAssigned(idUser)
                }else if(sheets === 'Sheet6'){
                    console.log('pagina 6', sheets)
                    EmpleAssigned(idUser)
                }

                processedUsers.push({ id: idUser, message: item.ProblemaInt, processedAt: new Date().toISOString()  });
                await saveProcessedUser(processedUsers);
            }
            await delay(1000);

        }

        lastProcessedId = result;
    } catch (error) {
        console.error('Error', error);
    }
}

setInterval(fetchUserData, 10000)




