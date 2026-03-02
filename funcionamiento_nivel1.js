// ------------------ VARIABLES DEL JUEGO ------------------
let puntuacion = 0,
    vidas = 3,
    maxAlerts = 20;
let alertCounter = 0;       
let alertasRespondidas = 0; 
let requiereEscalar = false;
let alertaActiva = null;

// ------------------ FUNCIONES DE AYUDA ------------------
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ------------------ TICKETS ------------------
const ticketTemplates = [
    // ------------------ ALERTAS BAJAS (LOW) ------------------
    { escalar: false, alert: "Prueba rutinaria de impresora", severity: "Low", activity: "Se imprimieron 2 páginas", context: "Dispositivo aprobado, prueba interna" },
    { escalar: false, alert: "Mensaje de chat interno", severity: "Low", activity: "Mensaje enviado al canal de RRHH", context: "Relacionado con trabajo" },
    { escalar: false, alert: "Sincronización de calendario", severity: "Low", activity: "Eventos sincronizados", context: "Dispositivo aprobado" },
    { escalar: false, alert: "Aplicación instalada desde la tienda", severity: "Low", activity: "Aplicación segura instalada", context: "Fuente verificada" },
    { escalar: false, alert: "Inicio de sesión VPN desde casa", severity: "Low", activity: "Inicio de sesión exitoso", context: "MFA habilitado" },
    { escalar: true, alert: "Inicio de sesión en horario extraño", severity: "Low", activity: "Inicio de sesión a las 03:12 AM", context: "Fuera del horario laboral, monitorizar" },
    { escalar: true, alert: "Correo enviado a dominio externo desconocido", severity: "Low", activity: "Se envió correo", context: "Posible fuga de datos, revisar" },
    { escalar: false, alert: "Copia de seguridad programada", severity: "Low", activity: "Copia completada", context: "Rutina aprobada" },
    { escalar: false, alert: "Uso de impresora", severity: "Low", activity: "Se imprimieron materiales de marketing", context: "Usuario aprobado" },
    { escalar: false, alert: "Módulo de formación completado", severity: "Low", activity: "Usuario finalizó el módulo", context: "Módulo obligatorio" },
    { escalar: false, alert: "Escaneo antivirus rutinario", severity: "Low", activity: "No se detectaron amenazas", context: "Equipo aprobado" },
    { escalar: false, alert: "Actualización de software rutinaria", severity: "Low", activity: "Se aplicó parche crítico menor", context: "Autorizado por TI" },
    { escalar: true, alert: "Acceso desde dispositivo no registrado", severity: "Low", activity: "Inicio de sesión exitoso", context: "Monitorizar dispositivo" },
    { escalar: false, alert: "Consulta de base de datos aprobada", severity: "Low", activity: "Se realizó consulta SQL segura", context: "Usuario autorizado" },
    { escalar: false, alert: "Notificación interna enviada", severity: "Low", activity: "Aviso sobre reunión programado", context: "Actividad rutinaria" },
    { escalar: true, alert: "Descarga de archivo interno sospechosa", severity: "Low", activity: "Archivo PDF descargado", context: "Verificar si es crítico" },
    { escalar: false, alert: "Sincronización de dispositivo móvil", severity: "Low", activity: "Contactos y calendario sincronizados", context: "Dispositivo corporativo aprobado" },
    { escalar: false, alert: "Acceso a recurso compartido", severity: "Low", activity: "Archivo abierto y leído", context: "Usuario autorizado" },
    { escalar: false, alert: "Cierre de sesión normal", severity: "Low", activity: "Sesión terminada correctamente", context: "Actividad aprobada" },
    { escalar: true, alert: "Inicio de sesión concurrente inusual", severity: "Low", activity: "Usuario activo en 2 ubicaciones", context: "Monitorizar comportamiento" },

    // ------------------ ALERTAS MEDIAS (MEDIUM) ------------------
    { escalar: true, alert: "Carga de datos inusual", severity: "Medium", activity: "2GB cargados a la nube", context: "Fuera del horario laboral" },
    { escalar: false, alert: "VPN desde país de viaje autorizado", severity: "Medium", activity: "Inicio de sesión desde España", context: "Usuario viajando" },
    { escalar: true, alert: "Ejecución sospechosa de script", severity: "Medium", activity: "Se lanzó PowerShell con comandos codificados", context: "Actividad anómala" },
    { escalar: true, alert: "Múltiples intentos fallidos de inicio de sesión", severity: "Medium", activity: "Usuario falló 15 veces", context: "Cuenta no bloqueada" },
    { escalar: true, alert: "Copia interna de archivos no autorizada", severity: "Medium", activity: "Se copiaron 1000 archivos", context: "No autorizado" },
    { escalar: true, alert: "Clic en enlace de phishing", severity: "Medium", activity: "Usuario clicó enlace sospechoso", context: "Dominio externo no confiable" },
    { escalar: true, alert: "Escaneo de puertos inusual", severity: "Medium", activity: "Escaneo detectado en la red interna", context: "Firewall activado" },
    { escalar: true, alert: "Acceso a datos fuera del rol", severity: "Medium", activity: "Accedió a registros de RRHH", context: "No pertenece a RRHH" },
    { escalar: false, alert: "Actualización de software aprobada", severity: "Medium", activity: "Descargó actualización del proveedor", context: "Aprobada por IT" },
    { escalar: false, alert: "Revisión rutinaria de logs", severity: "Medium", activity: "Se revisaron logs", context: "Proceso regular" },
    { escalar: true, alert: "Adjunto de correo malicioso detectado", severity: "Medium", activity: "Adjunto marcado", context: "Contenido sospechoso" },
    { escalar: true, alert: "Escritorio remoto no autorizado", severity: "Medium", activity: "Intento de RDP detectado", context: "Usuario no permitido" },
    { escalar: false, alert: "Actualización de permisos aprobada", severity: "Medium", activity: "Permisos aplicados correctamente", context: "Control de seguridad" },
    { escalar: true, alert: "Acceso a almacenamiento externo sospechoso", severity: "Medium", activity: "Unidad USB conectada", context: "Monitorizar transferencia de datos" },
    { escalar: false, alert: "Uso autorizado de impresora", severity: "Medium", activity: "Se imprimieron documentos internos", context: "Usuario aprobado" },
    { escalar: true, alert: "Actividad inusual de procesos", severity: "Medium", activity: "Proceso desconocido consumiendo CPU", context: "Investigar" },
    { escalar: false, alert: "Notificación interna enviada", severity: "Medium", activity: "Mensaje de equipo enviado", context: "Actividad aprobada" },
    { escalar: true, alert: "Intento de acceso con credenciales expiradas", severity: "Medium", activity: "Login rechazado", context: "Usuario bloqueado temporalmente" },
    { escalar: false, alert: "Actualización de firma de antivirus", severity: "Medium", activity: "Definiciones actualizadas", context: "Proceso rutinario" },
    { escalar: true, alert: "Actividad de red sospechosa", severity: "Medium", activity: "Tráfico elevado a IP desconocida", context: "Monitorizar" },

    // ------------------ ALERTAS ALTAS (HIGH) ------------------
    { escalar: true, alert: "Actividad de ransomware detectada", severity: "High", activity: "Archivos cifrados", context: "Amenaza crítica" },
    { escalar: true, alert: "Malware C2 detectado", severity: "High", activity: "Conexiones a servidor C2", context: "Malware confirmado" },
    { escalar: true, alert: "Explotación Zero-Day", severity: "High", activity: "Sistema comprometido", context: "Parche no disponible" },
    { escalar: true, alert: "Secuestro de sesión", severity: "High", activity: "Sesión activa tomada", context: "Usuario comprometido" },
    { escalar: true, alert: "Intento de inyección SQL", severity: "High", activity: "Consulta con OR 1=1", context: "Bloqueado por WAF" },
    { escalar: true, alert: "Robo de credenciales", severity: "High", activity: "Múltiples intentos de login con credenciales robadas", context: "Cuentas bloqueadas" },
    { escalar: true, alert: "Fuga de datos por correo electrónico", severity: "High", activity: "Datos sensibles enviados externamente", context: "Usuario no autorizado" },
    { escalar: false, alert: "Falso positivo de malware", severity: "High", activity: "Archivo limpio puesto en cuarentena", context: "Verificado seguro" },
    { escalar: true, alert: "Ataque a la cadena de suministro", severity: "High", activity: "Software malicioso instalado", context: "Compromiso de proveedor" },
    { escalar: true, alert: "Ataque Man-in-the-Middle", severity: "High", activity: "Tráfico interceptado", context: "Usuario en WiFi pública" },
    { escalar: true, alert: "Beacon de comando y control", severity: "High", activity: "Conexiones periódicas detectadas", context: "Malware confirmado" },
    { escalar: true, alert: "Minería de criptomonedas detectada", severity: "High", activity: "Uso alto de CPU por proceso desconocido", context: "Software no autorizado" },
    { escalar: true, alert: "Actividad inusual de USB", severity: "High", activity: "Se copiaron grandes datos a USB", context: "Dispositivo no aprobado" },
    { escalar: true, alert: "Ejecución sospechosa de PowerShell", severity: "High", activity: "Comando codificado ejecutado", context: "Correo sospechoso abierto" },
    { escalar: false, alert: "Pico de CPU por tarea aprobada", severity: "High", activity: "Sistema con alta carga", context: "Mantenimiento rutinario" },
    { escalar: true, alert: "Intento de borrado masivo de datos", severity: "High", activity: "Archivos críticos eliminados", context: "Intervención inmediata requerida" },
    { escalar: false, alert: "Actividad legítima de backup", severity: "High", activity: "Se completó copia de seguridad", context: "Programado y aprobado" },
    { escalar: true, alert: "Acceso remoto no autorizado detectado", severity: "High", activity: "RDP activo desde IP desconocida", context: "Usuario bloqueado" },
    { escalar: true, alert: "Interceptación de correos internos", severity: "High", activity: "Tráfico cifrado interceptado", context: "Investigación urgente" },
    { escalar: false, alert: "Falsa alarma de seguridad", severity: "High", activity: "Proceso identificado como seguro", context: "Verificado por TI" },
    { escalar: true, alert: "Exfiltración de datos detectada", severity: "High", activity: "Archivos sensibles transferidos", context: "Alerta inmediata" },
    { escalar: true, alert: "Desactivación de antivirus detectada", severity: "High", activity: "Protección del endpoint apagada", context: "Intervención requerida" },
    { escalar: true, alert: "Intento de escalamiento de privilegios", severity: "High", activity: "Usuario ejecutó comando admin", context: "Bloqueado automáticamente" },
    { escalar: false, alert: "Uso de CPU elevado por tarea aprobada", severity: "High", activity: "Carga temporal esperada", context: "Proceso rutinario" },

    // ------------------ TICKETS VARIADOS ADICIONALES ------------------
    { escalar: false, alert: "Actualización de certificados", severity: "Low", activity: "Certificados renovados correctamente", context: "Proceso rutinario" },
    { escalar: false, alert: "Conexión a servicio interno", severity: "Low", activity: "Acceso completado", context: "Usuario autorizado" },
    { escalar: true, alert: "Intento de login desde VPN desconocida", severity: "Medium", activity: "Inicio de sesión bloqueado", context: "Investigar" },
    { escalar: false, alert: "Revisión de firewall", severity: "Medium", activity: "Reglas verificadas", context: "Proceso rutinario" },
    { escalar: true, alert: "Inyección de malware por USB", severity: "High", activity: "Archivo ejecutable detectado", context: "Alerta crítica" },
    { escalar: false, alert: "Notificación de expiración de contraseña", severity: "Low", activity: "Usuario informado", context: "Actividad estándar" },
    { escalar: true, alert: "Conexión a red externa no autorizada", severity: "Medium", activity: "Acceso bloqueado", context: "Monitorizar tráfico" },
    { escalar: false, alert: "Revisión de logs de impresión", severity: "Low", activity: "Documentos verificados", context: "Actividad aprobada" },
    { escalar: true, alert: "Detección de troyano", severity: "High", activity: "Archivo aislado", context: "Usuario bloqueado" },
    { escalar: false, alert: "Escaneo de malware programado", severity: "Medium", activity: "Sistema limpio", context: "Proceso rutinario" },
    { escalar: true, alert: "Acceso a base de datos no autorizado", severity: "High", activity: "Intento bloqueado", context: "Revisar logs" },
    { escalar: false, alert: "Actualización de aplicación interna", severity: "Low", activity: "Versión instalada correctamente", context: "Autorizado por TI" },
    { escalar: true, alert: "Intento de ejecución de ransomware", severity: "High", activity: "Proceso detenido", context: "Alerta inmediata" },
    { escalar: true, alert: "Ataque DDoS detectado", severity: "High", activity: "Tráfico mitigado por firewall", context: "Monitorizar red" },
    { escalar: false, alert: "Cambio de permisos aprobado", severity: "Medium", activity: "Permisos aplicados", context: "Proceso rutinario" },
    { escalar: true, alert: "Phishing detectado en correo interno", severity: "Medium", activity: "Enlace bloqueado", context: "Usuario advertido" },
    { escalar: false, alert: "Revisión de acceso VPN", severity: "Medium", activity: "Usuarios autorizados confirmados", context: "Rutinario" },
    { escalar: true, alert: "Acceso simultáneo sospechoso", severity: "Medium", activity: "Sesión detectada desde varias IPs", context: "Monitorizar actividad" },
    { escalar: false, alert: "Backup manual completado", severity: "Low", activity: "Datos copiados correctamente", context: "Actividad normal" },
    { escalar: true, alert: "Intento de explotación de vulnerabilidad web", severity: "High", activity: "Bloqueado por WAF", context: "Monitorizar seguridad" }
];

