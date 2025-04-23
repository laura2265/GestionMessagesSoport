import express from "express";
import { getData, insertData, getOneUserId, updateData, updateState } from "../controllers/Mongo/User.js";
import getDataFetch from '../controllers/apiControllers.js';
import getDataFetchClient from '../controllers/ApiClients.js';
import apiManychatUsers from "../controllers/apiManychatUsers.js";
import MetodoPostManychat from "../controllers/MetodoPostManychat.js";
import { getDataMessageId, postDataMessage, getDataMesage } from "../controllers/Mongo/Message.js";
import { AsignarUserPost, AsignarUserGet } from "../controllers/UserAleatorio/AsignarUser.js";
import WisphubApi from "../controllers/WisphubApi.js";
import { crearConversacion, getConversacionBot, updateMessage } from "../controllers/Mongo/MessageBotServer.js";
import {uploadImage, upload} from "../config/cloudinary.js";

const router = express.Router();
const path = "user";
const path1 = "api";
const path2 = "clientes";
const path3 = "manychat";
const pathMessage = 'post-message';
const pathHistoryMessage = 'message'
const pathAsignar = 'asignaciones';
const phatWisphub = 'wisphub-data';
const pathConversacion = 'conversacion-server'
const pathUploadImage = 'upload-image';

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
router.post(`/${pathMessage}`, MetodoPostManychat)

//historial de mensajes
router.get(`/${pathHistoryMessage}`, getDataMesage)
router.get(`/${pathHistoryMessage}/`, getDataMessageId)
router.post(`/${pathHistoryMessage}`, postDataMessage)

//Asignaciones
router.post(`/${pathAsignar}/:id`, AsignarUserPost);
router.get(`/${pathAsignar}`, AsignarUserGet);

//Api wisphub
router.get(`/${phatWisphub}/:cedula`, WisphubApi)

//conversacion chatbot del servidor
router.post(`/${pathConversacion}`, crearConversacion);
router.get(`/${pathConversacion}`, getConversacionBot);
router.put(`/${pathConversacion}/:id/mensaje`, updateMessage);

//subir imagenes a la nube
router.post(`/${pathUploadImage}`, upload.single('file'), uploadImage )

export default router;