const fs = require('fs').promises;
const TIME_LIMIT = 24 * 60 * 1000;
const path = ''

async function loadProcessedServiced() {
    try{
        const data = await fs.readFile('processedServiced.json', 'utf8')
        return JSON.parse(data);
    }catch(error){
        console.error('Error al procesar el archivo del servicio')
        return [ ]
    }
}

async function saveProcessedService(services){
    try{
        await fs.writeFile('processedServiced.json', JSON.stringify(services, null, 2))
        console.log('Usuario procesado y guardado correctamente')
    }catch(error){
        console.error('error al momento de guardar el servicio')
    }
}

module.exports = {saveProcessedService, loadProcessedServiced}