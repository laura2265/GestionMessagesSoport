import { timeStamp } from 'console';
import MessageScheme from '../../models/Message.js'


export const getDataMessageId = async (req, res) => {
    const { contactId, chat } = req.query;
    try {
        const messages = await MessageScheme.find({ contactId, chat }).sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            message: messages,
        });

    } catch (error) {
        console.error('Error al buscar mensajes:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al buscar mensajes',
            error: error.message,
        });
    }
};

export const getDataMesage = async(req, res) => {
    try{
        const {page = 1, limit = 100} = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1}
        }

        const messages = await MessageScheme.paginate({}, options)

        res.status(200).json({
            success: true,
            data: messages
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error al momento de consultar los datos de la api ',
            error: error.message
        })
    }
}

export const postDataMessage = async(req, res) => {
    try{
        const {
            contactId,
            usuario,
            messages,
            chat,
        } = req.body;

        const existingUser = await MessageScheme.findOne({ $or: [{ contactId }] });

        if(existingUser){
            return res.status(404).json({
                success: false,
                message: 'El usuario ya existe con el mismo id'
            })
        }

        const newMessage = new MessageScheme({
            contactId,
            usuario,
            messages,
            chat,
        });

        const guardado = await newMessage.save();
        console.log('Mensaje guardadoCorrectamente: ', guardado);
        res.status(201).json({
            success: true,
            data: guardado,
        })
    }catch(error){
        console.error('Error al momento de guardar el mensaje');
        res.status(500).json({
            success: false,
            message: 'Error al momento de guardar el mensaje',
            error: error.message
        })
    }
}

export const addMessageToConversation = async(req, res) => {
    try{
        const {contactId} = req.params;
        const {messages} = req.body;

        if(!messages || !Array.isArray(messages) || messages.length === 0 ){
            return res.status(400).json({
                success: false,
                message: 'No se recibió ningún mensaje'
            });
        }

        const {sender, message, idMessageClient} = messages[0];

        if(!sender || !message || !idMessageClient){
            return res.status(400).json({
                success: false,
                message: 'Faltan datos para subir el mensaje'
            })
        }

        const newMessage = {
            sender,
            messages,
            idMessageClient,
            timeStamp: new Date(),
        }

        console.log('Nuevo mensaje recibido: ', newMessage)

        const UploadNewConversation = await MessageScheme.findOneAndUpdate(
            {contactId},
            {
                $push: { messages: newMessage}
            },
            {new: true}
        );

        if(!UploadNewConversation){
            return res.status(404).json({
                success: false,
                message: 'Conversacion no encontrada'
            })
        }

        res.status(200).json({
            success: true,
            data: UploadNewConversation
        })

    }catch(error){
        console.error('Error al momento de subir la conversacion: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir los mensajes a la converscion: ', error
        })
    }
}