// ------------------ GENERAR ALERTA ------------------
function nuevaAlerta() {
    if (alertCounter >= maxAlerts) return;

    const baseTicket = randomFrom(ticketTemplates);
    const ticket = JSON.parse(JSON.stringify(baseTicket)); // clonar

    // Generar actividad dinámica
    ticket.activity = generarActividadAleatoria(ticket.activity);

    // Generar contexto coherente
    ticket.context = generarContextoCoherente(ticket.context, ticket.escalar);

    const alertId = "alert_" + rand(1000, 9999);
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert_item";
    alertDiv.id = alertId;
    alertDiv.textContent = ticket.alert + " [" + ticket.severity + "]";

    alertDiv.onclick = function() {
        abrirTicket(ticket, alertDiv);
        document.getElementById("alert_panel").classList.remove("show");
    };

    document.getElementById("alert_list").prepend(alertDiv);
    alertCounter++;
}

// ------------------ GENERAR ACTIVIDAD Y CONTEXTO ------------------
function generarActividadAleatoria(textoBase) {
    const ips = `185.${rand(10,250)}.${rand(10,250)}.${rand(10,250)}`;
    const gb = rand(1, 20);
    const intentos = rand(3, 50);
    const hora = rand(0,23).toString().padStart(2,"0") + ":" + rand(0,59).toString().padStart(2,"0");

    let texto = textoBase;
    texto = texto.replace(/\d+\s?GB/, gb + " GB"); // reemplazar GB específico
    texto = texto.replace(/(\d+) intentos/, intentos + " intentos"); // reemplazar intentos específico
    texto += ` | IP detectada: ${ips} | Hora: ${hora}`;
    return texto;
}

