import AsignarUser from "../../models/AsignarUser.js";

export const AsignarUserPost = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar datos de clientes
        const ClientResponse = await fetch(`http://localhost:3001/api`);
        const ClientData = await ClientResponse.json();

        // Consultar empleados disponibles
        const EmpleResponse = await fetch('http://localhost:3001/user', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const EmpleadoData = await EmpleResponse.json();
        const EmpleResults = EmpleadoData.data.docs;

        const empleadosPorCategoria = EmpleadoData.data.docs.filter(e => e.rol);

        const clientesPorCategoria = {
            'No hay conexión': ClientData.filter(client => client.id === id && client.sheet === 'Sheet1' && (client.funciono1 === 'No funciona' || client.cable === 'Cable Dañado')),
            'Internet lento': ClientData.filter(client => client.id === id && client.sheet === 'Sheet2' && client.result === 'No funciono'),
            'No cargan las páginas': ClientData.filter(client => client.id === id && client.sheet === 'Sheet3' && client.funcionoVpn === 'No funciono'),
            'Señal de Televisión': ClientData.filter(client => client.id === id && client.sheet === 'Sheet4' && client.FuncionoFinal === 'No funciono'),
            'Internet se desconecta a ratos': ClientData.filter(client => client.id === id && client.sheet === 'Sheet5' && client.resultadoFinal === 'No funciono')
        };

        const asignaciones = [];

        for (const categoria of Object.keys(clientesPorCategoria)) {
            const clientes = clientesPorCategoria[categoria];
            const empleados = empleadosPorCategoria[categoria];

            if (clientes.length > 0 && empleados.length > 0) {
                for (const cliente of clientes) {

                    console.log('chat id: ', cliente.id);

                    // Verificar si el cliente ya tiene una asignación en la base de datos
                    const yaAsignado = await AsignarUser.findOne({ cahtId: cliente.id, categoriaTicket: categoria });

                    if (yaAsignado) {
                        console.log(`⚠️ El cliente ${cliente.id} ya tiene una asignación en ${categoria}.`);
                        continue;
                    }

                    const empleAsignado = empleados[Math.floor(Math.random() * empleados.length)];

                    const newAsignacion = await AsignarUser.create({
                        cahtId: cliente.id,
                        nombreClient: cliente.Name,
                        chatName: cliente.chatName,
                        Descripcion: cliente.Message,
                        idEmple: empleAsignado._id,
                        nombreEmple: empleAsignado.name,
                        categoriaTicket: categoria,
                    });

                    asignaciones.push(newAsignacion);
                }
            }
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

export const AsignarUserGet = async(req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        }

        const asignar_user = await AsignarUser.paginate({}, options)
        res.status(200).json({
            success: true,
            data: asignar_user
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error al momento de consultar las asignaciones'
        })
    }
}
