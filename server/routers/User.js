import express from "express";
import { getData, insertData, getOneUserId, updateData, updateState } from "../controllers/Mongo/User.js";
import getDataFetch from '../controllers/apiControllers.js';
import getDataFetchClient from '../controllers/ApiClients.js';
import apiManychatUsers from "../controllers/apiManychatUsers.js";
import MetodoPostManychat from "../controllers/MetodoPostManychat.js";
import { getDataMessageId, postDataMessage, getDataMesage,  addMessageToConversation} from "../controllers/Mongo/Message.js";
import { AsignarUserPost, AsignarUserGet } from "../controllers/UserAleatorio/AsignarUser.js";
import WisphubApi from "../controllers/WisphubApi.js";
import { crearConversacion, getConversacionBot, updateMessage, getOneChat } from "../controllers/Mongo/MessageBotServer.js";
import { MetodoPostCloudinary, MetodoGetCloudinary } from "../controllers/cloudinary/MetodoPostCloudinary.js";
import multer from "multer";

const router = express.Router();
const path = "user";
const path1 = "api";
const path2 = "clientes";
const path3 = "manychat";
const pathMessage = 'post-message';
const pathHistoryMessage = 'message';
const pathAsignar = 'asignaciones';
const phatWisphub = 'wisphub-data';
const pathConversacion = 'conversacion-server';
const pathImage = 'image-post-message';

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage });

// Ruta para obtener datos (GET)
router.get(`/${path}`, getData);

// Ruta para insertar datos (POST)
router.post(`/${path}`, insertData);

//Ruta para buscar por id
router.get(`/${path}/:id`, getOneUserId);

//Ruta para actualizar los datos
router.put(`/${path}/:id`, updateData);

//Ruta para eliminar el usuario
router.put(`/${path}/:id/estado`, updateState);

//Rutas para la pagina
router.get(`/${path1}`, getDataFetch);
router.get(`/${path2}`, getDataFetchClient);
router.get(`/${path3}/:id`, apiManychatUsers);

//mensaje
router.post(`/${pathMessage}`, MetodoPostManychat);

//historial de mensajes
router.get(`/${pathHistoryMessage}`, getDataMesage);
router.get(`/${pathHistoryMessage}/`, getDataMessageId);
router.post(`/${pathHistoryMessage}`, postDataMessage);
router.put(`/${pathHistoryMessage}/:contactId`, addMessageToConversation);

//Asignaciones
router.post(`/${pathAsignar}/:id`, AsignarUserPost);
router.get(`/${pathAsignar}`, AsignarUserGet);

//Api wisphub
router.get(`/${phatWisphub}/:cedula`, WisphubApi);

//conversacion chatbot del servidor
router.post(`/${pathConversacion}`, crearConversacion);
router.get(`/${pathConversacion}`, getConversacionBot);
router.get(`/${pathConversacion}/:id`, getOneChat);
router.put(`/${pathConversacion}/:id/mensaje`, updateMessage);

//metodo post para imagenes en la nube
router.post(`/${pathImage}`, upload.single("file"), MetodoPostCloudinary);
router.get(`/${pathImage}`, MetodoGetCloudinary);

export default router;