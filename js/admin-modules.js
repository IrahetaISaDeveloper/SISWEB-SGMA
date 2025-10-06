const API_BASE_URL = 'https://sgma-66ec41075156.herokuapp.com';

const formulario = document.getElementById('formulario-modulo');
const nombreModuloEl = document.getElementById('nombreModulo');
const codigoModuloEl = document.getElementById('codigoModulo');
const descripcionModuloEl = document.getElementById('descripcionModulo');
const idModuloEl = document.getElementById('idModulo');
const comboLevelEl = document.getElementById('comboLevel');
const comboInstructorEl = document.getElementById('comboInstructor');
const botonCancelar = document.getElementById('btn-cancelar');
const botonEnviar = document.getElementById('btn-enviar');
const cuerpoTabla = document.getElementById('cuerpo-tabla-modulos');
const buscadorModulosEl = document.getElementById('buscador-modulos');
const filtroAnoModuloEl = document.getElementById('filtro-ano-modulo');

// Variables para paginación
let currentPage = 0;
const pageSize = 10;
let totalPages = 0;

// Variables para datos
let levels = [];
let instructors = [];
let modules = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadLevels();
    loadInstructors();
    loadModules();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    formulario.addEventListener('submit', handleFormSubmit);
    botonCancelar.addEventListener('click', resetForm);
    buscadorModulosEl.addEventListener('input', debounce(filterModules, 300));
    filtroAnoModuloEl.addEventListener('change', filterModules);
}

// Cargar niveles para el combobox
async function loadLevels() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/levels/getAllLevels`, {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            levels = data.data.content || data.data;
            populateLevelsCombo();
        }
    } catch (error) {
        console.error('Error al cargar niveles:', error);
        showMessage('Error al cargar niveles', 'error');
    }
}

// Cargar instructores para el combobox
async function loadInstructors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/instructors/getAllInstructors`, {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            instructors = data.data.content || data.data;
            populateInstructorsCombo();
        }
    } catch (error) {
        console.error('Error al cargar instructores:', error);
        showMessage('Error al cargar instructores', 'error');
    }
}

// Poblar combobox de niveles
function populateLevelsCombo() {
    comboLevelEl.innerHTML = '<option value="">Seleccione un nivel</option>';
    levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.levelId;
        option.textContent = level.levelName;
        comboLevelEl.appendChild(option);
    });
}

// Poblar combobox de instructores
function populateInstructorsCombo() {
    comboInstructorEl.innerHTML = '<option value="">Seleccione un instructor</option>';
    instructors.forEach(instructor => {
        const option = document.createElement('option');
        option.value = instructor.instructorId;
        option.textContent = `${instructor.firstName} ${instructor.lastName}`;
        comboInstructorEl.appendChild(option);
    });
}

// Cargar módulos con paginación
async function loadModules(page = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/modules/getAllModules?page=${page}&size=${pageSize}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            modules = data.data.content;
            currentPage = data.data.number;
            totalPages = data.data.totalPages;
            renderModulesTable();
            renderPagination();
        }
    } catch (error) {
        console.error('Error al cargar módulos:', error);
        showMessage('Error al cargar módulos', 'error');
    }
}

// Renderizar tabla de módulos
function renderModulesTable() {
    cuerpoTabla.innerHTML = '';
    
    modules.forEach(module => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${module.moduleCode}</td>
            <td>${module.moduleName}</td>
            <td>${module.levelName || 'N/A'}</td>
            <td>${module.instructorName || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-warning mb-1 me-1" onclick="editModule(${module.moduleId})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger mb-1" onclick="deleteModule(${module.moduleId})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        cuerpoTabla.appendChild(row);
    });
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Validar que los elementos existen antes de acceder a sus propiedades
    if (!codigoModuloEl || !nombreModuloEl || !descripcionModuloEl || !comboLevelEl || !comboInstructorEl || !idModuloEl) {
        showMessage('Error: Elementos del formulario no encontrados', 'error');
        return;
    }
    
    const moduleData = {
        moduleCode: codigoModuloEl.value.trim(),
        moduleName: nombreModuloEl.value.trim(),
        moduleDescription: descripcionModuloEl.value.trim(),
        levelId: parseInt(comboLevelEl.value),
        instructorId: parseInt(comboInstructorEl.value)
    };
    
    const isEditing = idModuloEl.value !== '';
    
    try {
        if (isEditing) {
            await updateModule(parseInt(idModuloEl.value), moduleData);
        } else {
            await createModule(moduleData);
        }
        
        resetForm();
        loadModules(currentPage);
        showMessage(`Módulo ${isEditing ? 'actualizado' : 'creado'} exitosamente`, 'success');
    } catch (error) {
        console.error('Error al guardar módulo:', error);
        showMessage('Error al guardar el módulo', 'error');
    }
}

// Crear nuevo módulo
async function createModule(moduleData) {
    const response = await fetch(`${API_BASE_URL}/api/modules/newModule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(moduleData)
    });
    
    if (!response.ok) {
        throw new Error('Error al crear módulo');
    }
    
    return response.json();
}

// Actualizar módulo
async function updateModule(id, moduleData) {
    const response = await fetch(`${API_BASE_URL}/api/modules/updateModule/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(moduleData)
    });
    
    if (!response.ok) {
        throw new Error('Error al actualizar módulo');
    }
    
    return response.json();
}

