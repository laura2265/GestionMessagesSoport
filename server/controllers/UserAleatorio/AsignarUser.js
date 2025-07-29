import AsignarUser from "../../models/AsignarUser.js";

export const AsignarUserPost = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener empleados disponibles
        const EmpleResponse = await fetch('http://localhost:3001/user', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const EmpleadoData = await EmpleResponse.json();
        const empleados = EmpleadoData?.data?.docs || [];
        const empleadosRol2 = empleados.filter(e => e.rol === 2);

        if (empleadosRol2.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No hay empleados disponibles para asignar."
            });
        }

        // 2. Buscar cliente en Sheets
        const ClientResponse = await fetch(`http://localhost:3001/api`);
        const ClientData = await ClientResponse.json();
        let cliente = ClientData.find(client => client.id === id);

        // 3. Si no está en Sheets, buscar en Mongo
        if (!cliente) {
            const mongoRes = await fetch(`http://localhost:3001/conversacion-server`);
            const mongoData = await mongoRes.json();
            cliente = mongoData.data.docs.find(c => c.id === id);

            if (cliente) {
                cliente.Name = cliente.name || 'Cliente sin nombre';
                cliente.sheet = null;
                cliente.chatName = cliente.chat;
                cliente.Message = cliente.Message || cliente.motivo || 'Mensaje no disponible';
                cliente.ProblemaInt = null;
                cliente.numDocTitular = null;
            }
        }

        // 4. Si no se encuentra en ninguna fuente
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: `Cliente con id ${id} no encontrado en Sheets ni en Mongo`
            });
        }

        // 5. Validar si ya está asignado
        const yaAsignado = await AsignarUser.findOne({ chatId: cliente.id });
        if (yaAsignado) {
            return res.status(200).json({
                success: false,
                message: `El cliente ${cliente.id} ya tiene una asignación.`
            });
        }

        // 6. Determinar categoría (solo aplica si viene de Sheets)
        let categoria = "Sin categoria";

        if (cliente.sheet === 'Sheet1' && (cliente.funciono1 === "No funciona" || cliente.cable === "Cable dañado")) {
            categoria = "No hay conexión";
        } else if (cliente.sheet === 'Sheet2' && cliente.result === "No funciono") {
            categoria = "Internet lento";
        } else if (cliente.sheet === 'Sheet3' && cliente.funcionoVpn === "No funciono") {
            categoria = "No cargan las paginas";
        } else if (cliente.sheet === 'Sheet4' && cliente.FuncionoFinal === "No funciono") {
            categoria = "Señal de Televisión";
        } else if (cliente.sheet === 'Sheet5' && cliente.resultadoFinal === "No funciono") {
            categoria = "Internet se desconecta a ratos";
        }

        // 7. Asignar empleado aleatorio
        const empleAsignado = empleadosRol2[Math.floor(Math.random() * empleadosRol2.length)];

        // 8. Crear asignación en Mongo
        const nuevaAsignacion = await AsignarUser.create({
            chatId: cliente.id,
            nombreClient: cliente.Name,
            numDocTitular: cliente.numDocTitular || '',
            chatName: cliente.chatName,
            Descripcion: [cliente.Message, cliente.ProblemaInt || null],
            idEmple: empleAsignado._id,
            nombreEmple: empleAsignado.name,
            categoriaTicket: categoria,
        });

        res.status(200).json({
            success: true,
            message: `Cliente ${cliente.id} asignado correctamente`,
            asignacion: nuevaAsignacion
        });

    } catch (error) {
        console.error("Error durante la asignación:", error.message);
        res.status(500).json({
            success: false,
            message: "Error durante la asignación",
            error: error.message
        });
    }
};

export const AsignarUserGet = async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        }

        const asignar_user = await AsignarUser.paginate({}, options);
        res.status(200).json({
            success: true,
            data: asignar_user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al momento de consultar las asignaciones'
        });
    }
};
