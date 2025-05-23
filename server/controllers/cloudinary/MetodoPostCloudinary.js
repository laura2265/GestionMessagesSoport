import {v2 as cloudinary} from 'cloudinary';
import { unlink } from "fs/promises";
import { nameCloud, imageApiKey, imageApiKeySecret } from "../../config/config.js";

cloudinary.config({
    cloud_name: nameCloud,
    api_key: imageApiKey,
    api_secret: imageApiKeySecret,
});

export const MetodoPostCloudinary = async(req, res) => {
    try{
        const path = req.file.path;
        const result = await cloudinary.uploader.upload(path,{
            folder: 'imagenes'
        });

        await unlink(path);

        res.status(200).json({
            success: true,
            message: "imagen subida correctamente",
            data: result,
        })

    }catch(error){
        console.error('Error al subir la imagen: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen',
            error: error.message
        })
    }
}

export const MetodoGetCloudinary = async(req, res) => {
    try{
        const {page = 1, limit = 100 } = req.query;
        const options = {
            page:parseInt(page),
            limit: parseInt(limit),
            sort: {createdAt: - 1}
        }

        const image = await cloudinary.paginate({}, options);
        res.status(200).json({
            success: true,
            data: image
        })

    }catch(error){
        res.status(500).json({
            success: false,
            message: `Error al consultar los datos de cloudinary`
        })
    }
}