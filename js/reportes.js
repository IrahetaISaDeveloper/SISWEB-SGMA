document.addEventListener('DOMContentLoaded', async function () {
    let estudiantes = [];
    let instructores = [];
    let vehiculos = [];

    // Fetch estudiantes
    try {
        const resEst = await fetch('http://localhost:8080/api/students/getDataStudents');
        const dataEst = await resEst.json();
        if (dataEst && dataEst.data && Array.isArray(dataEst.data.content)) {
            estudiantes = dataEst.data.content;
        } else if (dataEst && Array.isArray(dataEst.data)) {
            estudiantes = dataEst.data;
        }
    } catch {}

    // Fetch instructores
    try {
        const resInst = await fetch('http://localhost:8080/api/instructors/getDataInstructors');
        const dataInst = await resInst.json();
        if (dataInst && dataInst.data && Array.isArray(dataInst.data.content)) {
            instructores = dataInst.data.content;
        } else if (dataInst && Array.isArray(dataInst.data)) {
            instructores = dataInst.data;
        }
    } catch {}

    // Fetch vehículos
    try {
        const resVeh = await fetch('http://localhost:8080/api/vehicles/getDataVehicles');
        const dataVeh = await resVeh.json();
        if (dataVeh && dataVeh.data && Array.isArray(dataVeh.data.content)) {
            vehiculos = dataVeh.data.content;
        } else if (dataVeh && Array.isArray(dataVeh.data)) {
            vehiculos = dataVeh.data;
        }
    } catch {}

    // Procesar datos para gráficos
    let alumnosPorAno = [0, 0, 0];
    estudiantes.forEach(est => {
        if (est.gradeId === 1) alumnosPorAno[0]++;
        else if (est.gradeId === 2) alumnosPorAno[1]++;
        else if (est.gradeId === 3) alumnosPorAno[2]++;
    });

    let vehiculosPorAno = [0, 0, 0];
    vehiculos.forEach(veh => {
        const est = estudiantes.find(e => e.studentId === veh.studentId);
        if (est) {
            if (est.gradeId === 1) vehiculosPorAno[0]++;
            else if (est.gradeId === 2) vehiculosPorAno[1]++;
            else if (est.gradeId === 3) vehiculosPorAno[2]++;
        }
    });

    // Si no hay datos, muestra 0 para evitar errores en ApexCharts
    if (!alumnosPorAno.some(v => v > 0)) alumnosPorAno = [0, 0, 0];
    if (!vehiculosPorAno.some(v => v > 0)) vehiculosPorAno = [0, 0, 0];

    // Gráfico radial de alumnos por año
    var opcionesAlumnos = {
        series: alumnosPorAno,
        chart: {
            height: 250,
            type: 'radialBar',
            toolbar: { show: false }
        },
        plotOptions: {
            radialBar: {
                offsetY: 0,
                startAngle: -135,
                endAngle: 225,
                hollow: {
                    margin: 5,
                    size: '45%',
                    background: '#fff',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 4,
                        opacity: 0.24
                    }
                },
                track: {
                    background: '#fff',
                    strokeWidth: '97%',
                    margin: 5,
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.35
                    }
                },
                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: true,
                        color: '#888',
                        fontSize: '17px'
                    },
                    value: {
                        formatter: function(valor, opciones) {
                            return valor + ' alumnos';
                        },
                        offsetY: 8,
                        color: '#111',
                        fontSize: '30px',
                        show: true,
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#00E396', '#FEB019', '#775DD0'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: { lineCap: 'round' },
        labels: ['1er Año', '2do Año', '3er Año'],
    };

    var graficoAlumnos = new ApexCharts(document.querySelector("#grafico-alumnos"), opcionesAlumnos);
    graficoAlumnos.render();

    // Gráfico de vehículos por año (área)
    var opcionesAutos = {
        series: [{
            name: 'Vehículos por año',
            data: [
                { x: '1er Año', y: vehiculosPorAno[0] },
                { x: '2do Año', y: vehiculosPorAno[1] },
                { x: '3er Año', y: vehiculosPorAno[2] }
            ]
        }],
        chart: {
            height: 350,
            type: 'area',
            zoom: { enabled: false },
            toolbar: { show: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
            type: 'category',
            labels: { style: { colors: ['#555'], fontSize: '14px' } }
        },
        yaxis: {
            title: {
                text: 'Cantidad de Autos',
                style: { color: '#555', fontSize: '14px', fontWeight: 600 }
            },
            labels: {
                formatter: function (valor) { return Math.round(valor); }
            }
        },
        tooltip: {
            x: { show: true },
            y: { formatter: function (valor) { return valor + " autos"; } }
        },
        colors: ['#00E396'],
        grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
        legend: {
            position: 'bottom',
            horizontalAlign: 'right',
            floating: false,
            offsetY: -25,
            offsetX: -5,
            fontSize: '14px',
            fontFamily: 'Roboto, Arial',
            fontWeight: 500,
            labels: { colors: '#333' },
            markers: { width: 12, height: 12, radius: 4 },
            itemMargin: { horizontal: 10, vertical: 0 }
        },
    };

    var graficoAutos = new ApexCharts(document.querySelector("#grafico-autos-registrados"), opcionesAutos);
    graficoAutos.render();
});