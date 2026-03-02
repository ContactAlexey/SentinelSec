// ------------------ VARIABLES DEL JUEGO ------------------
let puntuacion = 0;
let vidas = 3;

function obtenerRango(puntos) {
    if (puntos <= 100) return "Junior Analyst";
    if (puntos <= 200) return "Intermediate Analyst";
    if (puntos <= 300) return "Senior Analyst";
    if (puntos <= 400) return "Threat Hunter Pro";
    return "SOC Master";
}

// ------------------ Datos de contexto ------------------
const nombresHosts = ["WS-0423", "SRV-FIN01", "LTP-MARIA", "DESK-JUAN", "SRV-AD01", "WS-0871", "LTP-ROSA", "SRV-DB02", "WKST-019", "SRV-APP03"];
const usuarios = ["maria.lopez", "juan.perez", "ana.gomez", "carlos.ruiz", "admin.it", "laura.martin", "pedro.sanchez", "sofia.hernandez", "david.mora"];
const departamentos = ["Finanzas", "IT", "RRHH", "Ventas", "Seguridad", "Operaciones"];
const ipsEjemplo = ["10.40.12.45", "192.168.45.112", "172.16.8.77", "10.30.200.33", "45.79.112.145", "198.51.100.22", "10.50.1.88", "172.30.99.15"];

function getRandom(arr) {
    if (!arr || arr.length === 0) return "—";
    return arr[Math.floor(Math.random() * arr.length)];
}

function enriquecerAlerta(alertaBase, sharedContext = null) {
    // Si hay contexto compartido → usamos esos valores
    let host      = sharedContext?.host      || getRandom(nombresHosts);
    let user      = sharedContext?.user      || getRandom(usuarios);
    let department = sharedContext?.department || getRandom(departamentos);
    let ip        = sharedContext?.ip        || getRandom(ipsEjemplo);

    // Si NO hay contexto compartido, pero queremos temática similar (caso legacy)
    if (!sharedContext) {
        if (alertaBase.activity?.toLowerCase().includes("noche") || alertaBase.activity?.includes("AM")) {
            // Podríamos filtrar usuarios que "trabajan de noche", pero por simplicidad lo dejamos random
        }
        if (alertaBase.activity?.toLowerCase().includes("extern") || 
            alertaBase.activity?.toLowerCase().includes("nube") || 
            alertaBase.activity?.toLowerCase().includes("exfiltración")) {
            ip = getRandom(ipsEjemplo.filter(i => i.startsWith("45.") || i.startsWith("198.")));
        }
    }

    return {
        ...alertaBase,
        host,
        user,
        department,
        ip,
        os: getRandom(["Windows 11 Enterprise", "Windows Server 2022", "Windows 10 Pro", "Ubuntu 22.04 LTS"]),
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 5).toLocaleString("es-ES", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
        })
    };
}

function getSeverityColor(sev) {
    const colors = {
        "High":   "#ef4444",
        "Medium": "#f59e0b",
        "Low":    "#3b82f6"
    };
    return colors[sev] || "#6b7280";
}

function fillAlert(container, alertData) {
    if (!container) {
        console.error("No se encontró contenedor para alerta");
        return;
    }

    const allParagraphs = container.querySelectorAll('p');

    // Resetear campos
    allParagraphs.forEach(p => {
        if (p.querySelector('strong')) {
            const strong = p.querySelector('strong');
            const label = strong.textContent.replace(':', '').trim();
            if (label !== "Status") {
                p.innerHTML = `<strong>${label}:</strong> —`;
            }
        }
    });

    const updateField = (labelText, value) => {
        for (const p of allParagraphs) {
            if (p.innerHTML.includes(`<strong>${labelText}:</strong>`)) {
                p.innerHTML = `<strong>${labelText}:</strong> ${value || '—'}`;
                return true;
            }
        }
        console.warn(`Campo no encontrado: ${labelText}`);
        return false;
    };

    try {
        updateField("Alert Name", alertData.alertName);
        updateField("Severity", `<span style="color: ${getSeverityColor(alertData.severity)}">${alertData.severity}</span>`);

        updateField("Host", alertData.host);
        updateField("OS", alertData.os);
        updateField("User", alertData.user);
        updateField("Department", alertData.department);

        updateField("Activity", alertData.activity);
        updateField("Timestamp", alertData.timestamp);
        updateField("Source IP", alertData.ip);

        const contextP = container.querySelector('h3:last-of-type + p');
        if (contextP) {
            contextP.textContent = alertData.context || "Sin contexto adicional";
        }
    } catch (err) {
        console.error("Error al rellenar alerta:", err);
    }
}

