import e from "express";

const uploadImage = async() => {
    try{
        const response = await fetch('',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json();
        console.log('La foto fue subida correctamente', data);
    }catch(error){
        console.error('Error al momento de subir las fotos: ', error)
    }
}