function generarContextoCoherente(textoBase, escalar) {
    const ubicacion = randomFrom(["España", "Alemania", "Brasil", "EEUU", "Francia"]);
    const red = randomFrom(["WiFi pública", "Red corporativa", "VPN", "Hotspot móvil"]);
    return `${textoBase} | Ubicación: ${ubicacion} | Red: ${red}`;
}

// ------------------ ABRIR TICKET ------------------
function abrirTicket(ticket, divAlerta) {
    requiereEscalar = ticket.escalar;
    alertaActiva = divAlerta;

    const card = document.getElementById("ticket_card");
    card.style.display = "block";

    document.getElementById("ticket_id").textContent = "SOC Ticket – Alert #" + rand(1000, 9999);
    document.getElementById("alert_name").textContent = ticket.alert;
    document.getElementById("severity").textContent = ticket.severity;
    document.getElementById("host").textContent = randomFrom(["MKT-WS07", "HR-LT22", "FIN-WS11", "ENG-SRV02"]);
    document.getElementById("os").textContent = randomFrom(["Windows 11", "Windows 10", "Ubuntu 22.04"]);
    document.getElementById("user").textContent = randomFrom(["j.garcia", "l.rodriguez", "a.martin", "c.santos"]);
    document.getElementById("dept").textContent = randomFrom(["Marketing", "Finance", "IT", "HR"]);
    document.getElementById("activity_details").textContent = ticket.activity;
    document.getElementById("context").textContent = ticket.context;
    document.getElementById("analyst_response").value = "";

    // Activar botones
    document.getElementById("btn_close").disabled = false;
    document.getElementById("btn_escalate").disabled = false;

    const feedback = document.getElementById("feedback");
    if (feedback) feedback.remove();
}

