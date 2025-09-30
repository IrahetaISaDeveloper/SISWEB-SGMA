const API_BASE_URL = 'https://sgma-66ec41075156.herokuapp.com/api';

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
    fetch(`${API_BASE_URL}/vehicles/getAllVehicles`, {
        method: 'GET',
        credentials: 'include'
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
    fetch(`${API_BASE_URL}/Student/getAllStudents`, {
        method: 'GET',
        credentials: 'include'
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
    fetch(`${API_BASE_URL}/instructors/getAllInstructors`, {
        method: 'GET',
        credentials: 'include'
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
        let modulosFiltrados;
        if (levelId === 'todos') {
            modulosFiltrados = allModules;
        } else {
            let numId = 1;
            if (levelId === 'primer') numId = 1;
            else if (levelId === 'segundo') numId = 2;
            else if (levelId === 'tercero') numId = 3;
            modulosFiltrados = allModules.filter(m => m.levelId === numId);
        }
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

    /*
    // Cargar módulos desde el endpoint y mostrar por año
    async function cargarModulosYMostrar() {
        try {
            const res = await fetch('https://sgma-66ec41075156.herokuapp.com/api/getAllModules', {
// La URL termina aquí 👆
    credentials: 'include'
});
// El error debería desaparecer.
            
            const data = await res.json();
            // Si la respuesta es { data: { content: [...] } }
            if (data && data.data && Array.isArray(data.data.content)) {
                allModules = data.data.content;
            } else if (Array.isArray(data)) {
                allModules = data;
            } else {
                allModules = [];
            }
            // Por defecto muestra todos
            renderModulosPorAno('todos');
            // Filtros por año
            document.querySelectorAll('.boton-filtro[data-year]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    document.querySelectorAll('.boton-filtro[data-year]').forEach(function (b) {
                        b.classList.remove('activo');
                    });
                    btn.classList.add('activo');
                    renderModulosPorAno(btn.getAttribute('data-year'));
                });
            });
        } catch (error) {
            const lista = document.querySelector('.lista-modulos');
            if (lista) lista.innerHTML = '<div style="color:#888;text-align:center;">No se pudieron cargar los módulos.</div>';
        }
    }

    cargarModulosYMostrar();
    */

});