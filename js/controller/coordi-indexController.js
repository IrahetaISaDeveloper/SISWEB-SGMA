// controllers/coordi-indexController.js
import { fetchVehicles, fetchStudents, fetchInstructors, fetchModules } 
    from '../Services/coordi-indexService.js';


const mostrarModulosPorAno = (ano, allModules) => {
    const lista = document.querySelector('.lista-modulos');
    if (!lista) return;

    lista.innerHTML = '';
    let modulosFiltrados;
    if (ano === 'todos') {
        modulosFiltrados = allModules;
    } else {
        const levelId = ano === 'primer' ? 1 : ano === 'segundo' ? 2 : 3;
        modulosFiltrados = allModules.filter(m => m.levelId === levelId);
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
};

const cargarDatosDashboard = async () => {
    try {
        // Cargar vehículos
        const vehicles = await fetchVehicles();
        const totalElem = document.getElementById('total-vehiculos');
        const ptcElem = document.getElementById('vehiculos-ptc');
        if (totalElem) totalElem.textContent = vehicles.length;
        if (ptcElem) ptcElem.textContent = vehicles.filter(v => v.maintenanceEXPO === 1).length;

        // Cargar estudiantes
        const students = await fetchStudents();
        const alumnosElem = document.getElementById('alumnos-registrados');
        if (alumnosElem) alumnosElem.textContent = students.length;

        // Cargar instructores
        const instructors = await fetchInstructors();
        const instructoresElem = document.getElementById('maestros-registrados');
        if (instructoresElem) instructoresElem.textContent = instructors.length;

        // Cargar módulos
        const allModules = await fetchModules();
        mostrarModulosPorAno('todos', allModules);

        // Configurar filtros por año
        document.querySelectorAll('.boton-filtro[data-year]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.boton-filtro[data-year]').forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                mostrarModulosPorAno(btn.getAttribute('data-year'), allModules);
            });
        });
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
    }
};

const initCoordiIndexController = () => {
    document.addEventListener('DOMContentLoaded', cargarDatosDashboard);
};

export { initCoordiIndexController };