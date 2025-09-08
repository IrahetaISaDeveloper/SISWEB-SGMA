document.addEventListener('DOMContentLoaded', function () {
    // Mostrar solo los módulos del año seleccionado
    function mostrarModulosPorAno(ano) {
        document.querySelectorAll('.elemento-modulo').forEach(function (modulo) {
            if (modulo.getAttribute('data-year') === ano) {
                modulo.style.display = '';
            } else {
                modulo.style.display = 'none';
            }
        });
    }

    // Selección visual y funcional de filtro por año
    document.querySelectorAll('.boton-filtro[data-year]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.boton-filtro[data-year]').forEach(function (b) {
                b.classList.remove('activo');
            });
            btn.classList.add('activo');
            mostrarModulosPorAno(btn.getAttribute('data-year'));
        });
    });

    // Mostrar por defecto los de primer año
    mostrarModulosPorAno('primer');

    // Consulta y muestra datos reales de vehículos
    fetch('http://localhost:8080/api/vehicles/getDataVehicles?page=0&size=50', {
        method: 'GET'
    })
    .then(res => res.json())
    .then(data => {
        let vehicles = [];
        if (data && data.data && Array.isArray(data.data.content)) {
            vehicles = data.data.content;
        }
        const totalElem = document.getElementById('total-vehiculos');
        if (totalElem) totalElem.textContent = vehicles.length;
        const ptcCount = vehicles.filter(v => v.maintenanceEXPO === 1).length;
        const ptcElem = document.getElementById('vehiculos-ptc');
        if (ptcElem) ptcElem.textContent = ptcCount;
    })
    .catch(() => {
        const totalElem = document.getElementById('total-vehiculos');
        const ptcElem = document.getElementById('vehiculos-ptc');
        if (totalElem) totalElem.textContent = '0';
        if (ptcElem) ptcElem.textContent = '0';
    });

    // Consulta y muestra cantidad de alumnos
    fetch('http://localhost:8080/api/students/getDataStudents', {
        method: 'GET'
    })
    .then(res => res.json())
    .then(data => {
        let students = [];
        if (data && data.data && Array.isArray(data.data.content)) {
            students = data.data.content;
        }
        const alumnosElem = document.getElementById('alumnos-registrados');
        if (alumnosElem) alumnosElem.textContent = students.length;
    })
    .catch(() => {
        const alumnosElem = document.getElementById('alumnos-registrados');
        if (alumnosElem) alumnosElem.textContent = '0';
    });

    // Consulta y muestra cantidad de instructores
    fetch('http://localhost:8080/api/instructors/getDataInstructors', {
        method: 'GET'
    })
    .then(res => res.json())
    .then(data => {
        let instructors = [];
        if (data && data.data && Array.isArray(data.data.content)) {
            instructors = data.data.content;
        }
        const instructoresElem = document.getElementById('maestros-registrados');
        if (instructoresElem) instructoresElem.textContent = instructors.length;
    })
    .catch(() => {
        const instructoresElem = document.getElementById('maestros-registrados');
        if (instructoresElem) instructoresElem.textContent = '0';
    });

    // Mostrar módulos por año dinámicamente
    let allModules = [];

    function renderModulosPorAno(levelId) {
        const lista = document.querySelector('.lista-modulos');
        if (!lista) return;
        lista.innerHTML = '';
        const modulosFiltrados = allModules.filter(m => m.levelId === levelId);
        if (modulosFiltrados.length === 0) {
            lista.innerHTML = '<div style="color:#888;text-align:center;">No hay módulos para este año.</div>';
            return;
        }
        modulosFiltrados.forEach(modulo => {
            lista.innerHTML += `
                <div class="elemento-modulo" data-year="${modulo.levelId}">
                    <span class="titulo-modulo">${modulo.moduleName || '-'}</span>
                    <span class="nivel-modulo">${modulo.levelName || '-'}</span>
                </div>
            `;
        });
    }

    // Consulta los módulos y renderiza el año por defecto
    fetch('http://localhost:8080/api/modules/getAllModules', {
        method: 'GET'
    })
    .then(res => res.json())
    .then(data => {
        // Ajusta según la estructura real del JSON
        if (Array.isArray(data)) {
            allModules = data;
        } else if (data && Array.isArray(data.data)) {
            allModules = data.data;
        }
        // Mostrar por defecto los de primer año (levelId = 1)
        renderModulosPorAno(1);
        // Filtros de año
        document.querySelectorAll('.boton-filtro[data-year]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.boton-filtro[data-year]').forEach(function (b) {
                    b.classList.remove('activo');
                });
                btn.classList.add('activo');
                // levelId: 1=primer, 2=segundo, 3=tercero
                let levelId = 1;
                if (btn.getAttribute('data-year') === 'segundo') levelId = 2;
                if (btn.getAttribute('data-year') === 'tercero') levelId = 3;
                renderModulosPorAno(levelId);
            });
        });
    })
    .catch(() => {
        const lista = document.querySelector('.lista-modulos');
        if (lista) lista.innerHTML = '<div style="color:#888;text-align:center;">No se pudieron cargar los módulos.</div>';
    });

});