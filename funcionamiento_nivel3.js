let score = 0;
let lives = 3;
let currentAlertKey = null;
let currentScenario = null;   // ← importante para acceder a la respuesta correcta

// Función de rango
function obtenerRango(puntos) {
    if (puntos <= 100) return "Junior Analyst";
    if (puntos <= 200) return "Intermediate Analyst";
    if (puntos <= 300) return "Senior Analyst";
    if (puntos <= 400) return "Threat Hunter Pro";
    return "SOC Master";
}

// Generadores aleatorios
const randomIP = () =>
    `${Math.floor(Math.random()*223)+1}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

const randomHost = () => `SRV-${Math.floor(Math.random()*100)}`;

const randomUser = () => {
    const users = ["jmartinez","agarcia","mlopez","lrodriguez","backupsvc","dtorres","cfernandez","mmorales","jsanchez","lhernandez"];
    return users[Math.floor(Math.random()*users.length)];
};

// Diccionario de alertas ampliado - TODOS EN ESPAÑOL
const alertDictionary = {

    phishing: {
        name: "Phishing con PowerShell",
        generate: () => {
            const ip = randomIP(); 
            const user = randomUser();
            return {
                alertHTML: `<div class="alert">Host: ${randomHost()}<br>Usuario: ${user}<br>IP Origen: ${ip}<br>Severidad: Alta<br>Evento: winword.exe → powershell.exe -enc → conexión externa sospechosa</div>`,
                logs: [
                    "Evento 4688 - winword.exe genera powershell.exe",
                    "PowerShell -nop -w hidden -enc ...",
                    `Conexión HTTPS hacia ${ip} (dominio desconocido)`,
                    "Sysmon EID 3 - Conexión de red detectada",
                    "Inicio de sesión en horario inusual",
                    "Comando codificado en línea detectado"
                ],
                correct: ["isolate", "blockip", "kill", "quarantine"],
                explanation: "Documento malicioso ejecuta PowerShell codificado → probable canal de comando y control (C2)."
            };
        }
    },

    spraying: {
        name: "Password Spraying",
        generate: () => { 
            const ip = randomIP(); 
            return {
                alertHTML: `<div class="alert">Host: DC-${Math.floor(Math.random()*3)+1}<br>Usuarios: múltiples<br>IP Origen: ${ip}<br>Severidad: Media-Alta<br>Evento: múltiples intentos fallidos 4625 (patrón spraying)</div>`,
                logs: [
                    "Evento 4625 - múltiples intentos fallidos de inicio de sesión",
                    `Origen ${ip} - subred no corporativa`,
                    "Varias cuentas objetivo en corto tiempo",
                    "Aún sin bloqueos de cuenta (bajo y lento)",
                    "Sin indicadores de malware en el origen"
                ],
                correct: ["blockip", "reset", "monitor"],
                explanation: "Ataque de pulverización de contraseñas distribuido. Bloquear IP y forzar cambio de contraseñas."
            }; 
        }
    },

    webshell: {
        name: "Web Shell en IIS",
        generate: () => { 
            const ip = randomIP(); 
            const host = `WEB-${Math.floor(Math.random()*5)+1}`;
            return {
                alertHTML: `<div class="alert">Host: ${host}<br>Pool: IIS APPPOOL<br>IP Origen: ${ip}<br>Severidad: Crítica<br>Evento: w3wp.exe → cmd.exe + creación de archivos</div>`,
                logs: [
                    "w3wp.exe genera cmd.exe / powershell.exe",
                    "Archivo sospechoso creado: shell.aspx / error.aspx",
                    `Salida HTTPS hacia ${ip}`,
                    "WebDAV o subida de archivo detectada",
                    "Archivo gzip/zip depositado en wwwroot"
                ],
                correct: ["isolate", "blockip", "quarantine", "collect"],
                explanation: "Web shell subida y activa → contención inmediata requerida."
            }; 
        }
    },

    backup: {
        name: "Copia de Seguridad Programada (Falso Positivo)",
        generate: () => { 
            const host = `FILE-${Math.floor(Math.random()*5)+1}`;
            return {
                alertHTML: `<div class="alert">Host: ${host}<br>Usuario: backupsvc<br>Severidad: Baja-Media<br>Evento: creación masiva de .bak / .zip a las 02:15</div>`,
                logs: [
                    "backup.exe / robocopy.exe en ejecución",
                    "Destino interno 10.10.x.x",
                    "Coincide con horario programado",
                    "Sin conexiones externas",
                    "Cuenta de servicio conocida"
                ],
                correct: ["false", "tune"],
                explanation: "Tarea legítima de copia de seguridad automatizada. Se puede suprimir o ajustar la regla."
            }; 
        }
    },

    mimikatz: {
        name: "Extracción de Credenciales - Estilo Mimikatz",
        generate: () => {
            const host = randomHost();
            const user = randomUser();
            return {
                alertHTML: `<div class="alert">Host: ${host}<br>Usuario: ${user}<br>Severidad: Crítica<br>Evento: acceso a memoria de lsass.exe + proceso sospechoso</div>`,
                logs: [
                    "Evento 4688 - procdump.exe / mimikatz.exe",
                    "Solicitud de handle a lsass.exe (privilegios altos)",
                    "Sysmon EID 10 - acceso a proceso lsass",
                    "Patrón sekurlsa::logonpasswords",
                    "PowerShell Get-Process lsass"
                ],
                correct: ["isolate", "kill", "quarantine", "reset", "report"],
                explanation: "Intento de robo de credenciales (Mimikatz / procdump). Aislamiento inmediato + cambio urgente de contraseñas."
            };
        }
    },

    ransomware: {
        name: "Actividad de Ransomware (Cifrado)",
        generate: () => {
            const host = randomHost();
            return {
                alertHTML: `<div class="alert">Host: ${host}<br>Severidad: Crítica<br>Evento: modificación masiva de archivos .encrypted / .lockbit</div>`,
                logs: [
                    "Cientos de archivos modificados en minutos",
                    "Nueva extensión añadida (.conti, .lockbit, etc.)",
                    "vssadmin delete shadows ejecutado",
                    "bcdedit deshabilita recuperación",
                    "Eliminación de copias shadow con wmic"
                ],
                correct: ["isolate", "quarantine", "collect", "kill"],
                explanation: "Cifrado activo de ransomware en progreso. ¡Aislar inmediatamente!"
            };
        }
    },

    livingoffland: {
        name: "Living-off-the-Land - Descarga con Certutil",
        generate: () => {
            const ip = randomIP();
            return {
                alertHTML: `<div class="alert">Host: ${randomHost()}<br>Severidad: Alta<br>Evento: certutil.exe -urlcache -split -f http://...</div>`,
                logs: [
                    "certutil.exe descargando desde dominio externo",
                    "certutil -decode payload.b64 payload.exe",
                    `Conexión a ${ip}:80/443`,
                    "Cadena de ejecución LOLBin",
                    "No hay software legítimo usando certutil así"
                ],
                correct: ["isolate", "blockip", "kill", "quarantine"],
                explanation: "Abuso de binario legítimo (certutil) para descargar payload → probable dropper de malware."
            };
        }
    },

    scan_internal: {
        name: "Escaneo de Puertos Interno (Posible Reconocimiento)",
        generate: () => {
            const ip = randomIP();
            return {
                alertHTML: `<div class="alert">Host: ${randomHost()}<br>IP Origen: ${ip}<br>Severidad: Media<br>Evento: cientos de intentos de conexión a puertos (TCP SYN)</div>`,
                logs: [
                    "Múltiples puertos únicos atacados en varios hosts",
                    "Patrón similar a Nmap (SYN scan)",
                    `Origen ${ip} no está en lista de escáneres autorizados`,
                    "No hay pentest autorizado en curso"
                ],
                correct: ["blockip", "investigate", "isolate"],
                explanation: "Reconocimiento interno / escaneo de puertos detectado. Posible pivoteo de atacante."
            };
        }
    },

    psexec_legit: {
        name: "Uso Legítimo de PsExec (Falso Positivo)",
        generate: () => {
            const user = randomUser();
            return {
                alertHTML: `<div class="alert">Host: ${randomHost()}<br>Usuario: ${user}<br>Severidad: Media<br>Evento: instalación servicio PSEXESVC + cmd.exe</div>`,
                logs: [
                    "Servicio PSEXESVC creado",
                    "Cuenta de administrador conocida",
                    "Ejecución en horario laboral",
                    "Servidor objetivo en lista de jump hosts",
                    "Sin tráfico saliente inusual"
                ],
                correct: ["false", "tune", "investigate"],
                explanation: "Administración remota legítima con PsExec por equipo de IT. Probable falso positivo."
            };
        }
    },

    defender_update: {
        name: "Actualización de Firmas Defender (Falso Positivo)",
        generate: () => {
            return {
                alertHTML: `<div class="alert">Host: varios<br>Severidad: Baja<br>Evento: alto tráfico saliente a *.update.microsoft.com</div>`,
                logs: [
                    "Conexiones a servidores de actualización Microsoft",
                    "Coincide con martes de parches mensual",
                    "Proceso: MsMpEng.exe / wuauclt.exe",
                    "Sin descarga de ejecutables",
                    "Patrón conocido semanal"
                ],
                correct: ["false", "tune"],
                explanation: "Comportamiento normal de Windows Defender / Windows Update. Se puede suprimir."
            };
        }
    },

    insider_exfil: {
        name: "Posible Exfiltración de Datos por Insider",
        generate: () => {
            const user = randomUser();
            const ip = randomIP();
            return {
                alertHTML: `<div class="alert">Host: ${randomHost()}<br>Usuario: ${user}<br>Severidad: Alta<br>Evento: subida de +500 MB a mega.nz / dropbox</div>`,
                logs: [
                    "Gran subida HTTPS a nube personal",
                    `Destino ${ip} / dominio mega.nz`,
                    "Usuario sin necesidad laboral para esta acción",
                    "Múltiples archivos RAR/ZIP creados antes",
                    "Actividad fuera de horario"
                ],
                correct: ["isolate", "blockip", "monitor", "report", "quarantine"],
                explanation: "Posible robo de datos por insider o cuenta comprometida. Investigación urgente."
            };
        }
    },

    malicious_doc_macro: {
        name: "Documento Office con Macro Maliciosa",
        generate: () => {
            const user = randomUser();
            return {
                alertHTML: `<div class="alert">Host: ${randomHost()}<br>Usuario: ${user}<br>Severidad: Alta<br>Evento: winword.exe → proceso hijo sospechoso + red</div>`,
                logs: [
                    "winword.exe genera cmd/powershell/rundll32",
                    "Macro AutoOpen / Document_Open ejecutada",
                    "Ejecución sospechosa vía DDE o WMI",
                    "Conexión saliente tras apertura",
                    "Archivo proveniente de email no confiable"
                ],
                correct: ["isolate", "quarantine", "kill", "blockip"],
                explanation: "Macro maliciosa en documento Office ejecutó código. Vector clásico de acceso inicial."
            };
        }
    }
};

