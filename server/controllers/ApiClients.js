import fetch from 'node-fetch';
import { ApiKeyWisphub } from '../config/config.js';

 const getDataFetchClient = async (req, res) => {
    const cedula = '1012408418';
    const limit = 300;
    let offset = 0;
    let found = false;
    let serviceAsociados = [];

    while (!found) {
        try {
            const response = await fetch(`https://api.wisphub.net/api/clientes/?cedula=${cedula}&offset=${offset}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Api-Key ${ApiKeyWisphub}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al consultar la API de Wisphub');
            }

            const data = await response.json();
            const result = data.results;

            const cliente = result.filter(cliente => cliente.cedula === cedula);

            serviceAsociados.push(...cliente);

            if (result.length < limit) {
                found = true; 
            } else {
                offset += limit;
            }
        } catch (error) {
            console.error('Error al consultar los datos de la API:', error);
            return res.status(500).json({ message: 'Error al consultar los datos de la API de Wisphub' });
        }
    }

    if (serviceAsociados.length > 0) {
        res.status(200).json({
            message: `Cliente encontrado con ${serviceAsociados.length} servicio(s) asociado(s).`,
            servicios: serviceAsociados
        });
    } else {
        res.status(404).json({ message: 'Cliente no encontrado en la base de datos.' });
    }
};

 export default getDataFetchClient
