// =========================================================================
// --- VARIABLES GLOBALES ---
// =========================================================================

// Arreglo para guardar nuestro historial. Actuará como una estructura de datos FIFO (First-In, First-Out)
let registrosHistorial = []; 
const COLOR_FRIO = "#b0bec5"; 
const COLOR_CALIENTE = "#ef5350"; 
const COLOR_CONTRACCION = "#4fc3f7"; // Color azul para representar cuando el material se enfría y encoge
let graficoCartesiano = null;
// =========================================================================
// --- NAVEGACIÓN Y EVENTOS ---
// =========================================================================

// Función para cambiar las pestañas
function abrirPestana(evento, nombrePestana) {
    let contenidos = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contenidos.length; i++) { 
        contenidos[i].style.display = "none"; 
    }

    let botones = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < botones.length; i++) { 
        botones[i].classList.remove("active"); 
    }

    document.getElementById(nombrePestana).style.display = "block";
    evento.currentTarget.classList.add("active");
}

// Sincronizar los Sliders (controles deslizantes) con los Inputs de texto
document.getElementById('Tf-lineal-slider').addEventListener('input', function() {
    document.getElementById('Tf-lineal').value = this.value;
    calcularLineal(false); // Pasamos 'false' para que NO guarde en el historial mientras arrastramos
});

document.getElementById('Tf-superficial-slider').addEventListener('input', function() {
    document.getElementById('Tf-superficial').value = this.value;
    calcularSuperficial(false);
});

document.getElementById('Tf-volumetrica-slider').addEventListener('input', function() {
    document.getElementById('Tf-vol').value = this.value;
    calcularVolumetrica(false);
});

// =========================================================================
// --- VALIDACIONES FÍSICAS BÁSICAS ---
// =========================================================================

function validarDatos(valorFisico, tempInicial, tempFinal) {
    // El valor físico (longitud, área, volumen) no puede ser cero o negativo
    if (valorFisico <= 0) {
        alert("Error: El valor inicial debe ser mayor a cero.");
        return false;
    }
    // Límite físico: Cero absoluto
    if (tempInicial < -273.15 || tempFinal < -273.15) {
        alert("Error: La temperatura no puede ser menor al cero absoluto (-273.15 °C).");
        return false;
    }
    return true; 
}

// =========================================================================
// --- FUNCIONES DE CÁLCULO ---
// =========================================================================

function calcularLineal(guardar = true) {
    let alfa = parseFloat(document.getElementById('mat-lineal').value);
    let longitudInicial = parseFloat(document.getElementById('L0').value);
    let temperaturaInicial = parseFloat(document.getElementById('Ti-lineal').value);
    let temperaturaFinal = parseFloat(document.getElementById('Tf-lineal').value);

    // Validar antes de calcular
    if (validarDatos(longitudInicial, temperaturaInicial, temperaturaFinal) == false) {
        return; 
    }

    let cambioTemperatura = temperaturaFinal - temperaturaInicial;
    let variacionLongitud = longitudInicial * alfa * cambioTemperatura;
    let longitudFinal = longitudInicial + variacionLongitud;

    // Mostrar resultado numérico
    let cajaResultado = document.getElementById('res-lineal');
    cajaResultado.style.display = "block";
    cajaResultado.innerHTML = "<b>Variación Real (ΔL):</b> " + variacionLongitud.toFixed(6) + " m <br>" +
                              "<b>Longitud Final:</b> " + longitudFinal.toFixed(6) + " m";

    // Llamar a Canvas
    dibujarVisualLineal(variacionLongitud);

    // Guardar en historial si el botón fue presionado
    if (guardar == true) {
        agregarAlHistorial("Lineal", longitudInicial + " m", temperaturaInicial, temperaturaFinal, variacionLongitud.toFixed(6) + " m");
    }
}

function calcularSuperficial(guardar = true) {
    let beta = parseFloat(document.getElementById('mat-superficial').value);
    let areaInicial = parseFloat(document.getElementById('A0').value);
    let temperaturaInicial = parseFloat(document.getElementById('Ti-superficial').value);
    let temperaturaFinal = parseFloat(document.getElementById('Tf-superficial').value);
    let formaElegida = document.getElementById('forma-superficial').value;

    if (validarDatos(areaInicial, temperaturaInicial, temperaturaFinal) == false) return;

    let cambioTemperatura = temperaturaFinal - temperaturaInicial;
    let variacionArea = areaInicial * beta * cambioTemperatura;
    let areaFinal = areaInicial + variacionArea;

    let cajaResultado = document.getElementById('res-superficial');
    cajaResultado.style.display = "block";
    cajaResultado.innerHTML = "<b>Variación Real (ΔA):</b> " + variacionArea.toFixed(6) + " m² <br>" +
                              "<b>Área Final:</b> " + areaFinal.toFixed(6) + " m²";

    dibujarVisualSuperficial(variacionArea, formaElegida);

    if (guardar == true) {
        agregarAlHistorial("Superficial", areaInicial + " m²", temperaturaInicial, temperaturaFinal, variacionArea.toFixed(6) + " m²");
    }
}

