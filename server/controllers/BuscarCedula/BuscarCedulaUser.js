import fetch from 'node-fetch'
import { ApiKeyWisphub } from '../../config/config.js';
import { MessageService } from '../MessageService/MessageService.js';
import { MessengerPost, TelegramPost, InstagramPost } from '../MetodoPost/MetodoPost.js';

// Función genérica para búsqueda de cédula
async function buscarCedula(folder, idUser, cedula, platform) {
  console.log(`Buscando cédula para la plataforma ${platform}`);
  
  let limit = 300;
  let offset = 0;
  let found = false;
  let idAsociado = [];

  while (!found) {
    try {
      const response = await fetch(`https://api.wisphub.net/api/clientes/?cedula=${cedula}&limit=${limit}&offset=${offset}`, {
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

      if (clientes.length > 0) {
        idAsociado = idAsociado.concat(clientes.map(cliente => cliente.usuario)); 
        offset += limit;
      }

      if (clientes.length < limit) {
        found = true;
        if (idAsociado.length > 0) {
          const lista = idAsociado.join(', ');
          const messege1 = `Señor/a ${clientes[0].nombre}\nIdentificado con cédula ${clientes[0].cedula}\nUsted tiene varios servicios que son: ${lista}`;
          
          console.log(messege1);

          if (folder === 'ChatBotMessenger') {
            MessengerPost(idUser, messege1, 'buscar');
          } else if (folder === 'ChatBotTelegram') {
            TelegramPost(idUser, messege1, 'buscar');
          } else if (folder === 'ChatBotInstagram') {
            InstagramPost(idUser, messege1, 'buscar');
          }

          MessageService(folder, idUser, lista);
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

export const BuscarCedulaMessenger = (folder, idUser, cedula) => buscarCedula(folder, idUser, cedula, 'Messenger');
export const BuscarCedulaTelegram = (folder, idUser, cedula) => buscarCedula(folder, idUser, cedula, 'Telegram');
export const BuscarCedulaInstagram= (folder, idUser, cedula) => buscarCedula(folder, idUser, cedula, 'Instagram');

