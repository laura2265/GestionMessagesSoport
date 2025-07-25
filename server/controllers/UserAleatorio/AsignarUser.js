import AsignarUser from "../../models/AsignarUser.js";

export const AsignarUserPost = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar datos de clientes
        const ClientResponse = await fetch(`http://localhost:3001/api`);
        const ClientData = await ClientResponse.json();

        const EmpleResponse = await fetch('http://localhost:3001/user', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const EmpleadoData = await EmpleResponse.json();

        if (!EmpleadoData.data || !Array.isArray(EmpleadoData.data.docs)) {
            throw new Error("La respuesta de empleados no contiene el array esperado.");
        }

        const empleados = EmpleadoData?.data?.docs || [];

        const empleadosRol2 = empleados.filter(e => e.rol === 2);

        if (empleadosRol2.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No hay empleados disponibles para asignar."
            });
        }

        const clientes = ClientData.filter(client => client.id === id);
        const asignaciones = [];

        for (const cliente of clientes) {
            console.log('chatId: ', cliente.id);

            const yaAsignado = await AsignarUser.findOne({ chatId: cliente.id });

            let categoria = "Sin categoria";

            if (yaAsignado) {
                console.log(`⚠️ El cliente ${cliente.id} ya tiene una asignación en ${categoria}.`);
                continue;
            }

            // Clasificación de categoría
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

            console.log('Nombre del cliente: ', cliente.Name);

            const empleAsignado = empleadosRol2[Math.floor(Math.random() * empleadosRol2.length)];

            const newAsignacion = await AsignarUser.create({
                chatId: cliente.id,
                nombreClient: cliente.Name,
                numDocTitular: cliente.numDocTitular || '',
                chatName: cliente.chatName,
                Descripcion: [cliente.Message, cliente.ProblemaInt || null],
                idEmple: empleAsignado._id,
                nombreEmple: empleAsignado.name,
                categoriaTicket: categoria,
                numDocTitular: cliente.numDocTitular
            });

            asignaciones.push(newAsignacion);
        }

        res.status(200).json({
            success: true,
            message: `Asignaciones verificadas y procesadas correctamente.`,
            asignaciones
        });

    } catch (error) {
        console.error("Error durante la verificación de asignaciones:", error.message);
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
