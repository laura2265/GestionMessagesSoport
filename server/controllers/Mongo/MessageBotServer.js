import conversacionScheme from "../../models/MessageBotServer.js";

export const getConversacionBot = async(req, res) => {
    try{

        const {page = 1, limit = 100} = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: {createdAt: -1}
        }

        const message = await conversacionScheme.paginate({}, options);
        res.status(200).json({
            succes: true,
            data: message
        });

    }catch(error){
        res.status(500).json({
            succes: false,
            message: `Error al consultar los datos de la api`,
            error: error.message,
        })
    }
}

export const getOneChat = async(req, res) =>{
    try{
        const{id} = req.params;

        const messageChat = await conversacionScheme.findOne({id});

        if(!messageChat){
            return res.status(404).json({
                success: false,
                message: `Chat con ID ${id} no encontrado`
            })
        }

        res.status(200).json({
            success: true,
            data: messageChat
        })

    }catch(error){
        res.status(500).json({
            succes: false,
            message:`Error al consultar los datos de la API`,
            error: message.error
        })
    }
}

export const crearConversacion = async (req, res) => {
    try {
        const {
          id,
          usuario,
          estadoActual,
          conversacion,
          finalizacion,
        } = req.body;

        const existingUser = await conversacionScheme.findOne({id});

        if(existingUser){
            console.log('El usuario ya existe en la base de datos.')

            return res.status.json({
                succes: false,
                message: 'El usuario ya existe en la base de datos'
            })
        }

        const nuevaConversacion = new conversacionScheme({
          id,
          usuario,
          estadoActual,
          conversacion,
          finalizacion,
        });

        const guardado = await nuevaConversacion.save();
        res.status(201).json({
          success: true,
          message: "Conversación guardada correctamente",
          data: guardado,
        });

    } catch  (error) {
        console.error("Error al guardar conversación:", error.message);
        res.status(500).json({
          success: false,
          message: "Error al guardar la conversación",    
          error: error.message,
        });
    }
};

export const ultimaConversacion = async()=>{
  try{
      const {idUser} = req.params;
      
      const conversacion = await conversacionScheme.findOne({id: idUser, }).sort({fechaUltimoMensaje: -1})
      if(!conversacion){
          return res.status(404).json({
              succes: false,
              message: 'No se encontro la conversacion'
          })
      }

      const message = conversacion.conversacion || [];
      const ultimo = message.reverse().find(m => m.de === "usuario");
      res.status(200).json({
          success: true,
          data: ultimo,
      });

  }catch(error){
      res.status(500).json({
        success: false,
        message: 'Error al consultar ultima conversacion'
      })
  }
}

export const updateMessage = async(req, res) => {
    try{
        const { id } = req.params;
        const { de, mensaje } = req.body;

        console.log('Datos recibidos del frontend: ');
        console.log('id: ', id);
        console.log('de: ', de);
        console.log('mensaje: ', mensaje);

        if(!de || mensaje === undefined || mensaje === null || mensaje === ""){
            return res.status(400).json({
                success: false,
                message: "Faltan datos necesarios para guardar el mensaje"
            });
        }

        const nuevoMensaje = {
            de,
            mensaje,
            timeStamp: new Date(),
        };

        console.log("Nuevo mensaje recibido: ", nuevoMensaje);

        const conversacion = await conversacionScheme.findOneAndUpdate(
            { id },
            {
                $push: {conversacion: nuevoMensaje},
                $set: {fechaUltimoMensaje: new Date()}
            },
            {new: true}
        );

        if(!conversacion){
            return res.status(404).json({
                success: false,
                message: `Conversacion no encontrada`
            });
        }

        res.status(200).json({
            success: true,
            data: conversacion
        });

    }catch(error){
        console.error('Error al actualizar la conversacion ', error)
        res.status(500).json({
            success: false,
            message: `Error al momento de actualizar la conversacion`,
            error: error.message
        })
    }
}