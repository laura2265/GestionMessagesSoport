import mongoose, { model } from 'mongoose';
import User from '../../models/User.js';

//Buscar Todos los usuarios
export const getData = async (req, res) => {
    try {
        
        const {page = 1, limit = 100 } = req.query;
        const options={
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1},
        }
        const users = await User.paginate({},options);

        res.status(200).json({
            success: true,
            data: users,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al consultar los datos de MongoDB',
            error: error.message,
        });
    }
};

//Buscar usuario por ID
export const getOneUserId = async(req, res)=>{
    try{
        const { id } = req.params
        const user = await User.findById(id)
        if(!user){
            return res.status(404).json({
                success: false,
                message: `Usuario con ID ${id} no encontrado`
            })
        }
        res.status(200).json({
            success: true,
            data: user
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: 'Error al consultar el usuario por id',
            error: err.message,
        })
    }
}



export const insertData = async (req, res) => {
    console.log("Datos recibidos en la solicitud:", req.body);
    try {
        const { tipoDocument, numberDocument, name, lasName, email, password, rol, telefono, direccion, estado,cargo, area } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { numberDocument }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "El usuario ya existe con el mismo correo electrónico o número de documento.",
            });
        }

        const newUser = new User({
          tipoDocument,
          numberDocument,
          name,
          lasName,
          email,
          password,
          rol,
          telefono,
          direccion,
          estado,
          cargo,
          area
        });

        await newUser.save(); 

        res.status(201).json({
            success: true,
            message: "Usuario y rol creado exitosamente",
            data: newUser,
        });

    } catch (error) {
        console.error("Error general detectado:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al insertar datos en MongoDB",
            error: error.message,
        });
    }
};

//Actualizar Usuario
export const updateData = async (req, res) => {
    try{
        const { id } = req.params;
        const updates = req.body
        const updatedUser = await User.findByIdAndUpdate(id, updates,{
            new: true,
            runValidators: true,
        })

        if(!updatedUser){
            return res.status(404).json({
                success: false,
                message: `Usuario con ID ${id}, no se encontro`
            })
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: updatedUser, 
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error al actualizar los datos del usuario',
            error: error.message,
        })
    }
}

export const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `El id no es válido`
            });
        }

        // Corrige la búsqueda con el formato adecuado
        const updateStatusUser = await User.findOneAndUpdate(
            { _id: id },
            { estado },
            { new: true }
        );

        if (!updateStatusUser) {
            return res.status(404).json({
                success: false,
                message: `No se pudo actualizar el usuario con ID ${id}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: updateStatusUser,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar los datos del usuario',
            error: error.message,
        });
    }
};
