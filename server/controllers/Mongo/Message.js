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
        const { contactId, message, sender, chat, idMessageClient} = req.body;
        if (!contactId || !message || !sender || !chat) {
            console.error('Campos requeridos faltantes: ', req.body);
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos en el cuerpo de la solicitud'
            });
        }
        

        if (idMessageClient) {
            const exists = await MessageScheme.findOne({ idMessageClient });
        
            if (exists) {
                return res.status(409).json({ 
                    success: false,
                    message: 'El mensaje ya está registrado.',
                });
            }
        }
        


        const newMessage = new MessageScheme({
            contactId,
            message,
            sender,
            chat,
            idMessageClient,
        });

        await newMessage.save();
        console.log('Mensaje guardadoCorrectamente: ', newMessage);
        res.status(201).json({
            success: true,
            data: newMessage,
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