// Referencias a modales
const modalCorrecto   = document.getElementById("modal-correcto");
const modalIncorrecto = document.getElementById("modal-incorrecto");
const modalGameOver   = document.getElementById("modal-gameover");

// Función auxiliar para cerrar modal y avanzar (excepto en game over)
function cerrarModalYAvanzar(modal) {
    if (!modal) return;
    modal.style.display = "none";
    
    // Solo avanzamos si NO es el modal de game over
    if (modal.id !== "modal-gameover") {
        loadNewAlert();
    }
}

// Unificar comportamiento: tanto la X como el botón Continuar hacen lo mismo
document.querySelectorAll(".close-modal, .btn-continuar").forEach(element => {
    element.addEventListener("click", () => {
        const modal = element.closest(".modal");
        cerrarModalYAvanzar(modal);
    });
});

// Botones de salir
document.querySelectorAll(".btn-salir").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = "./seleccion_nivel.html";
    });
});

// Botón reiniciar
document.querySelector(".btn-reiniciar")?.addEventListener("click", resetGame);

// Cargar nueva alerta
function loadNewAlert() {
    if (lives <= 0) {
        showGameOver();
        return;
    }

    const keys = Object.keys(alertDictionary);
    let newKey;
    do {
        newKey = keys[Math.floor(Math.random() * keys.length)];
    } while (newKey === currentAlertKey && keys.length > 1);

    currentAlertKey = newKey;
    currentScenario = alertDictionary[newKey].generate();

    document.getElementById("alerts").innerHTML = currentScenario.alertHTML;

    const logsDiv = document.getElementById("logs");
    logsDiv.innerHTML = "";
    currentScenario.logs.forEach(log => {
        logsDiv.innerHTML += `<div class="log">${log}</div>`;
    });

    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("lives").innerText = "Vidas: " + lives;
}

// Acción del jugador
function action(choice) {
    if (!currentScenario) return;

    if (currentScenario.correct.includes(choice)) {
        score += 25;
        document.getElementById("score").innerText = "Score: " + score;
        modalCorrecto.style.display = "block";
    } else {
        lives -= 1;
        document.getElementById("lives").innerText = "Vidas: " + lives;

        if (lives <= 0) {
            showGameOver();
            return;
        }

        const textoVidas = modalIncorrecto.querySelector("#texto-vidas-restantes");
        if (textoVidas) {
            textoVidas.innerText = `Vidas restantes: ${lives}`;
        }
        modalIncorrecto.style.display = "block";
    }
}

// Game Over
function showGameOver() {
    document.getElementById("puntuacion-final").innerText = `Puntuación final: ${score}`;
    document.getElementById("rango-final").innerText = `Rango: ${obtenerRango(score)}`;
    modalGameOver.style.display = "block";
}

// Reiniciar
function resetGame() {
    score = 0;
    lives = 3;
    currentAlertKey = null;
    currentScenario = null;
    modalGameOver.style.display = "none";
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("lives").innerText = "Vidas: " + lives;
    loadNewAlert();
}

// Inicio
loadNewAlert();