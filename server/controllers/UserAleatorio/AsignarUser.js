import AsignarUser from "../../models/AsignarUser.js";

/* ---------------- Helpers comunes ---------------- */

function textFromMensaje(mensaje) {
  if (!mensaje) return '';
  if (typeof mensaje === 'string') return mensaje;
  if (typeof mensaje === 'object') {
    return (
      mensaje.text ||
      mensaje.texto ||
      mensaje.url ||
      (Array.isArray(mensaje.buttons) && mensaje.buttons.length ? mensaje.buttons.map(b => b?.texto || b?.text || b?.title).filter(Boolean).join(' / ') : '') ||
      ''
    );
  }
  return String(mensaje);
}

function pick(arr, idx) {
  if (!Array.isArray(arr)) return undefined;
  return arr[idx];
}

/* ---------------- Descripción por Sheets (igual, con un pequeño retoque al fallback) ---------------- */

function generarDescripcionPorSheet(cliente) {
  const desc = [];
  const sheet = cliente.sheet;

  // 🗂 Motivo principal
  if (cliente.Message) {
    desc.push(`🗂 Motivo: ${cliente.Message}`);
  }

  // 📌 Detalle (si es distinto)
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

  // 📄 Otros casos / fallback
  if (!sheet || desc.length <= 1) {
    desc.push(`📄 Sheet sin descripción específica o sin detalles disponibles`);
  }

  return desc;
}


function generarDescripcionPorConversacionLocal(cliente) {
  const desc = [];
  const conv = Array.isArray(cliente?.conversacion) ? cliente.conversacion : [];

  if (conv.length === 0) {
    return ['📄 Conversación local sin mensajes disponibles'];
  }

  // Mensajes de usuario y bot (texto plano)
  const usuarioMsgs = conv
    .filter(m => m?.de === 'usuario')
    .map(m => textFromMensaje(m?.mensaje))
    .filter(Boolean);

  const botMsgs = conv
    .filter(m => m?.de === 'bot')
    .map(m => textFromMensaje(m?.mensaje))
    .filter(Boolean);

  const motivo = usuarioMsgs[0] || botMsgs[0] || '';
  if (motivo) desc.push(`🗂 Motivo: ${motivo}`);

  const detallePorIndice3 = textFromMensaje(pick(conv, 3)?.mensaje);
  const detalle =
    (detallePorIndice3 && detallePorIndice3 !== motivo && detallePorIndice3) ||
    (usuarioMsgs[1] && usuarioMsgs[1] !== motivo && usuarioMsgs[1]) ||
    (usuarioMsgs.length > 1 ? usuarioMsgs[usuarioMsgs.length - 1] : '');

  if (detalle) desc.push(`📌 Detalle: ${detalle}`);

  const extras = usuarioMsgs.slice(2, 4).filter(t => t && t !== motivo && t !== detalle);
  extras.forEach((t, i) => desc.push(`📝 Aporte ${i + 1}: ${t}`));

  if (desc.length === 1) {
    const otraLinea = botMsgs.find(t => t !== motivo);
    if (otraLinea) desc.push(`📝 Info: ${otraLinea}`);
  }

  return desc.length ? desc : ['📄 Conversación local sin detalles identificables'];
}


export const AsignarUserPost = async (req, res) => {
  console.log("Entro al asignar empleado");
  try {
    const { id } = req.params;

    const existente = await AsignarUser.findOne({ chatId: id });
    if (existente) {
      return res.status(200).json({
        success: true,
        message: 'La asignación ya existe',
        asignacion: existente
      });
    }

    const EmpleResponse = await fetch('http://localhost:3001/user', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const EmpleadoData = await EmpleResponse.json();
    const empleados = EmpleadoData?.data?.docs || [];
    const empleadosRol2 = empleados.filter(e => e.rol === 2);
    console.log('Empleados consultados');

    if (empleadosRol2.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay empleados disponibles para asignar."
      });
    }

    console.log("El id antes de pasarlo es: ", id);

    // 2. Buscar cliente en Sheets
    const ClientResponse = await fetch(`http://localhost:3001/api`);
    const ClientData = await ClientResponse.json();
    let cliente = ClientData.find(client => client.id === id);
    console.log("[DEBUG] Resultado búsqueda en Google Sheets:", cliente);

    // 3. Si no está en Sheets, buscar en Mongo (conversacion-server)
    let esLocal = false;
    if (!cliente) {
      const mongoRes = await fetch(`http://localhost:3001/conversacion-server`);
      const mongoData = await mongoRes.json();
      cliente = mongoData?.data?.docs?.find(c => c.id === id);

      if (cliente) {
        esLocal = true;
        cliente.id = cliente.id || id;
        cliente.Name = cliente.usuario?.nombre || 'Cliente sin nombre';
        cliente.sheet = null;
        cliente.chatName = 'ChatBotLocal'; 
        // Documento
        cliente.numDocTitular =
          cliente.numDocTitular ||
          cliente.CedulaTitular ||
          cliente.DocumentoTitular ||
          cliente.DocumentoTirular ||
          cliente.DocumentoTirularOtro ||
          cliente.documento ||
          cliente.usuario?.documento ||
          '';
        // Mensaje principal (por si lo necesitas en categoría)
        if (Array.isArray(cliente.conversacion)) {
          const msgUsuarioOrdenado = cliente.conversacion
            .filter(m => m.de === 'usuario')
            .sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
          cliente.Message = textFromMensaje(msgUsuarioOrdenado[0]?.mensaje) || 'Mensaje no disponible';
        } else {
          cliente.Message = 'Mensaje no disponible :(';
        }
      }
    }

    console.log("[DEBUG] Buscando asignación previa para ID:", cliente?.id);

    const yaAsignado = await AsignarUser.findOne({ chatId: cliente.id });
    console.log("[DEBUG] Resultado de búsqueda:", yaAsignado);

    // 4. Determinar categoría (solo aplica si viene de Sheets). Para Local la dejamos "Sin categoria"
    let categoria = "Sin categoria";
    if (!esLocal) {
      const sheet = cliente?.sheet;
      if (sheet === 'Sheet1' && (cliente.funciono1 === "No funciono" || cliente.cable === "Cable dañado")) {
        categoria = "No hay conexión";
      } else if (sheet === 'Sheet2' && cliente.result === "No funciono") {
        categoria = "Internet lento";
      } else if (sheet === 'Sheet3' && cliente.funcionoVpn === "No funciono") {
        categoria = "No cargan las paginas";
      } else if (sheet === 'Sheet4' && cliente.FuncionoFinal === "No funciono") {
        categoria = "Señal de Televisión";
      } else if (sheet === 'Sheet5' && cliente.resultadoFinal === "No funciono") {
        categoria = "Internet se desconecta a ratos";
      }
    }

    // 5. Asignar empleado aleatorio
    const empleAsignado = empleadosRol2[Math.floor(Math.random() * empleadosRol2.length)];

    // 6. Construir la DESCRIPCIÓN según origen
    const descripcion =
      esLocal
        ? generarDescripcionPorConversacionLocal(cliente)
        : generarDescripcionPorSheet(cliente);

    // 7. Crear asignación en Mongo
    const nuevaAsignacion = await AsignarUser.create({
      chatId: cliente.id,
      nombreClient: cliente.Name,
      numDocTitular: cliente.numDocTitular || '',
      chatName: cliente.chatName,
      Descripcion: descripcion,
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
    };

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
