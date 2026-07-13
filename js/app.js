// =========================================================================
// --- VARIABLES GLOBALES ---
// =========================================================================

let registrosHistorial = []; 
const COLOR_FRIO = "#b0bec5"; 
const COLOR_CALIENTE = "#ef5350"; 
const COLOR_CONTRACCION = "#4fc3f7"; 
let graficoCartesiano = null; 

// =========================================================================
// --- NAVEGACIÓN Y EVENTOS ---
// =========================================================================

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

    let zonaHistorial = document.getElementById("zona-historial");
    if (nombrePestana === "inicio" || nombrePestana === "comparacion") {
        zonaHistorial.style.display = "none";
    } else {
        zonaHistorial.style.display = "block";
    }
}

document.getElementById('Tf-lineal-slider').addEventListener('input', function() {
    document.getElementById('Tf-lineal').value = this.value;
    calcularLineal(false); 
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
// --- VALIDACIONES FÍSICAS ---
// =========================================================================

function validarDatos(valorFisico, tempInicial, tempFinal) {
    if (valorFisico <= 0) {
        alert("Error: El valor inicial debe ser mayor a cero.");
        return false;
    }
    if (tempInicial < -273.15 || tempFinal < -273.15) {
        alert("Error: La temperatura no puede ser menor al cero absoluto (-273.15 °C).");
        return false;
    }
    return true; 
}

// =========================================================================
// --- FUNCIONES DE CÁLCULO PRINCIPALES ---
// =========================================================================

function calcularLineal(guardar = true) {
    let alfa = parseFloat(document.getElementById('mat-lineal').value);
    let longitudInicial = parseFloat(document.getElementById('L0').value);
    let temperaturaInicial = parseFloat(document.getElementById('Ti-lineal').value);
    let temperaturaFinal = parseFloat(document.getElementById('Tf-lineal').value);

    if (validarDatos(longitudInicial, temperaturaInicial, temperaturaFinal) == false) return;

    let cambioTemperatura = temperaturaFinal - temperaturaInicial;
    let variacionLongitud = longitudInicial * alfa * cambioTemperatura;
    let longitudFinal = longitudInicial + variacionLongitud;

    let cajaResultado = document.getElementById('res-lineal');
    cajaResultado.style.display = "block";
    cajaResultado.innerHTML = "<b>Variación Real (ΔL):</b> " + variacionLongitud.toFixed(6) + " m <br>" +
                              "<b>Longitud Final:</b> " + longitudFinal.toFixed(6) + " m";

    dibujarVisualLineal(variacionLongitud);

    if (guardar == true) {
        agregarAlHistorial("Lineal", longitudInicial + " m", temperaturaInicial, temperaturaFinal, variacionLongitud.toFixed(6));
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
        agregarAlHistorial("Superficial", areaInicial + " m²", temperaturaInicial, temperaturaFinal, variacionArea.toFixed(6));
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
        agregarAlHistorial("Volumétrica", volumenInicial + " m³", temperaturaInicial, temperaturaFinal, variacionVolumen.toFixed(6));
    }
}

// =========================================================================
// --- FUNCIONES DE CANVAS (CON LIMITADOR DE DESBORDAMIENTO) ---
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
    
    // LIMITADOR DE DESBORDAMIENTO
    let limiteMaximo = canvas.width - (x + longitudInicialPixeles) - 10;
    if (variacionPixeles > limiteMaximo) {
        variacionPixeles = limiteMaximo;
    }

    ctx.fillStyle = COLOR_FRIO;
    ctx.fillRect(x, y, longitudInicialPixeles, anchoBarra);

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
    
    // LIMITADOR DE DESBORDAMIENTO
    let limiteMaximo = (canvas.height / 2) - (tamanoInicial / 2) - 10;
    if (expansionVisual > limiteMaximo) {
        expansionVisual = limiteMaximo;
    }

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
    
    // LIMITADOR DE DESBORDAMIENTO
    let limiteMaximo = (canvas.height / 2) - (tamanoInicial / 2) - 10;
    if (expansionVisual > limiteMaximo) {
        expansionVisual = limiteMaximo;
    }

    let colorFondo = variacionVolumen > 0 ? COLOR_CALIENTE : COLOR_FRIO;
    let colorFrente = variacionVolumen > 0 ? COLOR_FRIO : COLOR_CONTRACCION;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;

    if (forma === "cubo") {
        let ladoBaseFinal = tamanoInicial + (expansionVisual * 2);
        let xRect = xCentro - (ladoBaseFinal/2);
        let yRect = yCentro - (ladoBaseFinal/2);

        let gradienteFondo = ctx.createLinearGradient(xRect, yRect, xRect + ladoBaseFinal, yRect + ladoBaseFinal);
        gradienteFondo.addColorStop(0, '#ffffff'); 
        gradienteFondo.addColorStop(1, colorFondo); 

        ctx.fillStyle = gradienteFondo;
        ctx.fillRect(xRect, yRect, ladoBaseFinal, ladoBaseFinal);
        
        ctx.shadowColor = 'transparent';

        let xRectInterno = xCentro - (tamanoInicial/2);
        let yRectInterno = yCentro - (tamanoInicial/2);
        
        let gradienteFrente = ctx.createLinearGradient(xRectInterno, yRectInterno, xRectInterno + tamanoInicial, yRectInterno + tamanoInicial);
        gradienteFrente.addColorStop(0, '#ffffff');
        gradienteFrente.addColorStop(1, colorFrente);

        ctx.fillStyle = gradienteFrente;
        ctx.fillRect(xRectInterno, yRectInterno, tamanoInicial, tamanoInicial);

    } else {
        let radioFinal = (tamanoInicial / 2) + expansionVisual;

        let gradienteFondo = ctx.createRadialGradient(xCentro - radioFinal/3, yCentro - radioFinal/3, radioFinal/10, xCentro, yCentro, radioFinal);
        gradienteFondo.addColorStop(0, '#ffffff'); 
        gradienteFondo.addColorStop(1, colorFondo); 

        ctx.beginPath();
        ctx.arc(xCentro, yCentro, radioFinal, 0, 2 * Math.PI);
        ctx.fillStyle = gradienteFondo;
        ctx.fill();

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
    
    ctx.shadowColor = 'transparent';
}

// =========================================================================
// --- FUNCIONES DE COMPARACIÓN (CARRERA A/B Y COLISIÓN) ---
// =========================================================================

document.getElementById('slider-comp-A').addEventListener('input', function() {
    document.getElementById('val-temp-A').innerText = this.value;
    calcularComparacion();
});

document.getElementById('slider-comp-B').addEventListener('input', function() {
    document.getElementById('val-temp-B').innerText = this.value;
    calcularComparacion();
});

document.getElementById('mat-comp-A').addEventListener('change', calcularComparacion);
document.getElementById('mat-comp-B').addEventListener('change', calcularComparacion);
document.getElementById('L0-comp').addEventListener('input', calcularComparacion);

function calcularComparacion() {
    let alfaA = parseFloat(document.getElementById('mat-comp-A').value);
    let alfaB = parseFloat(document.getElementById('mat-comp-B').value);
    let longitudInicial = parseFloat(document.getElementById('L0-comp').value);
    let tempFinalA = parseFloat(document.getElementById('slider-comp-A').value);
    let tempFinalB = parseFloat(document.getElementById('slider-comp-B').value);
    let tempInicial = 20; 

    if (longitudInicial <= 0 || isNaN(longitudInicial)) return;

    let variacionA = longitudInicial * alfaA * (tempFinalA - tempInicial);
    let variacionB = longitudInicial * alfaB * (tempFinalB - tempInicial);

    let cajaResultado = document.getElementById('res-comparacion');
    cajaResultado.style.display = "block";
    cajaResultado.innerHTML = 
        "<span style='color:#2980b9; font-weight:bold;'>ΔL Objeto A:</span> " + variacionA.toFixed(6) + " m <br><br>" +
        "<span style='color:#e67e22; font-weight:bold;'>ΔL Objeto B:</span> " + variacionB.toFixed(6) + " m";

    dibujarVisualComparacion(variacionA, variacionB);
}

function dibujarVisualComparacion(variacionA, variacionB) {
    const canvas = document.getElementById('canvas-comparacion');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anchoBarra = 30; 
    const y = 85; 
    const longitudInicialPixeles = 80; 
    const factorEscala = 6000; 

    // Posiciones frente a frente
    const xInicioA = 10;
    const bordeDerechoInicialA = xInicioA + longitudInicialPixeles;

    const xInicioB = canvas.width - 10 - longitudInicialPixeles; 
    const bordeIzquierdoInicialB = xInicioB; 

    let expPixelesA = variacionA * factorEscala;
    let expPixelesB = variacionB * factorEscala;

    let bordeFinalA = bordeDerechoInicialA + expPixelesA;
    let bordeFinalB = bordeIzquierdoInicialB - expPixelesB; 

    // SISTEMA DE DETECCIÓN DE COLISIÓN
    let chocaron = false;
    
    if (bordeFinalA >= bordeFinalB) {
        chocaron = true;
        let puntoDeChoque = (bordeFinalA + bordeFinalB) / 2;
        
        // Frenar la expansión en el punto medio exacto
        expPixelesA = puntoDeChoque - bordeDerechoInicialA;
        expPixelesB = bordeIzquierdoInicialB - puntoDeChoque;
    }

    // Dibujar A
    ctx.fillStyle = COLOR_FRIO; 
    ctx.fillRect(xInicioA, y, longitudInicialPixeles, anchoBarra);
    
    if (variacionA > 0) {
        ctx.fillStyle = "#2980b9"; 
        ctx.fillRect(bordeDerechoInicialA, y, expPixelesA, anchoBarra);
    } else {
        ctx.fillStyle = COLOR_CONTRACCION; 
        ctx.fillRect(bordeDerechoInicialA + expPixelesA, y, Math.abs(expPixelesA), anchoBarra);
    }

    // Dibujar B
    ctx.fillStyle = COLOR_FRIO; 
    ctx.fillRect(xInicioB, y, longitudInicialPixeles, anchoBarra);
    
    if (variacionB > 0) {
        ctx.fillStyle = "#e67e22"; 
        ctx.fillRect(bordeIzquierdoInicialB - expPixelesB, y, expPixelesB, anchoBarra);
    } else {
        ctx.fillStyle = COLOR_CONTRACCION; 
        ctx.fillRect(bordeIzquierdoInicialB, y, Math.abs(expPixelesB), anchoBarra);
    }

    // Textos visuales
    ctx.fillStyle = "#333";
    ctx.font = "16px bold sans-serif";
    ctx.fillText("Objeto A", xInicioA + 10, y - 15);
    ctx.fillText("Objeto B", xInicioB + 10, y - 15);

    if (chocaron) {
        ctx.fillStyle = "red";
        ctx.font = "18px bold sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("¡COLISIÓN TÉRMICA!", canvas.width / 2, y + anchoBarra + 30);
        ctx.textAlign = "left"; 
    }
}

// Llamada para inicializar la carrera al cargar la web
setTimeout(calcularComparacion, 500); 

// =========================================================================
// --- FUNCIONES DEL HISTORIAL Y TABLA HTML ---
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

// =========================================================================
// --- FUNCIONES DEL GRÁFICO (CHART.JS) ---
// =========================================================================

function actualizarGraficoCartesiano() {
    const ctx = document.getElementById('canvas-grafico').getContext('2d');

    if (graficoCartesiano != null) {
        graficoCartesiano.destroy();
    }

    let etiquetasX = [];
    let datosVariacionY = [];
    let coloresBarras = [];

    for (let i = 0; i < registrosHistorial.length; i++) {
        let registro = registrosHistorial[i];
        etiquetasX.push("Calc " + (i + 1) + " (" + registro.tipo + ")");

        let variacionNumerica = parseFloat(registro.variacion);
        datosVariacionY.push(variacionNumerica);

        if (variacionNumerica > 0) {
            coloresBarras.push('#ef5350'); 
        } else {
            coloresBarras.push('#4fc3f7'); 
        }
    }

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
                    beginAtZero: true 
                }
            }
        }
    });
}

// =========================================================================
// --- FUNCIÓN PARA DESCARGAR PDF ---
// =========================================================================

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

    for (let i = 0; i < registrosHistorial.length; i++) {
        let r = registrosHistorial[i];
        doc.text(r.tipo, 20, posY);
        doc.text(r.valorInicial, 60, posY);
        doc.text(r.tempInicial, 100, posY);
        doc.text(r.tempFinal, 140, posY);
        doc.text(r.variacion, 170, posY);
        posY += 10; 
    }

    if (graficoCartesiano != null) {
        posY += 15; 
        doc.setFont("", "bold");
        doc.text("Gráfica de Variaciones:", 20, posY);
        
        let canvasGrafico = document.getElementById('canvas-grafico');
        let imagenBase64 = canvasGrafico.toDataURL('image/png');
        doc.addImage(imagenBase64, 'PNG', 20, posY + 10, 160, 80);
    }

    doc.save("Reporte_ThermoSim.pdf");
    alert("Generando y descargando PDF...");
}
