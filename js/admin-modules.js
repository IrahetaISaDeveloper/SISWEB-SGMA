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
    if (formulario) {
        formulario.addEventListener('submit', handleFormSubmit);
    }
    if (botonCancelar) {
        botonCancelar.addEventListener('click', resetForm);
    }
    if (buscadorModulosEl) {
        buscadorModulosEl.addEventListener('input', debounce(filterModules, 300));
    }
    if (filtroAnoModuloEl) {
        filtroAnoModuloEl.addEventListener('change', filterModules);
    }
}

// Cargar niveles para el combobox
async function loadLevels() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/levels/getAllLevels`, {
            credentials: 'include'
        });
        const data = await response.json();
        console.log('Respuesta de niveles:', data);
        if (data.success) {
            levels = data.data.content || data.data;
            console.log('Niveles cargados:', levels);
            populateLevelsCombo();
        } else {
            console.error('Error en respuesta de niveles:', data);
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
    if (!comboLevelEl) {
        console.error('comboLevelEl no encontrado');
        return;
    }
    
    console.log('Poblando combo de niveles con:', levels);
    comboLevelEl.innerHTML = '<option value="">Seleccione un nivel</option>';
    
    if (!levels || levels.length === 0) {
        console.warn('No hay niveles para poblar el combo');
        return;
    }
    
    levels.forEach((level, index) => {
        console.log(`Creando opción ${index}:`, level);
        const option = document.createElement('option');
        option.value = level.levelId;
        option.textContent = level.levelName;
        comboLevelEl.appendChild(option);
    });
    
    console.log('Combo de niveles poblado. Opciones:', comboLevelEl.children.length);
}

// Poblar combobox de instructores
function populateInstructorsCombo() {
    if (!comboInstructorEl) {
        console.error('comboInstructorEl no encontrado');
        return;
    }
    
    console.log('Poblando combo de instructores con:', instructors);
    comboInstructorEl.innerHTML = '<option value="">Seleccione un instructor</option>';
    
    if (!instructors || instructors.length === 0) {
        console.warn('No hay instructores para poblar el combo');
        return;
    }
    
    instructors.forEach((instructor, index) => {
        console.log(`Creando opción instructor ${index}:`, instructor);
        const option = document.createElement('option');
        option.value = instructor.instructorId;
        option.textContent = `${instructor.firstName} ${instructor.lastName}`;
        comboInstructorEl.appendChild(option);
    });
    
    console.log('Combo de instructores poblado. Opciones:', comboInstructorEl.children.length);
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
    
    // Validar que los elementos esenciales existen antes de acceder a sus propiedades
    if (!codigoModuloEl || !nombreModuloEl || !comboLevelEl || !comboInstructorEl || !idModuloEl) {
        showMessage('Error: Elementos esenciales del formulario no encontrados', 'error');
        return;
    }
    
    // Obtener valores de los combobox
    const levelValue = comboLevelEl.value;
    const instructorValue = comboInstructorEl.value;
    
    console.log('Valores de combobox:', { levelValue, instructorValue });
    
    // Validar que se hayan seleccionado valores
    if (!levelValue || levelValue === '') {
        showMessage('Error: Debe seleccionar un nivel', 'error');
        comboLevelEl.focus();
        return;
    }
    
    if (!instructorValue || instructorValue === '') {
        showMessage('Error: Debe seleccionar un instructor', 'error');
        comboInstructorEl.focus();
        return;
    }
    
    // Convertir a números
    const levelId = parseInt(levelValue);
    const instructorId = parseInt(instructorValue);
    
    // Validar que la conversión a número sea exitosa
    if (isNaN(levelId) || levelId <= 0) {
        showMessage('Error: ID de nivel inválido', 'error');
        comboLevelEl.focus();
        return;
    }
    
    if (isNaN(instructorId) || instructorId <= 0) {
        showMessage('Error: ID de instructor inválido', 'error');
        comboInstructorEl.focus();
        return;
    }
    
    const moduleData = {
        moduleCode: codigoModuloEl.value.trim(),
        moduleName: nombreModuloEl.value.trim(),
        moduleDescription: descripcionModuloEl ? descripcionModuloEl.value.trim() : '',
        levelId: levelId,
        instructorId: instructorId
    };
    
    console.log('Datos del módulo a enviar:', moduleData);
    
    const isEditing = idModuloEl.value !== '';
    
    try {
        // Mostrar indicador de carga
        if (botonEnviar) {
            botonEnviar.disabled = true;
            botonEnviar.textContent = isEditing ? 'Actualizando...' : 'Creando...';
        }
        
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
        showMessage(`Error al guardar el módulo: ${error.message}`, 'error');
    } finally {
        // Restaurar botón
        if (botonEnviar) {
            botonEnviar.disabled = false;
            botonEnviar.textContent = idModuloEl.value !== '' ? 'Actualizar' : 'Crear';
        }
    }
}

// Crear nuevo módulo
async function createModule(moduleData) {
    try {
        console.log('Enviando datos para crear módulo:', moduleData);
        
        const response = await fetch(`${API_BASE_URL}/api/modules/newModule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(moduleData)
        });
        
        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('No tiene permisos para crear módulos. Verifique su sesión.');
            }
            throw new Error(responseData.message || `Error del servidor: ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error('Error en createModule:', error);
        throw error;
    }
}

// Actualizar módulo
async function updateModule(id, moduleData) {
    try {
        console.log('Enviando datos para actualizar módulo:', id, moduleData);
        
        const response = await fetch(`${API_BASE_URL}/api/modules/updateModule/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(moduleData)
        });
        
        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);
        
        if (!response.ok) {
            if (response.status === 400) {
                const errorMessage = responseData.message || 'Datos inválidos. Verifique la información ingresada.';
                throw new Error(errorMessage);
            }
            if (response.status === 403) {
                throw new Error('No tiene permisos para actualizar módulos. Verifique su sesión.');
            }
            throw new Error(responseData.message || `Error del servidor: ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error('Error en updateModule:', error);
        throw error;
    }
}

// Editar módulo
function editModule(id) {
    console.log('Editando módulo con ID:', id);
    
    const module = modules.find(m => m.moduleId === id);
    if (!module) {
        showMessage('Error: Módulo no encontrado', 'error');
        return;
    }
    
    console.log('Datos del módulo a editar:', module);
    
    // Verificar que los elementos esenciales del formulario existan
    const elementosEsenciales = {
        idModuloEl,
        codigoModuloEl,
        nombreModuloEl,
        comboLevelEl,
        comboInstructorEl,
        botonEnviar
    };
    
    const elementosFaltantes = [];
    for (const [nombre, elemento] of Object.entries(elementosEsenciales)) {
        if (!elemento) {
            elementosFaltantes.push(nombre);
        }
    }
    
    if (elementosFaltantes.length > 0) {
        console.error('Elementos esenciales no encontrados:', elementosFaltantes);
        showMessage(`Error: Elementos esenciales del formulario no encontrados: ${elementosFaltantes.join(', ')}`, 'error');
        return;
    }
    
    try {
        // Llenar los campos del formulario
        idModuloEl.value = module.moduleId;
        codigoModuloEl.value = module.moduleCode || '';
        nombreModuloEl.value = module.moduleName || '';
        
        // Campo descripción es opcional
        if (descripcionModuloEl) {
            descripcionModuloEl.value = module.moduleDescription || '';
        }
        
        // Verificar estado de los combos antes de seleccionar
        console.log('Estado de combos antes de seleccionar:', {
            levelOptions: comboLevelEl.options.length,
            instructorOptions: comboInstructorEl.options.length,
            moduleLevel: module.levelId,
            moduleInstructor: module.instructorId
        });
        
        // Seleccionar valores en los combobox inmediatamente
        if (module.levelId) {
            console.log('Intentando seleccionar nivel:', module.levelId);
            
            // Buscar la opción correspondiente
            let levelFound = false;
            for (let i = 0; i < comboLevelEl.options.length; i++) {
                if (comboLevelEl.options[i].value == module.levelId) {
                    comboLevelEl.selectedIndex = i;
                    levelFound = true;
                    break;
                }
            }
            
            console.log('Nivel encontrado y seleccionado:', levelFound);
            console.log('Valor actual del combo nivel:', comboLevelEl.value);
        }
        
        if (module.instructorId) {
            console.log('Intentando seleccionar instructor:', module.instructorId);
            
            // Buscar la opción correspondiente
            let instructorFound = false;
            for (let i = 0; i < comboInstructorEl.options.length; i++) {
                if (comboInstructorEl.options[i].value == module.instructorId) {
                    comboInstructorEl.selectedIndex = i;
                    instructorFound = true;
                    break;
                }
            }
            
            console.log('Instructor encontrado y seleccionado:', instructorFound);
            console.log('Valor actual del combo instructor:', comboInstructorEl.value);
        }
        
        // Cambiar el botón a modo edición
        botonEnviar.textContent = 'Actualizar';
        botonEnviar.className = 'btn btn-warning';
        
        // Scroll al formulario
        if (formulario) {
            formulario.scrollIntoView({ behavior: 'smooth' });
        }
        
        showMessage('Módulo cargado para edición', 'success');
        
    } catch (error) {
        console.error('Error al cargar datos del módulo:', error);
        showMessage('Error al cargar la información del módulo', 'error');
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
    const elementosRequeridos = [
        { elemento: codigoModuloEl, nombre: 'Código del módulo' },
        { elemento: nombreModuloEl, nombre: 'Nombre del módulo' },
        { elemento: comboLevelEl, nombre: 'Selector de nivel' },
        { elemento: comboInstructorEl, nombre: 'Selector de instructor' }
    ];
    
    for (const { elemento, nombre } of elementosRequeridos) {
        if (!elemento) {
            showMessage(`Error: ${nombre} no encontrado`, 'error');
            return false;
        }
    }

    const codigo = codigoModuloEl.value.trim();
    const nombre = nombreModuloEl.value.trim();
    const levelValue = comboLevelEl.value;
    const instructorValue = comboInstructorEl.value;
    
    // Debug adicional
    console.log('Estado del comboLevelEl:', {
        exists: !!comboLevelEl,
        value: comboLevelEl?.value,
        selectedIndex: comboLevelEl?.selectedIndex,
        optionsCount: comboLevelEl?.options?.length,
        innerHTML: comboLevelEl?.innerHTML?.substring(0, 100)
    });
    
    console.log('Estado del comboInstructorEl:', {
        exists: !!comboInstructorEl,
        value: comboInstructorEl?.value,
        selectedIndex: comboInstructorEl?.selectedIndex,
        optionsCount: comboInstructorEl?.options?.length
    });
    
    console.log('Validando formulario:', { codigo, nombre, levelValue, instructorValue });
    
    if (!codigo) {
        showMessage('El código del módulo es requerido', 'error');
        codigoModuloEl.focus();
        return false;
    }
    
    if (codigo.length > 20) {
        showMessage('El código del módulo no puede exceder 20 caracteres', 'error');
        codigoModuloEl.focus();
        return false;
    }
    
    if (!nombre) {
        showMessage('El nombre del módulo es requerido', 'error');
        nombreModuloEl.focus();
        return false;
    }
    
    if (nombre.length > 500) {
        showMessage('El nombre del módulo no puede exceder 500 caracteres', 'error');
        nombreModuloEl.focus();
        return false;
    }
    
    if (!levelValue || levelValue === '' || levelValue === '0' || levelValue === 'undefined') {
        showMessage('Debe seleccionar un nivel', 'error');
        comboLevelEl.focus();
        return false;
    }
    
    if (!instructorValue || instructorValue === '' || instructorValue === '0' || instructorValue === 'undefined') {
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