// ------------------ Diccionarios ------------------
const escalatedAlerts = [
    // Low (5)
    { id: 1,  alertName: "Inicio de sesión en horario extraño",          severity: "Low", activity: "Inicio de sesión a las 03:12 AM",                  context: "Fuera del horario laboral, monitorizar" },
    { id: 2,  alertName: "Correo enviado a dominio externo desconocido", severity: "Low", activity: "Se envió correo",                                   context: "Posible fuga de datos, revisar" },
    { id: 3,  alertName: "Acceso desde dispositivo no registrado",       severity: "Low", activity: "Inicio de sesión exitoso",                         context: "Monitorizar dispositivo" },
    { id: 4,  alertName: "Descarga de archivo interno sospechosa",       severity: "Low", activity: "Archivo PDF descargado",                             context: "Verificar si es crítico" },
    { id: 5,  alertName: "Inicio de sesión concurrente inusual",         severity: "Low", activity: "Usuario activo en 2 ubicaciones",                    context: "Monitorizar comportamiento" },

    // Medium (13)
    { id: 6,  alertName: "Carga de datos inusual",                       severity: "Medium", activity: "2GB cargados a la nube",                          context: "Fuera del horario laboral" },
    { id: 7,  alertName: "Ejecución sospechosa de script",               severity: "Medium", activity: "Se lanzó PowerShell con comandos codificados",     context: "Actividad anómala" },
    { id: 8,  alertName: "Múltiples intentos fallidos de inicio de sesión", severity: "Medium", activity: "Usuario falló 15 veces",                     context: "Cuenta no bloqueada" },
    { id: 9,  alertName: "Copia interna de archivos no autorizada",      severity: "Medium", activity: "Se copiaron 1000 archivos",                        context: "No autorizado" },
    { id: 10, alertName: "Clic en enlace de phishing",                   severity: "Medium", activity: "Usuario clicó enlace sospechoso",                  context: "Dominio externo no confiable" },
    { id: 11, alertName: "Escaneo de puertos inusual",                   severity: "Medium", activity: "Escaneo detectado en la red interna",              context: "Firewall activado" },
    { id: 12, alertName: "Acceso a datos fuera del rol",                 severity: "Medium", activity: "Accedió a registros de RRHH",                     context: "No pertenece a RRHH" },
    { id: 13, alertName: "Adjunto de correo malicioso detectado",        severity: "Medium", activity: "Adjunto marcado",                                  context: "Contenido sospechoso" },
    { id: 14, alertName: "Escritorio remoto no autorizado",              severity: "Medium", activity: "Intento de RDP detectado",                         context: "Usuario no permitido" },
    { id: 15, alertName: "Acceso a almacenamiento externo sospechoso",   severity: "Medium", activity: "Unidad USB conectada",                             context: "Monitorizar transferencia de datos" },
    { id: 16, alertName: "Actividad inusual de procesos",                severity: "Medium", activity: "Proceso desconocido consumiendo CPU",              context: "Investigar" },
    { id: 17, alertName: "Intento de acceso con credenciales expiradas", severity: "Medium", activity: "Login rechazado",                                 context: "Usuario bloqueado temporalmente" },
    { id: 18, alertName: "Actividad de red sospechosa",                  severity: "Medium", activity: "Tráfico elevado a IP desconocida",                context: "Monitorizar" },

    // High (28 ahora)
    { id: 19, alertName: "Actividad de ransomware detectada",            severity: "High", activity: "Archivos cifrados",                                 context: "Amenaza crítica" },
    { id: 20, alertName: "Malware C2 detectado",                         severity: "High", activity: "Conexiones a servidor C2",                          context: "Malware confirmado" },
    { id: 21, alertName: "Explotación Zero-Day",                         severity: "High", activity: "Sistema comprometido",                              context: "Parche no disponible" },
    { id: 22, alertName: "Secuestro de sesión",                          severity: "High", activity: "Sesión activa tomada",                              context: "Usuario comprometido" },
    { id: 23, alertName: "Intento de inyección SQL",                     severity: "High", activity: "Consulta con OR 1=1",                               context: "Bloqueado por WAF" },
    { id: 24, alertName: "Robo de credenciales",                         severity: "High", activity: "Múltiples intentos de login con credenciales robadas", context: "Cuentas bloqueadas" },
    { id: 25, alertName: "Fuga de datos por correo electrónico",        severity: "High", activity: "Datos sensibles enviados externamente",             context: "Usuario no autorizado" },
    { id: 26, alertName: "Ataque a la cadena de suministro",            severity: "High", activity: "Software malicioso instalado",                      context: "Compromiso de proveedor" },
    { id: 27, alertName: "Ataque Man-in-the-Middle",                    severity: "High", activity: "Tráfico interceptado",                              context: "Usuario en WiFi pública" },
    { id: 28, alertName: "Beacon de comando y control",                  severity: "High", activity: "Conexiones periódicas detectadas",                  context: "Malware confirmado" },
    { id: 29, alertName: "Minería de criptomonedas detectada",           severity: "High", activity: "Uso alto de CPU por proceso desconocido",           context: "Software no autorizado" },
    { id: 30, alertName: "Actividad inusual de USB",                     severity: "High", activity: "Se copiaron grandes datos a USB",                   context: "Dispositivo no aprobado" },
    { id: 31, alertName: "Ejecución sospechosa de PowerShell",           severity: "High", activity: "Comando codificado ejecutado",                      context: "Correo sospechoso abierto" },
    { id: 32, alertName: "Intento de borrado masivo de datos",           severity: "High", activity: "Archivos críticos eliminados",                      context: "Intervención inmediata requerida" },
    { id: 33, alertName: "Acceso remoto no autorizado detectado",        severity: "High", activity: "RDP activo desde IP desconocida",                   context: "Usuario bloqueado" },
    { id: 34, alertName: "Interceptación de correos internos",           severity: "High", activity: "Tráfico cifrado interceptado",                      context: "Investigación urgente" },
    { id: 35, alertName: "Exfiltración de datos detectada",              severity: "High", activity: "Archivos sensibles transferidos",                   context: "Alerta inmediata" },
    { id: 36, alertName: "Desactivación de antivirus detectada",         severity: "High", activity: "Protección del endpoint apagada",                   context: "Intervención requerida" },
    { id: 37, alertName: "Intento de escalamiento de privilegios",       severity: "High", activity: "Usuario ejecutó comando admin",                     context: "Bloqueado automáticamente" },
    { id: 38, alertName: "Inyección de malware por USB",                 severity: "High", activity: "Archivo ejecutable detectado",                      context: "Alerta crítica" },
    { id: 39, alertName: "Conexión a red externa no autorizada",         severity: "High", activity: "Acceso bloqueado",                                  context: "Monitorizar tráfico" },
    { id: 40, alertName: "Detección de troyano",                         severity: "High", activity: "Archivo aislado",                                   context: "Usuario bloqueado" },
    { id: 41, alertName: "Acceso a base de datos no autorizado",         severity: "High", activity: "Intento bloqueado",                                 context: "Revisar logs" },
    { id: 42, alertName: "Intento de ejecución de ransomware",           severity: "High", activity: "Proceso detenido",                                  context: "Alerta inmediata" },
    { id: 43, alertName: "Ataque DDoS detectado",                        severity: "High", activity: "Tráfico mitigado por firewall",                     context: "Monitorizar red" },
    { id: 44, alertName: "Acceso simultáneo sospechoso",                 severity: "High", activity: "Sesión detectada desde varias IPs",                 context: "Monitorizar actividad" },
    { id: 45, alertName: "Intento de explotación de vulnerabilidad web", severity: "High", activity: "Bloqueado por WAF",                                context: "Monitorizar seguridad" },
    
    // La nueva añadida (id 46)
    { id: 46, alertName: "Modificación no autorizada de registros del sistema", severity: "High", activity: "Archivos de sistema alterados (ej. /etc/passwd o registry keys)", context: "Posible persistencia de atacante, revisar inmediatamente" }
];

