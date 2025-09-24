document.addEventListener('DOMContentLoaded', async function () {
    let estudiantes = [];
    let instructores = [];
    let vehiculos = [];

    // Fetch estudiantes
    try {
        const resEst = await fetch('https://sgma-66ec41075156.herokuapp.com/api/students/getDataStudents');
        const dataEst = await resEst.json();
        if (dataEst && dataEst.data && Array.isArray(dataEst.data.content)) {
            estudiantes = dataEst.data.content;
        } else if (dataEst && Array.isArray(dataEst.data)) {
            estudiantes = dataEst.data;
        }
    } catch {}

    // Fetch instructores
    try {
        const resInst = await fetch('https://sgma-66ec41075156.herokuapp.com/api/instructors/getDataInstructors');
        const dataInst = await resInst.json();
        if (dataInst && dataInst.data && Array.isArray(dataInst.data.content)) {
            instructores = dataInst.data.content;
        } else if (dataInst && Array.isArray(dataInst.data)) {
            instructores = dataInst.data;
        }
    } catch {}

    // Fetch vehículos
    try {
        const resVeh = await fetch('https://sgma-66ec41075156.herokuapp.com/api/vehicles/getDataVehicles');
        const dataVeh = await resVeh.json();
        if (dataVeh && dataVeh.data && Array.isArray(dataVeh.data.content)) {
            vehiculos = dataVeh.data.content;
        } else if (dataVeh && Array.isArray(dataVeh.data)) {
            vehiculos = dataVeh.data;
        }
    } catch {}

    // Validar que los datos existen y son arrays
    if (!Array.isArray(estudiantes) || !Array.isArray(vehiculos) || !Array.isArray(instructores)) {
        estudiantes = [];
        vehiculos = [];
        instructores = [];
    }

    // --- Alumnos por level (año) ---
    const LEVELS = [1, 2, 3];
    const labelsLevels = LEVELS.map(lvl => lvl === 1 ? '1er Año' : lvl === 2 ? '2do Año' : '3er Año');
    const alumnosPorLevel = LEVELS.map(level =>
        estudiantes.filter(est => Number(est.gradeId) === level).length
    );

    // --- Vehículos por tipo ---
    // Obtener todos los tipos únicos
    const tiposVehiculos = [...new Set(vehiculos.map(v => v.typeName).filter(Boolean))];
    const vehiculosPorTipo = tiposVehiculos.map(tipo =>
        vehiculos.filter(v => v.typeName === tipo).length
    );

    // --- Gráfico alumnos por año ---
    var opcionesAlumnosPorLevel = {
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

    var graficoAlumnosPorLevel = new ApexCharts(document.querySelector("#grafico-alumnos"), opcionesAlumnosPorLevel);
    graficoAlumnosPorLevel.render();

    // --- Gráfico vehículos por tipo ---
    var opcionesVehiculosPorTipo = {
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

    var graficoVehiculosPorTipo = new ApexCharts(document.querySelector("#grafico-vehiculos-tipo"), opcionesVehiculosPorTipo);
    graficoVehiculosPorTipo.render();
});