function calcularVolumetrica(guardar = true) {
    let gamma = parseFloat(document.getElementById('mat-volumetrica').value);
    let volumenInicial = parseFloat(document.getElementById('V0').value);
    let temperaturaInicial = parseFloat(document.getElementById('Ti-vol').value);
    let temperaturaFinal = parseFloat(document.getElementById('Tf-vol').value);
    let formaElegida = document.getElementById('forma-volumetrica').value;

    if (validarDatos(volumenInicial, temperaturaInicial, temperaturaFinal) == false) return;

    let cambioTemperatura = temperaturaFinal - temperaturaInicial;
    let variacionVolumen = volumenInicial * gamma * cambioTemperatura;

    let cajaResultado = document.getElementById('res-volumetrica');
    cajaResultado.style.display = "block";
    cajaResultado.innerHTML = "<b>Variación Real (ΔV):</b> " + variacionVolumen.toFixed(6) + " m³";

    dibujarVisualVolumetrica(variacionVolumen, formaElegida); 

    if (guardar == true) {
        agregarAlHistorial("Volumétrica", volumenInicial + " m³", temperaturaInicial, temperaturaFinal, variacionVolumen.toFixed(6) + " m³");
    }
}

// =========================================================================
// --- FUNCIONES DE CANVAS ---
// =========================================================================

function dibujarVisualLineal(variacionLongitud) {
    const canvas = document.getElementById('canvas-lineal');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anchoBarra = 20; 
    const y = 60; 
    const x = 20; 
    const longitudInicialPixeles = 200; 
    const factorEscala = 5000; 
    let variacionPixeles = variacionLongitud * factorEscala;
    
    // Dibujar estado inicial (Frío)
    ctx.fillStyle = COLOR_FRIO;
    ctx.fillRect(x, y, longitudInicialPixeles, anchoBarra);

    // Condicional para expansión o contracción
    if (variacionLongitud > 0) {
        ctx.fillStyle = COLOR_CALIENTE;
        ctx.fillRect(x + longitudInicialPixeles, y, variacionPixeles, anchoBarra);
    } else {
        ctx.fillStyle = COLOR_CONTRACCION;
        ctx.fillRect(x + longitudInicialPixeles + variacionPixeles, y, Math.abs(variacionPixeles), anchoBarra);
    }
}

function dibujarVisualSuperficial(variacionArea, forma) {
    const canvas = document.getElementById('canvas-superficial');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tamanoInicial = 100; 
    const xCentro = canvas.width / 2; 
    const yCentro = canvas.height / 2;
    const factorEscala = 2000; 
    
    let expansionVisual = Math.sqrt(Math.abs(variacionArea) * factorEscala); 
    let colorFondo = variacionArea > 0 ? COLOR_CALIENTE : COLOR_FRIO;
    let colorFrente = variacionArea > 0 ? COLOR_FRIO : COLOR_CONTRACCION;

    if (forma === "rectangulo") {
        ctx.fillStyle = colorFondo;
        ctx.fillRect(xCentro - (tamanoInicial/2) - expansionVisual, yCentro - (tamanoInicial/2) - expansionVisual, 
                     tamanoInicial + (expansionVisual * 2), tamanoInicial + (expansionVisual * 2));
        
        ctx.fillStyle = colorFrente;
        ctx.fillRect(xCentro - (tamanoInicial/2), yCentro - (tamanoInicial/2), tamanoInicial, tamanoInicial);
    } else {
        let radioBase = tamanoInicial / 2;
        ctx.beginPath();
        ctx.arc(xCentro, yCentro, radioBase + expansionVisual, 0, 2 * Math.PI);
        ctx.fillStyle = colorFondo;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(xCentro, yCentro, radioBase, 0, 2 * Math.PI);
        ctx.fillStyle = colorFrente;
        ctx.fill();
    }
}

