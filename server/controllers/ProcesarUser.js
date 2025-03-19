import fs from 'fs/promises'
const TIME_LIMIT = 24 * 60 * 60;
const path = './processedUser.json';

export async function loadProcessedUser(){
    try {
        const data = await fs.readFile(path, 'utf-8');
        console.log('Usuarios procesados y cargados correctamente');
        return JSON.parse(data);
    } catch (error) {
        console.error('No se pudo cargar los datos del usuario ', error);
        return [];
    }
}

export async function saveProcessedUser(data) {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2));
        console.log('Listado de usuarios procesados guardados');
    } catch (error) {
        console.error('Error al guardar los usuarios procesados', error);
    }
}