// ------------------ EVALUAR DECISIÓN ------------------
function evaluarTicket(usuarioEscala) {
    const card = document.getElementById("ticket_card");

    document.getElementById("btn_close").disabled = true;
    document.getElementById("btn_escalate").disabled = true;

    const feedback = document.createElement("div");
    feedback.id = "feedback";
    feedback.style.fontWeight = "bold";
    feedback.style.marginTop = "10px";

    if (usuarioEscala === requiereEscalar) {
        puntuacion += 25;
        feedback.textContent = "✅ Correcto";
    } else {
        vidas--;
        feedback.textContent = "❌ Incorrecto";
    }

    if (alertaActiva) alertaActiva.remove();
    alertaActiva = null;
    alertasRespondidas++;

    card.appendChild(feedback);
    document.getElementById("score").textContent = puntuacion;
    document.getElementById("lives").textContent = vidas;

    setTimeout(() => {
        card.style.display = "none";
        if (vidas <= 0 || alertasRespondidas >= maxAlerts) {
            mostrarPopupFinJuego(vidas > 0);
        } else {
            nuevaAlerta();
        }
    }, 1000);
}

// ------------------ POPUP FIN DE JUEGO ------------------
function mostrarPopupFinJuego(gano) {
    const mensaje = gano
        ? `🎉 ¡Felicidades! Has completado todas las alertas.<br>Score final: ${puntuacion} (${obtenerRango(puntuacion)})`
        : `💀 Fin del turno.<br>Score final: ${puntuacion} (${obtenerRango(puntuacion)})`;

    const popup = document.createElement("div");
    popup.id = "popup_fin";
    popup.innerHTML = `
        <div class="popup_content">
            <p>${mensaje}</p>
            <button id="btn_replay">Jugar otra vez</button>
            <button id="btn_exit">Salir</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById("btn_replay").onclick = () => reiniciarJuego();
    document.getElementById("btn_exit").onclick = () => window.location.href = "./index.html";
}

// ------------------ RANGOS ------------------
function obtenerRango(puntuacion) {
    if (puntuacion <= 100) return "Junior Analyst";
    if (puntuacion <= 200) return "Intermediate Analyst";
    if (puntuacion <= 300) return "Senior Analyst";
    if (puntuacion <= 400) return "Threat Hunter Pro";
    return "SOC Master";
}

// ------------------ REINICIAR JUEGO ------------------
function reiniciarJuego() {
    puntuacion = 0;
    vidas = 3;
    alertCounter = 0;
    alertasRespondidas = 0;
    requiereEscalar = false;
    alertaActiva = null;

    document.getElementById("score").textContent = puntuacion;
    document.getElementById("lives").textContent = vidas;
    document.getElementById("alert_list").innerHTML = "";
    const card = document.getElementById("ticket_card");
    card.style.display = "none";
    const popup = document.getElementById("popup_fin");
    if (popup) popup.remove();

    nuevaAlerta();
}

// ------------------ INICIAR PRIMERA ALERTA ------------------
document.addEventListener("DOMContentLoaded", () => {
    nuevaAlerta();

    const btnToggle = document.getElementById("toggle_panel_btn");
    const panel = document.getElementById("alert_panel");
    if (btnToggle && panel) {
        btnToggle.addEventListener("click", () => {
            panel.classList.toggle("show");
        });
    }
});
