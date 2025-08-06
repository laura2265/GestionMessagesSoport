import AsignarUser from "../../models/AsignarUser.js";

function generarDescripcionPorSheet(cliente) {
    const desc = [];
    const sheet = cliente.sheet;

    // 🗂 Motivo principal
    if (cliente.Message) {
        desc.push(`🗂 Motivo: ${cliente.Message}`);
    }

    // 📌 Detalle (solo si es diferente del mensaje principal)
    if (cliente.ProblemaInt && cliente.ProblemaInt !== cliente.Message) {
        desc.push(`📌 Detalle: ${cliente.ProblemaInt}`);
    }

    // 📡 Sheet1 - No tengo internet
    if (sheet === 'Sheet1') {
        desc.push(`📡 Problema: No tengo internet`);
        if (cliente.TipoDispositivoInternet) desc.push(`📱 Dispositivo: ${cliente.TipoDispositivoInternet}`);
        if (cliente.bombilloLos) desc.push(`💡 Bombillo: ${cliente.bombilloLos}`);
        if (cliente.cable) desc.push(`🔌 Estado del cable: ${cliente.cable}`);
        if (cliente.funciono1) desc.push(`⚙️ Resultado final: ${cliente.funciono1}`);
    }

    // 🐢 Sheet2 - Internet lento
    if (sheet === 'Sheet2') {
        desc.push(`🐢 Problema: Internet lento`);
        if (cliente.testVel) desc.push(`📶 Velocidad subida: ${cliente.testVel}`);
        if (cliente.result) desc.push(`⚙️ Resultado del test: ${cliente.result}`);
    }

    // 🌐 Sheet3 - No cargan las páginas
    if (sheet === 'Sheet3') {
        desc.push(`🌐 Problema: No cargan las páginas`);
        if (cliente.ProblemPage) desc.push(`🧭 Tipo de falla: ${cliente.ProblemPage}`);
        if (cliente.namePage) desc.push(`📝 Página afectada: ${cliente.namePage}`);
        if (cliente.funcionoVpn) desc.push(`⚙️ Resultado: ${cliente.funcionoVpn}`);
    }

    // 📺 Sheet4 - Señal de Televisión
    if (sheet === 'Sheet4') {
        desc.push(`📺 Problema: Señal de Televisión`);
        if (cliente.ProblemaSeñal) desc.push(`🛰️ Tipo de problema: ${cliente.ProblemaSeñal}`);
        if (cliente.FuncionoFinal) desc.push(`⚙️ Resultado: ${cliente.FuncionoFinal}`);
    }

    // 🔁 Sheet5 - Internet intermitente
    if (sheet === 'Sheet5') {
        desc.push(`🔁 Problema: Internet se desconecta a ratos`);
        if (cliente.TipoProblem) desc.push(`📡 Tipo conexión WiFi: ${cliente.TipoProblem}`);
        if (cliente.resultadoFinal) desc.push(`⚙️ Resultado: ${cliente.resultadoFinal}`);
    }

    // 🛠️ Sheet6 - Otro problema técnico
    if (sheet === 'Sheet6') {
        desc.push(`🛠️ Otro problema técnico ingresado manualmente por el usuario`);
    }

    // 🔒 Sheet7 - Cambio de contraseña
    if (sheet === 'Sheet7') {
        desc.push(`🔒 Cambio de contraseña solicitado`);
    }

    // 📊 Sheet9 - Cambio de plan
    if (sheet === 'Sheet9') {
        desc.push(`📊 Solicitud de cambio de plan`);
        if (cliente.message) desc.push(`📝 Detalle de plan: ${cliente.message}`);
    }

    // 📣 Sheet12 - Queja o reclamo
    if (sheet === 'Sheet12') {
        desc.push(`📣 Queja o reclamo ingresado`);
    }

    // 🆘 Sheet15 - Otro tipo de solicitud
    if (sheet === 'Sheet15') {
        desc.push(`🆘 Otro tipo de solicitud (no clasificada)`);
    }

    // 📄 Otros casos
    if (!sheet || desc.length <= 1) {
        desc.push(`📄 Sheet sin descripción específica o sin detalles disponibles`);
    }

    return desc;
}


export const AsignarUserPost = async (req, res) => {
    console.log("Entro al asignar empleado")
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
        console.log('Empleados consultados')

        if (empleadosRol2.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No hay empleados disponibles para asignar."
            });
        }

        console.log("El id antes de pasarlo es: ", id)
        // 2. Buscar cliente en Sheets
        const ClientResponse = await fetch(`http://localhost:3001/api`);
        const ClientData = await ClientResponse.json();
        let cliente = ClientData.find(client => client.id === id);
        console.log("[DEBUG] Resultado búsqueda en Google Sheets:", cliente);

        // 3. Si no está en Sheets, buscar en Mongo
        if (!cliente) {
            const mongoRes = await fetch(`http://localhost:3001/conversacion-server`);
            const mongoData = await mongoRes.json();
            cliente = mongoData.data.docs.find(c => c.id === id);

            if (cliente) {
                cliente.id = cliente.id || id;  // Usa el id recibido si no viene definido
                cliente.Name = cliente.Name || cliente.name || 'Cliente sin nombre';
                cliente.sheet = null;
                cliente.chatName = 'ChatLocal';
                cliente.Message = cliente.Message || cliente.motivo || 'Mensaje no disponible';
                cliente.numDocTitular =
                    cliente.numDocTitular ||
                    cliente.CedulaTitular ||
                    cliente.DocumentoTitular ||
                    cliente.DocumentoTirular ||
                    cliente.DocumentoTirularOtro ||
                    cliente.documento ||
                    cliente.usuario?.documento ||
                    '';

                if(cliente.conversacion && Array.isArray(cliente.conversacion)){
                    const mensajeUsuario = cliente.conversacion
                    .filter(m => m.de === 'usuario')
                    .sort((a,b) => new Date(b.timeStamp) - new Date(a.timeStamp));

                    const ultimoMensajeUsuario = mensajeUsuario[0];
                    if(ultimoMensajeUsuario?.mensaje?.text){
                        cliente.Message = ultimoMensajeUsuario.mensaje.text;
                    }else{
                        cliente.Message = 'Mensaje no disponible'
                    }
                }else{
                    cliente.Message = 'Mensaje no disponible :('
                }
            }
        }

        console.log("[DEBUG] Buscando asignación previa para ID:", cliente.id);


        const yaAsignado = await AsignarUser.findOne({ chatId: cliente.id });
        console.log("[DEBUG] Resultado de búsqueda:", yaAsignado);


        // 6. Determinar categoría (solo aplica si viene de Sheets)
        let categoria = "Sin categoria";

        if (cliente.sheet === 'Sheet1' && (cliente.funciono1 === "No funciono" || cliente.cable === "Cable dañado")) {
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
            Descripcion: generarDescripcionPorSheet(cliente),
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
