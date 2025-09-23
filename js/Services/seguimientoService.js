// services/seguimientoService.js

const obtenerDatosVehiculoPorPlaca = async (placa) => {
    // Simulación de datos locales
    const datosSimulados = {
        "ABC-123": {
            numeroRegistro: "20250428",
            modelo: "Volvo - XC40",
            estado: "Ajustes eléctricos completo",
            placa: "P258-854",
            estudianteAsignado: "Manuel Perez",
            moduloAsignado: "Sistemas Eléctricos",
            nombreContacto: "José E.",
            porcentajeProgreso: 85,
            tiempoRestante: "30 min restantes",
            tiempoTotal: "6h totales",
            imagenVehiculo: "imgs/volvo.jpg",
            tareas: [
                { icono: "fas fa-lightbulb", texto: "Conexión y reparación de luces" },
                { icono: "fas fa-window-restore", texto: "Reparación de puertas y ventanas" },
                { icono: "fas fa-wind", texto: "Reparación de Parabrisas" },
                { icono: "fas fa-car-crash", texto: "Cambio de Airbag" },
                { icono: "fas fa-eye", texto: "Reparación de espejo" },
            ],
            actualizaciones: [
                "2025-06-10: Revisión inicial completada.",
                "2025-06-11: Componentes eléctricos diagnosticados.",
                "2025-06-12: Inicio de ajustes eléctricos.",
                "2025-06-13: Pruebas finales de sistemas eléctricos.",
                "2025-06-14: Ajustes eléctricos completados. Próximo: Inspección general."
            ]
        },
        "ABC-122": {
            numeroRegistro: "20231026",
            modelo: "Sedán Genérico",
            estado: "En reparación - Motor",
            placa: "ABC-123",
            estudianteAsignado: "Ana López",
            moduloAsignado: "Mecánica General",
            nombreContacto: "Carlos R.",
            porcentajeProgreso: 50,
            tiempoRestante: "12h restantes",
            tiempoTotal: "24h totales",
            imagenVehiculo: "imgs/volvo.jpg",
            tareas: [
                { icono: "fas fa-gears", texto: "Revisión de motor" },
                { icono: "fas fa-oil-can", texto: "Cambio de aceite" },
                { icono: "fas fa-cogs", texto: "Ajuste de transmisión" },
            ],
            actualizaciones: [
                "2023-10-26: Recepción del vehículo para diagnóstico.",
                "2023-10-27: Diagnóstico completado. Problema en el motor detectado.",
                "2023-10-28: Inicio de la reparación del motor.",
                "2023-10-30: 50% de la reparación del motor completada."
            ]
        }
    };

    // Simulación de búsqueda
    return datosSimulados[placa.toUpperCase()] || null;
};

export { obtenerDatosVehiculoPorPlaca };