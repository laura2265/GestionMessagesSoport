import { manyChatToken } from '../../config/config.js';

export function MessengerPost2(idUser, messege2){
    console.log('entro al metodo post de messenger')

        const raw = ({
            "subscriber_id": idUser,
            "data": {
                "version": "v2",
                "content": {
                    "type" : "telegram",
                    "messages": [
                      {
                        "type": "text",
                        "text": messege2
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

export function TelegramPost2(idUser, messege2){
    console.log('entro al metodo post de messenger')

        const raw = ({
            "subscriber_id": idUser,
            "data": {
                "version": "v2",
                "content": {
                    "type" : "telegram",
                    "messages": [
                      {
                        "type": "text",
                        "text": messege2
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

export function InstagramPost2(idUser, messege2){
    console.log('entro al metodo post de instagram')

        const raw = ({
        "subscriber_id": idUser,
        "data": {
            "version": "v2",
            "content": {
                "type" : "instagram",
                "messages": [
                  {
                    "type": "text",
                    "text": messege2
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