function dibujarVisualVolumetrica(variacionVolumen, forma) {
    const canvas = document.getElementById('canvas-volumetrica');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xCentro = canvas.width / 2;
    const yCentro = canvas.height / 2;
    const tamanoInicial = 80;
    const factorEscala = 1000; 

    let expansionVisual = Math.pow(Math.abs(variacionVolumen) * factorEscala, 1/3); 
    let colorFondo = variacionVolumen > 0 ? COLOR_CALIENTE : COLOR_FRIO;
    let colorFrente = variacionVolumen > 0 ? COLOR_FRIO : COLOR_CONTRACCION;

    // --- TRUCO 3D: SOMBRAS ---
    // Añadimos una sombra para simular volumen y profundidad en el espacio
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;

    if (forma === "cubo") {
        let ladoBaseFinal = tamanoInicial + (expansionVisual * 2);
        let xRect = xCentro - (ladoBaseFinal/2);
        let yRect = yCentro - (ladoBaseFinal/2);

        // --- TRUCO 3D: LUZ EN EL CUBO ---
        // createLinearGradient crea un degradado de esquina a esquina para simular una superficie sólida
        let gradienteFondo = ctx.createLinearGradient(xRect, yRect, xRect + ladoBaseFinal, yRect + ladoBaseFinal);
        gradienteFondo.addColorStop(0, '#ffffff'); // Brillo en la esquina superior izquierda
        gradienteFondo.addColorStop(1, colorFondo); // Color principal en la parte inferior derecha

        ctx.fillStyle = gradienteFondo;
        ctx.fillRect(xRect, yRect, ladoBaseFinal, ladoBaseFinal);
        
        // Apagamos la sombra para dibujar el recuadro interno y que no se vea doble sombra
        ctx.shadowColor = 'transparent';

        let xRectInterno = xCentro - (tamanoInicial/2);
        let yRectInterno = yCentro - (tamanoInicial/2);
        
        let gradienteFrente = ctx.createLinearGradient(xRectInterno, yRectInterno, xRectInterno + tamanoInicial, yRectInterno + tamanoInicial);
        gradienteFrente.addColorStop(0, '#ffffff');
        gradienteFrente.addColorStop(1, colorFrente);

        ctx.fillStyle = gradienteFrente;
        ctx.fillRect(xRectInterno, yRectInterno, tamanoInicial, tamanoInicial);

    } else {
        // --- TRUCO 3D: LUZ EN LA ESFERA ---
        let radioFinal = (tamanoInicial / 2) + expansionVisual;

        // createRadialGradient crea un brillo circular. Desplazamos el centro para que parezca luz impactando una bola.
        let gradienteFondo = ctx.createRadialGradient(xCentro - radioFinal/3, yCentro - radioFinal/3, radioFinal/10, xCentro, yCentro, radioFinal);
        gradienteFondo.addColorStop(0, '#ffffff'); // Punto de luz (brillo)
        gradienteFondo.addColorStop(1, colorFondo); // Color principal

        ctx.beginPath();
        ctx.arc(xCentro, yCentro, radioFinal, 0, 2 * Math.PI);
        ctx.fillStyle = gradienteFondo;
        ctx.fill();

        // Apagamos la sombra para el círculo interno
        ctx.shadowColor = 'transparent';

        let radioInicial = tamanoInicial / 2;
        let gradienteFrente = ctx.createRadialGradient(xCentro - radioInicial/3, yCentro - radioInicial/3, radioInicial/10, xCentro, yCentro, radioInicial);
        gradienteFrente.addColorStop(0, '#ffffff');
        gradienteFrente.addColorStop(1, colorFrente);

        ctx.beginPath();
        ctx.arc(xCentro, yCentro, radioInicial, 0, 2 * Math.PI);
        ctx.fillStyle = gradienteFrente;
        ctx.fill();
    }
    
    // Asegurarnos de limpiar la configuración de sombras al terminar la función
    ctx.shadowColor = 'transparent';
}

// =========================================================================
// --- FUNCIONES DEL HISTORIAL Y PDF ---
// =========================================================================

function agregarAlHistorial(tipo, valorInicial, tempInicial, tempFinal, variacion) {
    let nuevoRegistro = {
        tipo: tipo,
        valorInicial: valorInicial,
        tempInicial: tempInicial + " °C",
        tempFinal: tempFinal + " °C",
        variacion: variacion
    };

    registrosHistorial.push(nuevoRegistro);

    if (registrosHistorial.length > 5) {
        registrosHistorial.shift(); 
    }

    actualizarTablaHTML();
    actualizarGraficoCartesiano();
    
    alert("Cálculo guardado en el historial.");
}