// Editar módulo
function editModule(id) {
    const module = modules.find(m => m.moduleId === id);
    if (module && idModuloEl && codigoModuloEl && nombreModuloEl && descripcionModuloEl && comboLevelEl && comboInstructorEl && botonEnviar) {
        idModuloEl.value = module.moduleId;
        codigoModuloEl.value = module.moduleCode;
        nombreModuloEl.value = module.moduleName;
        descripcionModuloEl.value = module.moduleDescription || '';
        comboLevelEl.value = module.levelId;
        comboInstructorEl.value = module.instructorId;
        
        botonEnviar.textContent = 'Actualizar';
        botonEnviar.className = 'btn btn-warning';
        
        // Scroll al formulario
        formulario.scrollIntoView({ behavior: 'smooth' });
    } else {
        showMessage('Error: No se pudo cargar la información del módulo', 'error');
    }
}

// Eliminar módulo
async function deleteModule(id) {
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea eliminar este módulo? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/modules/deleteModule/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            loadModules(currentPage);
            showMessage('Módulo eliminado exitosamente', 'success');
        } else {
            showMessage('Error al eliminar el módulo', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar módulo:', error);
        showMessage('Error al eliminar el módulo', 'error');
    }
}

// Resetear formulario
function resetForm() {
    if (formulario) {
        formulario.reset();
    }
    if (idModuloEl) {
        idModuloEl.value = '';
    }
    if (botonEnviar) {
        botonEnviar.textContent = 'Crear';
        botonEnviar.className = 'btn btn-primary';
    }
}

// Validar formulario
function validateForm() {
    // Validar que los elementos existen
    if (!codigoModuloEl || !nombreModuloEl || !comboLevelEl || !comboInstructorEl) {
        showMessage('Error: Elementos del formulario no encontrados', 'error');
        return false;
    }

    const codigo = codigoModuloEl.value.trim();
    const nombre = nombreModuloEl.value.trim();
    const levelId = comboLevelEl.value;
    const instructorId = comboInstructorEl.value;
    
    if (!codigo) {
        showMessage('El código del módulo es requerido', 'error');
        codigoModuloEl.focus();
        return false;
    }
    
    if (!nombre) {
        showMessage('El nombre del módulo es requerido', 'error');
        nombreModuloEl.focus();
        return false;
    }
    
    if (!levelId) {
        showMessage('Debe seleccionar un nivel', 'error');
        comboLevelEl.focus();
        return false;
    }
    
    if (!instructorId) {
        showMessage('Debe seleccionar un instructor', 'error');
        comboInstructorEl.focus();
        return false;
    }
    
    return true;
}

// Filtrar módulos
function filterModules() {
    if (!buscadorModulosEl || !filtroAnoModuloEl) {
        return;
    }
    
    const searchTerm = buscadorModulosEl.value.toLowerCase();
    const selectedYear = filtroAnoModuloEl.value;
    
    let filteredModules = modules;
    
    if (searchTerm) {
        filteredModules = filteredModules.filter(module =>
            module.moduleCode.toLowerCase().includes(searchTerm) ||
            module.moduleName.toLowerCase().includes(searchTerm) ||
            (module.instructorName && module.instructorName.toLowerCase().includes(searchTerm))
        );
    }
    
    if (selectedYear) {
        filteredModules = filteredModules.filter(module =>
            module.levelName && module.levelName.includes(selectedYear)
        );
    }
    
    renderFilteredTable(filteredModules);
}

// Renderizar tabla filtrada
function renderFilteredTable(filteredModules) {
    cuerpoTabla.innerHTML = '';
    
    filteredModules.forEach(module => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${module.moduleCode}</td>
            <td>${module.moduleName}</td>
            <td>${module.levelName || 'N/A'}</td>
            <td>${module.instructorName || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-warning mb-1 me-1" onclick="editModule(${module.moduleId})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger mb-1" onclick="deleteModule(${module.moduleId})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        cuerpoTabla.appendChild(row);
    });
}

// Renderizar paginación
function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Botón anterior
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Anterior';
    prevButton.className = `btn btn-sm ${currentPage === 0 ? 'btn-secondary' : 'btn-primary'}`;
    prevButton.disabled = currentPage === 0;
    prevButton.onclick = () => currentPage > 0 && loadModules(currentPage - 1);
    paginationContainer.appendChild(prevButton);
    
    // Información de página
    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` Página ${currentPage + 1} de ${totalPages} `;
    pageInfo.className = 'mx-2';
    paginationContainer.appendChild(pageInfo);
    
    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Siguiente';
    nextButton.className = `btn btn-sm ${currentPage >= totalPages - 1 ? 'btn-secondary' : 'btn-primary'}`;
    nextButton.disabled = currentPage >= totalPages - 1;
    nextButton.onclick = () => currentPage < totalPages - 1 && loadModules(currentPage + 1);
    paginationContainer.appendChild(nextButton);
}

// Función debounce para búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar mensajes con SweetAlert2
function showMessage(message, type) {
    const iconType = type === 'error' ? 'error' : 'success';
    const title = type === 'error' ? 'Error' : 'Éxito';
    
    Swal.fire({
        title: title,
        text: message,
        icon: iconType,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}

// Exportar funciones para uso global
window.editModule = editModule;
window.deleteModule = deleteModule;

