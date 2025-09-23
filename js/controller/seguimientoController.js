// controllers/seguimientoController.js
import { obtenerDatosVehiculoPorPlaca } from '../Services/seguimientoService.js';

const popularDatosVehiculo = (datos) => {
    const numeroRegistroSpan = document.getElementById("numeroRegistro");
    const infoModeloSpan = document.getElementById("infoModelo");
    const estadoAjusteParrafo = document.getElementById("estadoAjuste");
    const infoPlacaSpan = document.getElementById("infoPlaca");
    const estudianteAsignadoSpan = document.getElementById("estudianteAsignado");
    const moduloAsignadoSpan = document.getElementById("moduloAsignado");
    const nombreContactoSpan = document.getElementById("nombreContacto");
    const barraProgresoDiv = document.getElementById("barraProgreso");
    const porcentajeProgresoSpan = document.getElementById("porcentajeProgreso");
    const tiempoRestanteSpan = document.getElementById("tiempoRestante");
    const tiempoTotalSpan = document.getElementById("tiempoTotal");
    const imagenVehiculo = document.getElementById("imagenVehiculo");
    const cuadriculaTareasReparacion = document.getElementById("cuadriculaTareasReparacion");
    const listaActualizaciones = document.getElementById("listaActualizaciones");

    numeroRegistroSpan.textContent = datos.numeroRegistro || "N/A";
    infoModeloSpan.textContent = datos.modelo || "Vehículo Desconocido";
    estadoAjusteParrafo.textContent = datos.estado || "Sin Información";
    infoPlacaSpan.textContent = datos.placa || "Placa no especificada";
    estudianteAsignadoSpan.textContent = datos.estudianteAsignado || "N/A";
    moduloAsignadoSpan.textContent = datos.moduloAsignado || "N/A";
    nombreContactoSpan.textContent = datos.nombreContacto || "N/A";

    barraProgresoDiv.style.width = datos.porcentajeProgreso + "%";
    porcentajeProgresoSpan.textContent = datos.porcentajeProgreso + "%";
    tiempoRestanteSpan.textContent = datos.tiempoRestante || "N/A";
    tiempoTotalSpan.textContent = datos.tiempoTotal || "N/A";

    if (datos.imagenVehiculo) {
        imagenVehiculo.src = datos.imagenVehiculo;
    } else {
        imagenVehiculo.src = "imgs/default_vehicle.jpg";
    }

    if (datos.tareas && datos.tareas.length > 0) {
        cuadriculaTareasReparacion.innerHTML = "";
        datos.tareas.forEach(tarea => {
            const itemTarea = document.createElement("div");
            itemTarea.className = "item-tarea";
            itemTarea.innerHTML = `<i class="${tarea.icono}"></i><span>${tarea.texto}</span>`;
            cuadriculaTareasReparacion.appendChild(itemTarea);
        });
    } else {
        cuadriculaTareasReparacion.innerHTML = `<div class="item-tarea"><i class="fas fa-info-circle"></i><span>No se encontraron tareas de reparación.</span></div>`;
    }

    if (datos.actualizaciones && datos.actualizaciones.length > 0) {
        listaActualizaciones.innerHTML = "";
        datos.actualizaciones.forEach(actualizacion => {
            const li = document.createElement("li");
            li.textContent = actualizacion;
            listaActualizaciones.appendChild(li);
        });
    } else {
        listaActualizaciones.innerHTML = `<li class="sin-resultados">No se encontraron actualizaciones para este vehículo.</li>`;
    }
};

const initSeguimientoController = async () => {
    const parametrosURL = new URLSearchParams(window.location.search);
    const placa = parametrosURL.get("placa");

    if (placa) {
        const datosVehiculo = await obtenerDatosVehiculoPorPlaca(placa);
        if (datosVehiculo) {
            popularDatosVehiculo(datosVehiculo);
        } else {
            popularDatosVehiculo({
                numeroRegistro: "N/A",
                modelo: "Vehículo no encontrado",
                estado: "Placa no registrada en el sistema",
                placa: placa,
                estudianteAsignado: "N/A",
                moduloAsignado: "N/A",
                nombreContacto: "N/A",
                porcentajeProgreso: 0,
                tiempoRestante: "N/A",
                tiempoTotal: "N/A",
                actualizaciones: ["No se encontraron resultados para la placa: " + placa],
                tareas: [],
            });
        }
    } else {
        popularDatosVehiculo({
            numeroRegistro: "N/A",
            modelo: "Por favor, ingresa una placa",
            estado: "Esperando búsqueda...",
            placa: "N/A",
            estudianteAsignado: "N/A",
            moduloAsignado: "N/A",
            nombreContacto: "N/A",
            porcentajeProgreso: 0,
            tiempoRestante: "N/A",
            tiempoTotal: "N/A",
            actualizaciones: ["Ingresa una placa para ver el seguimiento del vehículo."],
            tareas: [],
        });
    }

    const botonContacto = document.querySelector(".boton-contacto");
    if (botonContacto) {
        botonContacto.addEventListener("click", function (e) {
            e.preventDefault();
            alert("Contactar a " + document.getElementById("nombreContacto").textContent);
        });
    }

    const usuarioInfoDiv = document.querySelector(".info-usuario");
    if (usuarioInfoDiv) {
        usuarioInfoDiv.addEventListener("click", function () {
            window.location.href = "perfil.html";
        });
    }
};

export { initSeguimientoController };