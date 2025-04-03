import fetch from 'node-fetch'
import { ApiKeyWisphub } from '../../config/config.js';
import { MessageService } from '../MessageService/MessageService.js';
import { MessengerPost, TelegramPost, InstagramPost } from '../MetodoPost/MetodoPost.js';

function EmpleAssigned(idUser){
  fetch(`http://localhost:3001/asignaciones/${idUser}`,{
      method: 'POST'
  }).then((response) => response.json())
  .then((error) => console.error(error))
}

// Función genérica para búsqueda de cédula
async function buscarCedula(userData, platform) {
  console.log(`Buscando cédula para la plataforma ${platform}`);

  const {idUser, nombreUser, NameChat, messageProblem, ServicioDuracion, NameTitular, DocumentoTitular, ServicioTitular, MotivoCambio} = userData

  console.log("datos", nombreUser, "nombre chat", NameChat, "mensaje", messageProblem, "servicio duracion", ServicioDuracion, "Nombre Titular", NameTitular, "Servicio titular", ServicioTitular, "motivo del cambio", MotivoCambio)

  let limit = 300;
  let offset = 0;
  let found = false;
  let idAsociado = [];

  while (!found) {
    try {
      const response = await fetch(`https://api.wisphub.net/api/clientes/?cedula=${DocumentoTitular}&limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `Api-Key ${ApiKeyWisphub}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al momento de consultar los datos de la API de Wisphub');
      }

      const data = await response.json();
      const clientes = data.results;
      console.log('data client ', clientes);
      if (clientes.length > 0) {
        idAsociado = idAsociado.concat(clientes.map(cliente => cliente.usuario)); 
        offset += limit;
      }

      if (clientes.length < limit) {
        found = true;
        if (idAsociado.length > 0) {
          const lista = idAsociado.join(', ');
          const messege1 = `Señor/a ${clientes[0].nombre}\nIdentificado con cédula ${clientes[0].cedula}\nUsted tiene varios servicios que son: ${lista}`;
          
          if(clientes[0].estado_facturas === 'Pagadas'){
            console.log('Facturas pagadas correctamente, te pasaremos')

          }else if(clientes[0].estado_facturas === "Pendiente de Pago"){
            console.log('Tines facturas pendientes.')
            EmpleAssigned(idUser)
          }
          
          console.log(messege1);

          if (NameChat === 'ChatBotMessenger') {
            MessengerPost(idUser, messege1, 'buscar');
          } else if (NameChat === 'ChatBotTelegram') {
            TelegramPost(idUser, messege1, 'buscar');
          } else if (NameChat === 'ChatBotInstagram') {
            InstagramPost(idUser, messege1, 'buscar');
          } 

          MessageService(NameChat, idUser, lista);
        } else {
          console.log('No se encontraron servicios asociados a la cédula:', cedula);
        }
      }
    } catch (error) {
      console.error('Error al obtener los datos de Wisphub:', error);
      found = true;
    }
  }
}

export const BuscarCedulaMessenger = (userData) => buscarCedula(userData, 'Messenger');
export const BuscarCedulaTelegram = (userData) => buscarCedula(userData, 'Telegram');
export const BuscarCedulaInstagram= (userData) => buscarCedula(userData, 'Instagram');