const relatedAlerts = [
    // Low (10) - relacionadas
    { id: 101, alertName: "Intento de inicio de sesión extraño",            severity: "Low",  activity: "Inicio de sesión a las 02:58 AM",               context: "Fuera del horario laboral, monitorizar",         match: true },
    { id: 106, alertName: "Inicio de sesión desde país inusual",            severity: "Low",  activity: "Login desde nueva geolocalización",       context: "Primer acceso desde esa región",                 match: true },
    { id: 107, alertName: "Correo a destinatario externo poco frecuente",   severity: "Low",  activity: "Correo enviado a dominio externo",         context: "Contacto no habitual",                           match: true },
    { id: 108, alertName: "Acceso desde navegador no habitual",             severity: "Low",  activity: "Login con nuevo user-agent",               context: "Dispositivo o navegador desconocido",            match: true },
    { id: 109, alertName: "Descarga de archivo grande inusual",             severity: "Low",  activity: "Descargados 850 MB en una hora",           context: "Fuera de patrón normal del usuario",             match: true },
    { id: 110, alertName: "Múltiples sesiones simultáneas",                 severity: "Low",  activity: "Usuario con 3 sesiones activas",           context: "Posible dispositivo compartido",                 match: true },
    { id: 111, alertName: "Conexión VPN a horario atípico",                 severity: "Low",  activity: "VPN conectada a las 04:15 AM",             context: "Fuera de horario habitual",                      match: true },
    { id: 112, alertName: "Cambio de contraseña fuera de política",         severity: "Low",  activity: "Usuario cambió su contraseña",             context: "No solicitado por vencimiento",                  match: true },
    { id: 113, alertName: "Uso elevado de ancho de banda",                  severity: "Low",  activity: "Consumo de 4.2 GB en 2 horas",             context: "Actividad atípica para el usuario",              match: true },
    { id: 114, alertName: "Acceso a recurso compartido no frecuente",       severity: "Low",  activity: "Acceso a carpeta de finanzas",             context: "Usuario accede raramente",                       match: true },

    // Medium (15) - relacionadas
    { id: 102, alertName: "Carga anómala de archivos",                      severity: "Medium", activity: "1.8GB subidos a la nube",                    context: "Actividad inusual",                              match: true },
    { id: 104, alertName: "Clic en enlace sospechoso",                      severity: "Medium", activity: "Usuario hizo click en phishing",             context: "Dominio externo no confiable",                   match: true },
    { id: 115, alertName: "Múltiples intentos fallidos en corto tiempo",    severity: "Medium", activity: "22 intentos fallidos en 4 minutos",          context: "Posible fuerza bruta",                           match: true },
    { id: 116, alertName: "Ejecución de script no permitido",               severity: "Medium", activity: "PowerShell con base64 detectado",            context: "Comportamiento anómalo",                         match: true },
    { id: 117, alertName: "Acceso a datos sensibles fuera de horario",      severity: "Medium", activity: "Acceso a base de datos a las 01:40 AM",      context: "Fuera de horario laboral",                       match: true },
    { id: 118, alertName: "Conexión desde IP en lista de vigilancia",       severity: "Medium", activity: "Login desde IP reportada como riesgosa",     context: "IP en reputación media-alta",                    match: true },
    { id: 119, alertName: "Transferencia masiva a USB",                     severity: "Medium", activity: "320 archivos copiados a unidad externa",     context: "Volumen elevado en poco tiempo",                 match: true },
    { id: 120, alertName: "Intento de acceso a puerto administrativo",      severity: "Medium", activity: "Conexión a puerto 3389 bloqueada",           context: "RDP no autorizado para el usuario",              match: true },
    { id: 121, alertName: "Proceso hijo sospechoso creado",                 severity: "Medium", activity: "cmd.exe → powershell.exe",                   context: "Cadena de procesos atípica",                     match: true },
    { id: 122, alertName: "Correo con adjunto .exe o .zip sospechoso",      severity: "Medium", activity: "Adjunto marcado como potencialmente malicioso", context: "Revisión recomendada",                        match: true },
    { id: 123, alertName: "Escalamiento de privilegios bloqueado",          severity: "Medium", activity: "Intento de RunAs /elevate detectado",        context: "Bloqueado por política",                         match: true },
    { id: 124, alertName: "Tráfico DNS a dominio recién registrado",        severity: "Medium", activity: "Consulta DNS a dominio de 3 días de antigüedad", context: "Posible C2 o phishing",                     match: true },
    { id: 125, alertName: "Acceso a shadow copy o volúmenes ocultos",       severity: "Medium", activity: "Acceso a VSS detectado",                     context: "Técnica común en ransomware",                    match: true },
    { id: 126, alertName: "Creación de cuenta local inusual",               severity: "Medium", activity: "Nueva cuenta creada en workstation",         context: "Fuera de proceso de IT",                         match: true },
    { id: 127, alertName: "Deshabilitación de Windows Defender",            severity: "Medium", activity: "Protección en tiempo real desactivada",      context: "Acción manual detectada",                        match: true },

    // High (21) - relacionadas
    { id: 103, alertName: "Ransomware detectado en endpoint",               severity: "High", activity: "Cifrado de documentos",                        context: "Amenaza crítica",                                match: true },
    { id: 105, alertName: "Sesión comprometida detectada",                  severity: "High", activity: "Usuario no autorizado accedió",                context: "Usuario comprometido",                           match: true },
    { id: 128, alertName: "Exfiltración masiva de datos detectada",         severity: "High", activity: "2.4 TB enviados a IP externa",                 context: "Transferencia crítica en curso",                 match: true },
    { id: 129, alertName: "Ejecución de ransomware simulada",               severity: "High", activity: "Proceso de cifrado detenido por EDR",          context: "Intento activo confirmado",                      match: true },
    { id: 130, alertName: "Comando de persistencia detectado",              severity: "High", activity: "Nueva clave Run/RunOnce creada",               context: "Persistencia de atacante",                       match: true },
    { id: 131, alertName: "Beacon de Cobalt Strike / similar detectado",    severity: "High", activity: "Conexiones periódicas cada 60s",               context: "C2 confirmado",                                  match: true },
    { id: 132, alertName: "Uso de herramienta de dumping de credenciales",  severity: "High", activity: "lsass.exe accedido de forma sospechosa",      context: "Posible Mimikatz o similar",                     match: true },
    { id: 133, alertName: "Ataque de pass-the-hash detectado",              severity: "High", activity: "Autenticación Kerberos anómala",               context: "Credenciales reutilizadas",                      match: true },
    { id: 134, alertName: "Despliegue lateral vía WMI o PsExec",            severity: "High", activity: "Ejecución remota en 4 hosts",                  context: "Movimiento lateral activo",                      match: true },
    { id: 135, alertName: "Modificación de registro SAM o SYSTEM",          severity: "High", activity: "Claves críticas alteradas",                    context: "Persistencia / escalamiento",                    match: true },
    { id: 136, alertName: "Cifrado de unidades de red detectado",           severity: "High", activity: "Archivos .encrypted en share",                 context: "Propagación de ransomware",                      match: true },
    { id: 137, alertName: "Túnel inverso o proxy detectado",                severity: "High", activity: "Conexión saliente a puerto no estándar",       context: "Túnel de comando y control",                     match: true },
    { id: 138, alertName: "Desactivación de políticas de grupo críticas",   severity: "High", activity: "GPO de seguridad modificada",                  context: "Sabotaje de controles",                          match: true },
    { id: 139, alertName: "Ejecución de binario no firmado crítico",        severity: "High", activity: " rundll32.exe + javascript o similar",         context: "Técnica de living-off-the-land",                 match: true },
    { id: 140, alertName: "Borrado selectivo de logs de eventos",           severity: "High", activity: "Eventos 4624/4672 eliminados",                 context: "Intento de cubrir huellas",                      match: true },
    { id: 141, alertName: "Compromiso de cuenta de servicio privilegiada",  severity: "High", activity: "Login con cuenta svc-admin",                   context: "Cuenta crítica comprometida",                    match: true },
    { id: 142, alertName: "Explotación de vulnerabilidad crítica reciente", severity: "High", activity: "CVE-2025-xxxx explotado",                    context: "Sistema comprometido",                           match: true },
    { id: 143, alertName: "Detección de webshell en servidor web",          severity: "High", activity: "Archivo .aspx/.php sospechoso ejecutado",      context: "Acceso persistente vía web",                     match: true },
    { id: 144, alertName: "Minado de criptomonedas a gran escala",          severity: "High", activity: "CPU/GPU al 98% por proceso XMRig-like",        context: "Abuso de recursos confirmado",                   match: true },
    { id: 145, alertName: "Intento de wipe masivo de discos",               severity: "High", activity: "Comando de formateo/borrado detectado",        context: "Destrucción intencional de datos",               match: true },
    { id: 146, alertName: "Compromiso de cuenta de dominio (DA/EA)",        severity: "High", activity: "Login exitoso con cuenta de Domain Admin",     context: "Dominio comprometido - emergencia",              match: true },

    // Falsos positivos / no relacionados (5)
    { id: 201, alertName: "Actualización de software aprobada",             severity: "Medium", activity: "Descarga completada",                        context: "Actividad rutinaria",                            match: false },
    { id: 202, alertName: "Uso de impresora autorizado",                    severity: "Low",    activity: "Se imprimieron documentos internos",            context: "Usuario aprobado",                               match: false },
    { id: 203, alertName: "Revisión rutinaria de logs",                     severity: "Medium", activity: "Logs revisados sin incidentes",              context: "Proceso normal",                                 match: false },
    { id: 204, alertName: "Backup completado",                              severity: "Low",    activity: "Copia de seguridad realizada",                   context: "Actividad rutinaria",                            match: false },
    { id: 205, alertName: "Actividad legítima de correo interno",           severity: "Low",    activity: "Correo enviado a dominio corporativo",           context: "No amenaza",                                     match: false }
];
const falsePositives = [
    // Actividades legítimas de IT / mantenimiento
    { id: 201, alertName: "Actualización de software aprobada",                  severity: "Low",    activity: "Actualización de Microsoft Office completada",     context: "Desplegada por SCCM / Intune",                   match: false },
    { id: 202, alertName: "Uso de impresora autorizado",                         severity: "Low",    activity: "Impresión de 18 páginas en color",                 context: "Usuario autorizado en política",                 match: false },
    { id: 203, alertName: "Revisión rutinaria de logs",                          severity: "Low",    activity: "Acceso a Event Viewer por analista",               context: "Tarea programada de auditoría",                  match: false },
    { id: 204, alertName: "Backup completado",                                   severity: "Low",    activity: "Copia de seguridad incremental finalizada",        context: "Veeam / Windows Backup exitoso",                 match: false },
    { id: 205, alertName: "Actividad legítima de correo interno",                severity: "Low",    activity: "Envío de correo masivo a distribución RRHH",       context: "Comunicación corporativa oficial",               match: false },

    // Autenticaciones y accesos normales
    { id: 206, alertName: "Inicio de sesión exitoso tras MFA",                   severity: "Low",    activity: "Login con autenticación multifactor",              context: "Comportamiento esperado",                        match: false },
    { id: 207, alertName: "Cambio de contraseña programado",                     severity: "Low",    activity: "Cambio de contraseña por vencimiento",             context: "Política de rotación cada 90 días",              match: false },
    { id: 208, alertName: "Acceso a VPN desde ubicación habitual",               severity: "Low",    activity: "Conexión VPN desde IP corporativa",                context: "Trabajo remoto autorizado",                      match: false },
    { id: 209, alertName: "Inicio de sesión en horario laboral normal",          severity: "Low",    activity: "Login a las 08:47 AM",                             context: "Dentro de horario habitual del usuario",         match: false },

    // Tareas automatizadas y scripts legítimos
    { id: 210, alertName: "Ejecución programada de script de mantenimiento",     severity: "Low",    activity: "PowerShell: Invoke-MaintenanceTask",               context: "Tarea programada por equipo de sistemas",        match: false },
    { id: 211, alertName: "Ejecución de SCCM client check",                      severity: "Low",    activity: "ccmexec.exe ejecutado con parámetros estándar",    context: "Inventario y parcheo automático",                match: false },
    { id: 212, alertName: "Tarea programada de Windows Defender",                severity: "Low",    activity: "MpCmdRun.exe -Scan -Schedule",                     context: "Escaneo programado nocturno",                    match: false },

    // Transferencias y descargas legítimas
    { id: 213, alertName: "Descarga de actualización de antivirus",              severity: "Low",    activity: "Definiciones de Defender descargadas (180 MB)",    context: "Actualización automática de firmas",             match: false },
    { id: 214, alertName: "Carga de archivo a SharePoint corporativo",           severity: "Low",    activity: "Subida de presentación de 45 MB",                  context: "Actividad normal en Microsoft 365",              match: false },
    { id: 215, alertName: "Envío de archivo grande por correo autorizado",       severity: "Low",    activity: "Adjunto de 120 MB enviado a proveedor",            context: "Aprobado por gestión",                           match: false },

    // Otros eventos comunes que generan ruido
    { id: 216, alertName: "Conexión RDP desde IP de la oficina",                 severity: "Low",    activity: "RDP desde 10.10.50.22 a WS-0423",                  context: "Soporte técnico interno",                        match: false },
    { id: 217, alertName: "Acceso a base de datos por aplicación autorizada",    severity: "Low",    activity: "Consulta desde ERP interno",                       context: "Aplicación de negocio legítima",                 match: false },
    { id: 218, alertName: "Evento de auditoría de creación de ticket",           severity: "Low",    activity: "Ticket #45872 creado en ServiceNow",               context: "Actividad de helpdesk",                          match: false },
    { id: 219, alertName: "Sincronización de OneDrive completada",               severity: "Low",    activity: "Sincronizados 2.1 GB de carpetas compartidas",     context: "Comportamiento normal del cliente OneDrive",     match: false },
    { id: 220, alertName: "Inicio de sesión en Teams / Outlook Web",             severity: "Low",    activity: "Acceso exitoso desde navegador Edge",              context: "Uso habitual de Microsoft 365",                  match: false },
    { id: 221, alertName: "Ejecución de proceso de indexación de Windows",       severity: "Low",    activity: "SearchIndexer.exe alto uso de CPU temporal",       context: "Indexación normal del sistema",                  match: false },
    { id: 222, alertName: "Conexión a servidor de archivos compartido",          severity: "Low",    activity: "Acceso a \\fileserver\Departamentos\Ventas",       context: "Acceso rutinario a carpeta departamental",       match: false }
];

