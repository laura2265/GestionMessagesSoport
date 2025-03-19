import { ApiKeyWisphub } from '../config/config.js'
import fetch from 'node-fetch';

const WisphubApi = async (req, res) => {
    const {cedula } = req.params;
    console.log('el parametro es: ', cedula)
    
    let limit = 300;
    let offset = 0;
    try {

        if(!cedula){
            return res.status(400).json({
                message : 'falata la cedula'
            })
        }
        const response = await fetch(`https://api.wisphub.net/api/clientes/?cedula=${cedula}&limit=${limit}&offset=${offset}`,{
            method: 'GET',
            headers:{
                'Authorization': `Api-Key ${ApiKeyWisphub}`
            }
        });

        if(!response.ok){
            throw new Error(`Error al consultar la cedula: ${cedula}`)
        }

        const data = await response.json()
        const clientes = data.results;

        res.status(200).json({
            message: 'Datos consultados correctamente :)',
            data:clientes
        })

    }catch (error) {
        console.error('Error al consultar ManyChat:', error);
        res.status(500).json({
            message: 'Error al consultar los datos de wisphub', 
            error: error.message 
        });
    }
};

export default WisphubApi;