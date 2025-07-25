import { manyChatToken } from '../config/config.js';

async function MetodoPostManychat(req, res) {
    const { suscriberID, message, chat } = req.body;
 
    let bodyContent;

    if (!suscriberID || !message ||! chat) {
        return res.status(400).json({ error: 'Faltan parametros requeridos (suscriberID, message)' });
    }

    if(chat === 'telegram' || chat === 'instagram'){
        try {
            const myHeaders = {
                'accept': 'application/json',
                'Authorization':` Bearer ${manyChatToken}`,
                'Content-Type': 'application/json',
            };

            bodyContent = JSON.stringify({
                "subscriber_id": suscriberID,
                "data": {
                  "version": "v2",
                  "content": {
                    "type": chat,
                    "messages": [
                      {
                        "type": 'text',
                        "text": message
                      }
                    ]
                  }
                },
                  "message_tag": "ACCOUNT_UPDATE"
            });

            const response = await fetch('https://api.manychat.com/fb/sending/sendContent', {
                method: 'POST',
                    headers: myHeaders,
                    body: bodyContent
            });

            if (!response.ok) {
                console.error(`Error en la consulta a ManyChat: ${response.statusText}`);
                throw new Error('Error al enviar el mensaje a ManyChat');
            }

            const data = await response.json();
            console.log('Mensaje enviado correctamente:', data);

            res.status(200).json({ message: 'Mensaje enviado correctamente', data: data });
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            res.status(500).json({
                error: 'Error al enviar el mensaje a ManyChat',
                details: error.message,
            });
        }

    } else if(chat === 'messenger') {
    console.log('Envío a Messenger:', suscriberID)

    try {
        const isUrl = typeof message === 'string' && message.startsWith('http');
        const messageType = isUrl ? 'file' : 'text';

        const raw = JSON.stringify({
            "subscriber_id": suscriberID,
            "data": {
                "version": "v2",
                "content": {
                    "messages": [
                        messageType === 'file'
                            ? { "type": "file", "url": message }
                            : { "type": "text", "text": message }
                    ]
                }
            },
            "message_tag": "ACCOUNT_UPDATE"
        });

        const myHeaders = new Headers();
        myHeaders.append("accept", "application/json");
        myHeaders.append("Authorization", `Bearer ${manyChatToken}`);
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const response = await fetch('https://api.manychat.com/fb/sending/sendContent', requestOptions);
        const data = await response.json();

        console.log('Mensaje enviado correctamente:', data);

        res.status(200).json({
            success: true,
            message: 'El mensaje fue enviado correctamente',
            data: data
        });

    } catch (error) {
        console.error('Error al enviar el mensaje a Messenger:', error);
        res.status(500).json({
            error: 'Error al enviar el mensaje a ManyChat',
            details: error.message,
        });
    }
  }
}

export default MetodoPostManychat;