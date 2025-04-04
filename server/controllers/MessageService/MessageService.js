import fetch from 'node-fetch'
import { IdUsuarioGoogle, ApiTokenGoogle2, manyChatToken } from '../../config/config.js';
import { InstagramPost2, TelegramPost2, MessengerPost2 } from '../MetodoPost/MetodoPost2.js';

const rango1 = 'Sheet1!A:Z';
const UrlSheets2 = `https://sheets.googleapis.com/v4/spreadsheets/${IdUsuarioGoogle}/values/${rango1}?key=${ApiTokenGoogle2}`;

export async function MessageService(folder, idUser, mensaje) {
    console.log('Enviando mensaje de servicio al id: ', idUser);
    try {
        const response = await fetch(UrlSheets2);
        if (!response.ok) throw new Error('Error al consultar los datos de Google Sheets');
        
        const data = await response.json();
        const rows = data.values.slice(1); 

        const idIndex = data.values[0].indexOf('id');
        const serviceIndex = data.values[0].indexOf('servicio');
        const chatIndex = data.values[0].indexOf('chat_name');

        rows.forEach(row => {
            const id = row[idIndex];
            const service = row[serviceIndex];
            const chat = row[chatIndex];
            
            if (id === idUser) {
                console.log(`Coincidencia de ID encontrada para usuario: ${id}`);
                if(folder === 'ChatBotMessenger'){
                    console.log('entro al chat ', folder)
                    if(folder === chat){
                        console.log('los caht son compatibles :)', chat)
                        const message2 = 'Entro al metodo post de messenger'
                        MessengerPost2(idUser, message2)
                    }

                }else if(folder === 'ChatBotTelegram'){
                    console.log('entro al chat ', folder)
                    if(folder === chat){
                        console.log('los chats son compatibles :)', chat)
                        const message2 = 'Entro al metodo post de Telegram'
                        TelegramPost2(idUser, message2)
                    }
                    
                }else if(folder === 'ChatBotInstagram'){
                    console.log('entro al chat ', folder)
                    if(folder === chat){
                        console.log('los chats son compatibles :)', chat)
                        const message2 = 'Entro al metodo post de Instagram'
                        InstagramPost2(idUser, message2)
                    }
                }else{
                    console.log('ese chat no existe')
                }
            }
        });
    } catch (error) {
        console.error('Error en el servicio de mensajes:', error);
    }
}

