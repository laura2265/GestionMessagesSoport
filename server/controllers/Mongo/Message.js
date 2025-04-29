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
        const existingUser = await MessageScheme.findOne({ $or: {_id, contactId} });

        if(existingUser){
            return res.status(404).json({
                success: false,
                message: 'El usuario ya existe con el mismo id'
            })
        }

        const {
            contactId,
            usuario, 
            conversacion,
            chat,
        } = req.body

        const newMessage = new MessageScheme({
            contactId,
            usuario,
            conversacion,
            chat,
        });

        const guardado = await newMessage.save();
        console.log('Mensaje guardadoCorrectamente: ', newMessage);
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