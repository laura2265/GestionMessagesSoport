import { manyChatToken } from '../../config/config.js';

export function MessengerPost(idUser, messege1, mensaje1){
    if(mensaje1 === "message1"){
        console.log('entro al metodo post de messenger', idUser, "mensaje", messege1)
        const raw = ({
            "subscriber_id": idUser,
            "data": {
              "version": "v2",
              "content": {
                "messages": [
                  {
                    "type": "text",
                    "text": messege1
                  }
                ]
              }
            },
            "message_tag": "ACCOUNT_UPDATE"
        })
        fetch('https://api.manychat.com/fb/sending/sendContent',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${manyChatToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(raw)
        })
    }else if(mensaje1 === "messageButton"){

    }
}

export function TelegramPost(idUser, messege1, buscar, Service, message2){
    console.log('entro al metodo post de telegram')

    //condicion para enviar mensaje diferente
    if(buscar === 'buscar'){
        const raw = ({
            "subscriber_id": idUser,
            "data": {
                "version": "v2",
                "content": {
                    "type" : "telegram",
                    "messages": [
                      {
                        "type": "text",
                        "text": messege1
                      }
                    ]
                }
            } 
        })
        fetch('https://api.manychat.com/fb/sending/sendContent',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${manyChatToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(raw)
        })

    }else if(Service === 'message'){
        const raw = ({
            "subscriber_id": idUser,
            "data": {
                "version": "v2",
                "content": {
                    "type" : "telegram",
                    "messages": [
                      {
                        "type": "text",
                        "text": message2
                      }
                    ]
                }
            } 
        })
        fetch('https://api.manychat.com/fb/sending/sendContent',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${manyChatToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(raw)
        })
    }
}

export function InstagramPost(idUser, messege1, buscar, Service){
    console.log('entro al metodo post de instagram')

    //condicion para en viar varios mensajes de diferentes funciones
    if(buscar === 'buscar'){const raw = ({
        "subscriber_id": idUser,
        "data": {
            "version": "v2",
            "content": {
                "type" : "instagram",
                "messages": [
                  {
                    "type": "text",
                    "text": messege1
                  }
                ]
            }
        } 
    })
    fetch('https://api.manychat.com/fb/sending/sendContent',{
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${manyChatToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(raw)
    })

    }else if(Service === 'message'){const raw = ({
        "subscriber_id": idUser,
        "data": {
            "version": "v2",
            "content": {
                "type" : "instagram",
                "messages": [
                  {
                    "type": "text",
                    "text": message2
                  }
                ]
            }
        } 
    })
    fetch('https://api.manychat.com/fb/sending/sendContent',{
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${manyChatToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(raw)
    })

    }
    
}
