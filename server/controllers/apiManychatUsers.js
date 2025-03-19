import fetch from 'node-fetch';
import { manyChatToken } from '../config/config.js';

const apiManychatUsers = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('el parametro es: ', id)

        if(!id){
            return res.status(400).json({
                message : 'falata el ID'
            })
        }

        const response = await fetch(`https://api.manychat.com/fb/subscriber/getInfo?subscriber_id=${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${manyChatToken}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Error al consultar los datos de ManyChat para el ID ${id}`);
        }

        const data = await response.json();
        console.log('los daticos de manychat son: ', data)

        if (!data || Object.keys(data).length === 0) {
            return res.status(404).json({
                message: `No se encontraron datos asociados al ID: ${id}`,
            });
        }

        // Enviar la respuesta con los datos obtenidos
        res.status(200).json({
            message: 'Datos obtenidos correctamente',
            cliente: data,
        });

    }catch (error) {
        console.error('Error al consultar ManyChat:', error);
        res.status(500).json({ message: 'Error al consultar los datos de ManyChat', error: error.message });
    }
};

export default apiManychatUsers;
