// controllers/ReportesController.js
import { fetchEstudiantes, fetchInstructores, fetchVehiculos } from '../Services/ReportesService.js';

const renderReportes = async () => {
    let estudiantes = await fetchEstudiantes();
    let instructores = await fetchInstructores();
    let vehiculos = await fetchVehiculos();

    // Validar que los datos existen y son arrays
    if (!Array.isArray(estudiantes)) estudiantes = [];
    if (!Array.isArray(instructores)) instructores = [];
    if (!Array.isArray(vehiculos)) vehiculos = [];

    // --- Alumnos por level (año) ---
    const LEVELS = [1, 2, 3];
    const labelsLevels = LEVELS.map(lvl => lvl === 1 ? '1er Año' : lvl === 2 ? '2do Año' : '3er Año');
    const alumnosPorLevel = LEVELS.map(level =>
        estudiantes.filter(est => Number(est.gradeId) === level).length
    );

    // --- Vehículos por tipo ---
    const tiposVehiculos = [...new Set(vehiculos.map(v => v.typeName).filter(Boolean))];
    const vehiculosPorTipo = tiposVehiculos.map(tipo =>
        vehiculos.filter(v => v.typeName === tipo).length
    );

    // --- Gráfico alumnos por año ---
    const opcionesAlumnosPorLevel = {
        series: alumnosPorLevel,
        chart: {
            height: 350,
            type: 'bar',
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                horizontal: false,
                columnWidth: '50%',
            }
        },
        dataLabels: { enabled: true },
        xaxis: {
            categories: labelsLevels,
            labels: { style: { colors: ['#555'], fontSize: '14px' } }
        },
        yaxis: {
            title: {
                text: 'Cantidad de Alumnos',
                style: { color: '#555', fontSize: '14px', fontWeight: 600 }
            }
        },
        colors: ['#00E396', '#FEB019', '#775DD0'],
        grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
        tooltip: {
            y: { formatter: function (valor) { return valor + " alumnos"; } }
        }
    };

    const graficoAlumnosPorLevel = new ApexCharts(document.querySelector("#grafico-alumnos"), opcionesAlumnosPorLevel);
    graficoAlumnosPorLevel.render();

    // --- Gráfico vehículos por tipo ---
    const opcionesVehiculosPorTipo = {
        series: [{
            name: 'Vehículos',
            data: vehiculosPorTipo
        }],
        chart: {
            height: 350,
            type: 'bar',
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                horizontal: false,
                columnWidth: '50%',
            }
        },
        dataLabels: { enabled: true },
        xaxis: {
            categories: tiposVehiculos,
            labels: { style: { colors: ['#555'], fontSize: '14px' } }
        },
        yaxis: {
            title: {
                text: 'Cantidad de Vehículos',
                style: { color: '#555', fontSize: '14px', fontWeight: 600 }
            }
        },
        colors: ['#FEB019', '#00E396', '#775DD0', '#FF4560', '#008FFB'],
        grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
        tooltip: {
            y: { formatter: function (valor) { return valor + " vehículos"; } }
        }
    };

    const graficoVehiculosPorTipo = new ApexCharts(document.querySelector("#grafico-vehiculos-tipo"), opcionesVehiculosPorTipo);
    graficoVehiculosPorTipo.render();
};

export { renderReportes };