function actualizarTablaHTML() {
    let cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = ""; 

    for (let i = 0; i < registrosHistorial.length; i++) {
        let registro = registrosHistorial[i];
        
        // Construir la fila HTML (ya no necesitamos los 'style' porque están en el CSS)
        let fila = "<tr>" +
            "<td>" + registro.tipo + "</td>" +
            "<td>" + registro.valorInicial + "</td>" +
            "<td>" + registro.tempInicial + "</td>" +
            "<td>" + registro.tempFinal + "</td>" +
            "<td style='font-weight: bold; color: #2980b9;'>" + registro.variacion + "</td>" +
        "</tr>";

        cuerpoTabla.innerHTML += fila;
    }
}

function descargarPDF() {
    if (registrosHistorial.length === 0) {
        alert("El historial está vacío. Realiza un cálculo primero.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de ThermoSim", 20, 20);
    doc.setFontSize(12);
    doc.text("Simulador de Dilatación Térmica", 20, 30);

    let posY = 50;
    doc.setFont("", "bold");
    doc.text("Tipo", 20, posY);
    doc.text("V. Inicial", 60, posY);
    doc.text("T. Inicial", 100, posY);
    doc.text("T. Final", 140, posY);
    doc.text("Variación", 170, posY);
    
    doc.setFont("", "normal");
    posY += 10;

    // Recorrer el arreglo para escribir los datos de la tabla
    for (let i = 0; i < registrosHistorial.length; i++) {
        let r = registrosHistorial[i];
        doc.text(r.tipo, 20, posY);
        doc.text(r.valorInicial, 60, posY);
        doc.text(r.tempInicial, 100, posY);
        doc.text(r.tempFinal, 140, posY);
        doc.text(r.variacion, 170, posY);
        posY += 10; 
    }

    // --- NUEVA LÓGICA: INCRUSTAR LA GRÁFICA EN EL PDF ---
    
    // Verificamos si el gráfico existe antes de intentar agregarlo
    if (graficoCartesiano != null) {
        // Le damos un poco de espacio hacia abajo después de que termine la tabla
        posY += 15; 
        doc.setFont("", "bold");
        doc.text("Gráfica de Variaciones:", 20, posY);
        
        // 1. Obtenemos el elemento canvas de la gráfica
        let canvasGrafico = document.getElementById('canvas-grafico');
        
        // 2. Tomamos una "foto" del canvas y la convertimos a formato imagen PNG (Base64)
        let imagenBase64 = canvasGrafico.toDataURL('image/png');
        
        // 3. Agregamos la imagen al documento PDF
        // Parámetros: (imagen, formato, posiciónX, posiciónY, ancho, alto)
        // Usamos un ancho de 160 y alto de 80 para que se vea proporcionada en la hoja A4
        doc.addImage(imagenBase64, 'PNG', 20, posY + 10, 160, 80);
    }

    doc.save("Reporte_ThermoSim.pdf");
    alert("Generando y descargando PDF...");
}

// =========================================================================
// --- FUNCIONES DEL GRÁFICO (CHART.JS) CORREGIDO PARA NEGATIVOS ---
// =========================================================================

function actualizarGraficoCartesiano() {
    const ctx = document.getElementById('canvas-grafico').getContext('2d');

    // 1. Destruir el gráfico anterior para evitar sobreescritura
    if (graficoCartesiano != null) {
        graficoCartesiano.destroy();
    }

    let etiquetasX = [];
    let datosVariacionY = [];
    let coloresBarras = [];

    // 2. Extraer solo las variaciones (Δ) del historial
    for (let i = 0; i < registrosHistorial.length; i++) {
        let registro = registrosHistorial[i];
        
        // Eje X: El número de cálculo
        etiquetasX.push("Calc " + (i + 1) + " (" + registro.tipo + ")");

        // Eje Y: El valor del incremento o decremento numérico
        let variacionNumerica = parseFloat(registro.variacion);
        datosVariacionY.push(variacionNumerica);

        // 3. Lógica de colores para evidenciar expansión o contracción
        if (variacionNumerica > 0) {
            coloresBarras.push('#ef5350'); // Rojo si el material se expande (Calor)
        } else {
            coloresBarras.push('#4fc3f7'); // Azul si el material se contrae (Frío/Negativo)
        }
    }

    // 4. Construir el gráfico en formato de Barras ('bar')
    graficoCartesiano = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: etiquetasX,
            datasets: [{
                label: 'Variación Térmica (Δ)',
                data: datosVariacionY,
                backgroundColor: coloresBarras,
                borderColor: '#333',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: { display: true, text: 'Aumento (+) / Reducción (-)' },
                    // beginAtZero fuerza al gráfico a mostrar la línea central del cero
                    beginAtZero: true 
                }
            }
        }
    });
}