// ------------------ Lógica principal ------------------
function populateAlerts() {
    const esRelacionada = Math.random() < 0.45;  // ~45% casos relacionados

    const basePrincipal = getRandom(escalatedAlerts);
    const baseSecundaria = esRelacionada 
        ? getRandom(relatedAlerts) 
        : getRandom(falsePositives);

    let alerta1, alerta2;

    if (esRelacionada) {
        const shared = {
            user: getRandom(usuarios),
            host: getRandom(nombresHosts),
            // IP compartida solo en ~60% de los casos (para no ser demasiado obvio)
            ip: Math.random() < 0.60 ? getRandom(ipsEjemplo) : null,
            department: getRandom(departamentos)  // también compartido
        };

        alerta1 = enriquecerAlerta(basePrincipal, shared);
        alerta2 = enriquecerAlerta(baseSecundaria, shared);
    } else {
        // Sin contexto compartido → todo random
        alerta1 = enriquecerAlerta(basePrincipal);
        alerta2 = enriquecerAlerta(baseSecundaria);
    }

    const contenedores = document.querySelectorAll('.contenedor_info');

    if (contenedores.length >= 2) {
        fillAlert(contenedores[0], alerta1);
        fillAlert(contenedores[1], alerta2);

        console.log("Alertas cargadas:", alerta1.alertName, "vs", alerta2.alertName);
        if (esRelacionada) {
            console.log("→ Relacionadas → mismo user/host:", alerta1.user, alerta1.host);
        }
    } else {
        console.error("No se encontraron suficientes contenedores .contenedor_info");
    }

    const btn = document.querySelector(".btn_enviar");
    if (btn) {
        btn.dataset.coinciden = esRelacionada ? "true" : "false";
    }

    const textarea = document.getElementById("analyst_response");
    if (textarea) textarea.value = "";
}

