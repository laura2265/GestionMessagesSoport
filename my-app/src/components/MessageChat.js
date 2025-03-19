import { useEffect, useRef, useState } from "react";
import Notificacion from '../assets/sounds/Notificacion.mp3';

function MessageChat() {
    const lastMessagesRef = useRef({});
    const audioRef = useRef(new Audio(Notificacion))
    const [notificacions, setNotificacions] = useState([]);

    const [audioEnabled, setAudioEnabled] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(async () => {

            try {
                const EmpleId = localStorage.getItem('UserId');
                const responseEmple = await fetch(`http://localhost:3001/asignaciones/`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!responseEmple.ok) {
                    throw new Error('Error al momento de consultar los datos del empleado');
                }

                const resultEmple = await responseEmple.json();
                const dataEmple = resultEmple.data.docs;

                const assignedEmple = dataEmple.filter((emple) => emple.idEmple === EmpleId);
                if (assignedEmple && assignedEmple.length > 0) {
                    let newMessages = {};
                    let newNotifications = [];

                    for (let i = 0; i < assignedEmple.length; i++) {
                        const user = assignedEmple[i];
                        const chatId = user.cahtId;
                        let chatuser = 'desconocido';

                        if(user.chatName === 'ChatBotMessenger'){
                            chatuser = 'messenger'
                        }else if(user.chatName === 'ChatBotTelegram'){
                            chatuser = 'telegram'
                        }else if(user.chatName === 'ChatBotInstagram'){
                            chatuser = 'instagram'
                        }

                        const responseMany = await fetch(`http://localhost:3001/manychat/${chatId}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        if (!responseMany.ok) {
                            throw new Error('Error al momento de consultar los datos de Manychat');
                        }

                        const resultMany = await responseMany.json();
                        const dataMany = resultMany.cliente.data;
                        const messageText = dataMany.last_input_text;

                        const messageUrL = messageText.includes('cdn.fbsbx.com')
                        const messageUrl1 = messageText.includes('scontent.xx.fbcdn.net')

                        if(messageUrL){
                            const messageId = `${dataMany.subscribed}-${messageText?.slice(388,396)}`
                            const responseGetMessage = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`,{
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })

                            if(!responseGetMessage.ok){
                                throw new Error('Error al momento de consultar los datos de la base de datos')
                            }
    
                            const resultGetMessage = await responseGetMessage.json();
                            const dataGetMessage = resultGetMessage.data.docs;
                            const messageExists = dataGetMessage.some(msg => msg.idMessageClient === messageId)

                            if(!messageExists){
                                const responseMessage = await fetch(`http://localhost:3001/message/`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        contactId: chatId,
                                        message: messageText,
                                        sender: 'Cliente',
                                        chat: chatuser,
                                        idMessageClient: messageId
                                    }),
                                });

                                if(!responseMessage.ok){
                                    throw new Error('Error al momento de guardar el mensaje')
                                }

                                newNotifications.push({
                                    contactId: chatId,
                                    message: messageText,
                                    sender: 'Cliente',
                                    chat: chatuser,
                                    nombre: user.nombreClient
                                })

                                lastMessagesRef.current[chatId] = messageText;
                            }
                        }else if(messageUrl1){

                            const messageId = `${dataMany.subscribed}-${messageText?.slice(369,380)}`
                            const responseGetMessage = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`,{
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })

                            if(!responseGetMessage.ok){
                                throw new Error('Error al momento de consultar los datos de la base de datos')
                            }

                            const resultGetMessage = await responseGetMessage.json();
                            const dataGetMessage = resultGetMessage.data.docs;
                            const messageExists = dataGetMessage.some(msg => msg.idMessageClient === messageId)

                            if(!messageExists){
                                const responseMessage = await fetch(`http://localhost:3001/message/`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        contactId: chatId,
                                        message: messageText,
                                        sender: 'Cliente',
                                        chat: chatuser,
                                        idMessageClient: messageId
                                    }),
                                });

                                if(!responseMessage.ok){
                                    throw new Error('Error al momento de guardar el mensaje')
                                }

                                newNotifications.push({
                                    contactId: chatId,
                                    message: messageText,
                                    sender: 'Cliente',
                                    chat: chatuser,
                                    nombre: user.nombreClient
                                })

                                lastMessagesRef.current[chatId] = messageText;
                            }
                        }else{
                            const messageId = `${dataMany.subscribed}-${messageText?.slice(0,10)}`
                            const responseGetMessage = await fetch(`http://localhost:3001/message/?contactId=${chatId}&chat=${chatuser}`,{
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
    
                            if(!responseGetMessage.ok){
                                throw new Error('Error al momento de consultar los datos de la base de datos')
                            }
    
                            const resultGetMessage = await responseGetMessage.json();
                            const dataGetMessage = resultGetMessage.data.docs;
                            const messageExists = dataGetMessage.some(msg => msg.idMessageClient === messageId)
    
                            if(!messageExists){
                                const responseMessage = await fetch(`http://localhost:3001/message/`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        contactId: chatId,
                                        message: messageText,
                                        sender: 'Cliente',
                                        chat: chatuser,
                                        idMessageClient: messageId
                                    }),
                                });
    
                                if(!responseMessage.ok){
                                    throw new Error('Error al momento de guardar el mensaje')
                                }
    
                                newNotifications.push({
                                    contactId: chatId,
                                    message: messageText,
                                    sender: 'Cliente',
                                    chat: chatuser,
                                    nombre: user.nombreClient
                                })
                                lastMessagesRef.current[chatId] = messageText;
                            }
                        }
                    }

                    if (newNotifications.length > 0) {
                        setNotificacions(prev => [...prev, ...newNotifications]);

                        audioRef.current.play().catch(error => {
                            console.log('Error al reproducir el sonido:', error);
                        });

                        setTimeout(() => {
                            setNotificacions(prev => prev.slice(1));
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error(`Error al consultar los datos: ${error}`);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [audioEnabled]);

    return (
        <>
            <div className="notificacion-container">
                {notificacions.map((notif, index) =>{
                    const imgUrl = notif.message.includes('scontent.xx.fbcdn.net')
                    const audioUrl = notif.message.includes('cdn.fbsbx')
                    if(imgUrl){
                        return(
                            <div key={index} className="notificacion">
                                <p>📩  {notif.nombre}:</p>
                                <img src={notif.message}/>
                            </div>
                        )
                    }else if(audioUrl){
                        return(
                            <div key={index} className="notificacion">
                                <p>📩  {notif.nombre}:</p>
                                <audio controls>
                                    <source src={notif.message} type="audio/mpeg"></source>
                                </audio>
                            </div>
                        )
                    }else{
                        return(
                            <div key={index} className="notificacion">
                                <p>📩  {notif.nombre}:</p>
                                <p>{notif.message}</p>
                            </div>
                        )
                    }
                })}
            </div>
        </>
    );
}

export default MessageChat;