function actualizarEstadoUI() {
    document.getElementById("score").textContent = puntuacion;
    document.getElementById("lives").textContent = vidas;
    document.getElementById("rank_display").textContent = obtenerRango(puntuacion);
}

function evaluarDecision() {
    const select = document.getElementById("elecciones");
    if (!select || !select.value) {
        alert("Selecciona una decisión primero.");
        return;
    }

    const decision = select.value;
    const btn = document.querySelector(".btn_enviar");
    const sonRelacionadas = btn?.dataset?.coinciden === "true";

    const acierto = 
        (sonRelacionadas && decision === "Coinciden") ||
        (!sonRelacionadas && decision === "Investigar");

    const modalCorrecto   = document.getElementById("modal-correcto");
    const modalIncorrecto = document.getElementById("modal-incorrecto");
    const modalGameOver   = document.getElementById("modal-gameover");

    const cerrarModal = () => {
        [modalCorrecto, modalIncorrecto, modalGameOver].forEach(m => m && (m.style.display = "none"));
    };

    const salirAlMenu = () => {
        window.location.href = "./seleccion_nivel.html";
    };

    if (acierto) {
        puntuacion += 25;
        modalCorrecto && (modalCorrecto.style.display = "flex");
    } else {
        vidas--;
        const vidasTxt = document.getElementById("texto-vidas-restantes");
        if (vidasTxt) vidasTxt.textContent = `Vidas restantes: ${vidas}`;

        if (vidas <= 0) {
            const puntFinal = document.getElementById("puntuacion-final");
            const rangoFinal = document.getElementById("rango-final");
            if (puntFinal) puntFinal.textContent = `Puntuación final: ${puntuacion}`;
            if (rangoFinal) rangoFinal.textContent = `Rango: ${obtenerRango(puntuacion)}`;

            modalGameOver && (modalGameOver.style.display = "flex");

            puntuacion = 0;
            vidas = 3;
        } else {
            modalIncorrecto && (modalIncorrecto.style.display = "flex");
        }
    }

    actualizarEstadoUI();
    if (select) select.value = "";
    populateAlerts();

    setTimeout(() => {
        const zona = document.querySelector('.status_top') || document.body;
        zona.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    document.querySelectorAll('.close-modal, .btn-continuar').forEach(el => {
        el.onclick = cerrarModal;
    });

    document.querySelectorAll('.btn-salir').forEach(btn => {
        btn.onclick = salirAlMenu;
    });

    const btnReiniciar = document.querySelector('.btn-reiniciar');
    if (btnReiniciar) {
        btnReiniciar.onclick = () => {
            cerrarModal();
            actualizarEstadoUI();
            populateAlerts();
        };
    }
}

// ------------------ Inicio ------------------
document.addEventListener("DOMContentLoaded", () => {
    actualizarEstadoUI();
    populateAlerts();

    const boton = document.querySelector(".btn_enviar");
    if (boton) {
        boton.addEventListener("click", evaluarDecision);
    } else {
        console.error("No se encontró el botón .btn_enviar");
    }
});