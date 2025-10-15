// Import the auth service
import { me } from './service/authService.js';

const API_BASE_URL = 'https://sgma-66ec41075156.herokuapp.com';

// -----------------------------------------------------
// REFERENCIAS A ELEMENTOS DEL DOM
// -----------------------------------------------------
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
const paginationContainer = document.getElementById('pagination-container');

// Variables para paginación y datos
let currentPage = 0;
const pageSize = 10;
let totalPages = 0;
let levels = [];
let instructors = [];
let modules = [];
let userRole = null; // Variable para almacenar el rol del usuario

// -----------------------------------------------------
// 1. UTILERÍA DE API (FUNCIÓN UNIFICADA Y MEJORADA)
// -----------------------------------------------------

/**
 * Realiza peticiones fetch, maneja errores de red/HTTP, y extrae los datos.
 * Normaliza la extracción de datos sin importar si es paginado (data.content) o simple (data).
 * @param {string} url La URL completa del endpoint.
 * @param {object} options Opciones de fetch (method, body, headers, etc.).
 * @returns {object} Un objeto con los datos extraídos (datos) y la información de paginación (paginacion).
 */
async function apiFetch(url, options = {}) {
    const defaultOptions = { credentials: 'include', ...options };
    
    // Aquí puedes incluir tu token JWT si lo tienes almacenado:
    // const token = localStorage.getItem('jwtToken'); 
    // if (token) {
    //     defaultOptions.headers = {
    //         ...defaultOptions.headers,
    //         'Authorization': `Bearer ${token}`
    //     };
    // }
    
    const response = await fetch(url, defaultOptions);
    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
        let errorMessage = responseData.message || `Error HTTP: ${response.status} - ${response.statusText}`;
        if (response.status === 403) {
            errorMessage = "Acceso denegado (403). Verifique su sesión.";
        }
        throw new Error(errorMessage);
    }

    let extractedData = responseData.data;
    let paginationInfo = {};

    // Normalización de la respuesta
    if (extractedData) {
        // Caso Paginado (ej. /instructors, /modules): Los datos están en 'content'
        if (extractedData.content && Array.isArray(extractedData.content)) {
            extractedData = extractedData.content;
            // Guardamos la info de paginación
            paginationInfo = { number: extractedData.number, totalPages: extractedData.totalPages }; 
        } 
        // Caso Lista Simple (ej. /levels): Los datos son directamente el array
        else if (Array.isArray(extractedData)) {
            // Ya es el array
        }
    } else {
        extractedData = [];
    }

    return { 
        datos: extractedData, 
        paginacion: paginationInfo 
    };
}

// -----------------------------------------------------
// 2. CARGA DE DATOS Y POBLACIÓN DE COMBOS
// -----------------------------------------------------

// Cargar niveles para el combobox
async function loadLevels() {
    try {
        console.log('Iniciando carga de niveles...');
        const result = await apiFetch(`${API_BASE_URL}/api/levels/getAllLevels`);
        
        levels = result.datos;
        console.log('Niveles extraídos:', levels);
        
        if (comboLevelEl) {
            populateLevelsCombo();
        }
    } catch (error) {
        console.error('Error al cargar niveles:', error);
        showMessage('Error al cargar niveles: ' + error.message, 'error');
    }
}

// Cargar instructores para el combobox
async function loadInstructors() {
    try {
        console.log('Iniciando carga de instructores...');
        const result = await apiFetch(`${API_BASE_URL}/api/instructors/getAllInstructors`);
        
        instructors = result.datos;
        console.log('Instructores extraídos:', instructors);
        
        if (comboInstructorEl) {
            populateInstructorsCombo();
        }
    } catch (error) {
        console.error('Error al cargar instructores:', error);
        showMessage('Error al cargar instructores: ' + error.message, 'error');
    }
}

// Poblar combobox de niveles (CORREGIDO: usa level.id)
function populateLevelsCombo() {
    if (!comboLevelEl) return;
    
    comboLevelEl.innerHTML = '<option value="">Seleccione un nivel</option>';
    
    if (!levels || levels.length === 0) {
        comboLevelEl.innerHTML += '<option value="" disabled>No hay niveles disponibles</option>';
        return;
    }
    
    levels.forEach(level => {
        // CORRECCIÓN CLAVE: Usar level.id (según el JSON)
        if (level && level.id && level.levelName) { 
            const option = document.createElement('option');
            option.value = level.id;
            option.textContent = level.levelName;
            comboLevelEl.appendChild(option);
        } else {
            console.warn('Nivel con formato inválido omitido:', level);
        }
    });
}

// Poblar combobox de instructores
function populateInstructorsCombo() {
    if (!comboInstructorEl) return;
    
    comboInstructorEl.innerHTML = '<option value="">Seleccione un instructor</option>';
    
    if (!instructors || instructors.length === 0) {
        comboInstructorEl.innerHTML += '<option value="" disabled>No hay instructores disponibles</option>';
        return;
    }
    
    instructors.forEach(instructor => {
        if (instructor && instructor.instructorId && instructor.firstName && instructor.lastName) {
            const option = document.createElement('option');
            option.value = instructor.instructorId;
            option.textContent = `${instructor.firstName} ${instructor.lastName}`;
            comboInstructorEl.appendChild(option);
        }
    });
}

// -----------------------------------------------------
// 3. LÓGICA DE MÓDULOS (CRUD)
// -----------------------------------------------------

// Cargar módulos con paginación
async function loadModules(page = 0) {
    try {
        const url = `${API_BASE_URL}/api/modules/getAllModules?page=${page}&size=${pageSize}`;
        const result = await apiFetch(url);
        
        modules = result.datos;
        // La info de paginación debe ser consistente con la estructura del JSON
        if (result.paginacion.number !== undefined) {
             currentPage = result.paginacion.number;
             totalPages = result.paginacion.totalPages;
        }
        
        renderModulesTable();
        renderPagination();
    } catch (error) {
        console.error('Error al cargar módulos:', error);
        showMessage('Error al cargar módulos: ' + error.message, 'error');
    }
}

/**
 * Crea un nuevo módulo enviando los datos al servidor.
 */
async function createModule(moduleData) {
    try {
        console.log('Enviando datos para crear módulo:', moduleData);

        // Uso de apiFetch para manejo robusto de la petición
        await apiFetch(`${API_BASE_URL}/api/modules/newModule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(moduleData)
        });

    } catch (error) {
        // Relanza el error para que handleFormSubmit lo maneje
        throw new Error(error.message || 'Error desconocido al crear módulo.');
    }
}

/**
 * Actualiza un módulo existente.
 */
async function updateModule(id, moduleData) {
    try {
        console.log('Enviando datos para actualizar módulo:', id, moduleData);

        // Uso de apiFetch para manejo robusto de la petición
        await apiFetch(`${API_BASE_URL}/api/modules/updateModule/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(moduleData)
        });

    } catch (error) {
        // Relanza el error para que handleFormSubmit lo maneje
        throw new Error(error.message || 'Error desconocido al actualizar módulo.');
    }
}

/**
 * Elimina un módulo.
 */
async function deleteModule(id) {
    // Verificar permisos antes de permitir eliminación
    if (userRole === 'Docente') {
        showMessage('No tiene permisos para eliminar módulos', 'error');
        return;
    }
    
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
        await apiFetch(`${API_BASE_URL}/api/modules/deleteModule/${id}`, {
            method: 'DELETE'
        });
        
        loadModules(currentPage);
        showMessage('Módulo eliminado exitosamente', 'success');
    } catch (error) {
        console.error('Error al eliminar módulo:', error);
        showMessage('Error al eliminar el módulo: ' + error.message, 'error');
    }
}

// Manejar envío del formulario (Crear/Actualizar)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Verificar permisos antes de permitir creación/actualización
    if (userRole === 'Docente') {
        showMessage('No tiene permisos para crear o actualizar módulos', 'error');
        return;
    }
    
    if (!validateForm()) {
        return;
    }
    
    // Obtener y validar IDs (ya se validan en validateForm, pero convertimos a int aquí)
    const levelId = parseInt(comboLevelEl.value);
    const instructorId = parseInt(comboInstructorEl.value);

    const moduleData = {
        moduleCode: codigoModuloEl.value.trim(),
        moduleName: nombreModuloEl.value.trim(),
        moduleDescription: descripcionModuloEl ? descripcionModuloEl.value.trim() : '',
        levelId: levelId,
        instructorId: instructorId
    };
    
    const isEditing = idModuloEl.value !== '';
    
    try {
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
        // Recargar la tabla (al inicio si es nuevo, o en la página actual si se editó)
        loadModules(isEditing ? currentPage : 0); 
        showMessage(`Módulo ${isEditing ? 'actualizado' : 'creado'} exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error al guardar módulo:', error);
        showMessage(`Error al guardar el módulo: ${error.message}`, 'error');
        
    } finally {
        if (botonEnviar) {
            botonEnviar.disabled = false;
            botonEnviar.textContent = isEditing ? 'Actualizar' : 'Crear';
        }
    }
}

// -----------------------------------------------------
// 4. RENDERING Y AUXILIARES
// -----------------------------------------------------

// Renderizar tabla de módulos (ACTUALIZADA para deshabilitar botones según rol)
function renderModulesTable() {
    if (!cuerpoTabla) return;
    cuerpoTabla.innerHTML = '';
    
    modules.forEach(module => {
        const row = document.createElement('tr');
        
        // Determinar el nombre del instructor de manera segura
        const instructorName = module.instructor?.instructorName || 
                               (module.instructorName || 'N/A');

        // Generar botones de acción según el rol
        let actionButtons = '';
        if (userRole === 'Docente') {
            // Para Docente: solo botón de ver (deshabilitado o sin funcionalidad de edición)
            actionButtons = `
                <button class="btn btn-sm btn-secondary mb-1" disabled title="Sin permisos para editar">
                    <i class="fas fa-eye"></i> Ver
                </button>
            `;
        } else {
            // Para otros roles: botones completos de edición y eliminación
            actionButtons = `
                <button class="btn btn-sm btn-warning mb-1 me-1" onclick="editModule(${module.moduleId})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger mb-1" onclick="deleteModule(${module.moduleId})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
        }

        row.innerHTML = `
            <td>${module.moduleCode || 'N/A'}</td>
            <td>${module.moduleName || 'N/A'}</td>
            <td>${module.levelName || 'N/A'}</td>
            <td>${instructorName}</td>
            <td>${actionButtons}</td>
        `;
        cuerpoTabla.appendChild(row);
    });
}

// Editar módulo (ACTUALIZADA para verificar permisos)
function editModule(id) {
    // Verificar permisos antes de permitir edición
    if (userRole === 'Docente') {
        showMessage('No tiene permisos para editar módulos', 'error');
        return;
    }
    
    const module = modules.find(m => m.moduleId === id);
    if (!module) {
        showMessage('Error: Módulo no encontrado', 'error');
        return;
    }
    
    idModuloEl.value = module.moduleId;
    codigoModuloEl.value = module.moduleCode || '';
    nombreModuloEl.value = module.moduleName || '';
    if (descripcionModuloEl) {
        descripcionModuloEl.value = module.moduleDescription || '';
    }
    
    // Seleccionar valores en los combos
    // Level ID: El ID del módulo (levelId) es el valor correcto (level.id)
    if (module.levelId && comboLevelEl) {
        comboLevelEl.value = String(module.levelId); 
    }
    // Instructor ID
    if (module.instructorId && comboInstructorEl) {
        comboInstructorEl.value = String(module.instructorId);
    }
    
    // Cambiar el botón a modo edición
    if (botonEnviar) {
        botonEnviar.textContent = 'Actualizar';
        botonEnviar.className = 'botones';
    }
    
    if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth' });
    }
    
    showMessage('Módulo cargado para edición', 'success');
}

// Eliminar módulo (la función ya está definida arriba)
// deleteModule(id)

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
        botonEnviar.className = 'botones secundario';
    }
}

// Validar formulario (simplificada, asume que los elementos existen)
function validateForm() {
    const codigo = codigoModuloEl.value.trim();
    const nombre = nombreModuloEl.value.trim();
    const levelValue = comboLevelEl.value;
    const instructorValue = comboInstructorEl.value;
    
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
    
    // Validación clave para los combos
    if (!levelValue) {
        showMessage('Debe seleccionar un nivel', 'error');
        comboLevelEl.focus();
        return false;
    }
    
    if (!instructorValue) {
        showMessage('Debe seleccionar un instructor', 'error');
        comboInstructorEl.focus();
        return false;
    }
    
    return true;
}

// Filtrar módulos (se mantiene el original)
function filterModules() {
    if (!buscadorModulosEl || !filtroAnoModuloEl) return;
    
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

// Renderizar tabla filtrada (ACTUALIZADA para deshabilitar botones según rol)
function renderFilteredTable(filteredModules) {
    if (!cuerpoTabla) return;
    cuerpoTabla.innerHTML = '';
    
    filteredModules.forEach(module => {
        const row = document.createElement('tr');
        const instructorName = module.instructor?.instructorName || (module.instructorName || 'N/A');

        // Generar botones de acción según el rol
        let actionButtons = '';
        if (userRole === 'Docente') {
            actionButtons = `
                <button class="btn btn-sm btn-secondary mb-1" disabled title="Sin permisos para editar">
                    <i class="fas fa-eye"></i> Ver
                </button>
            `;
        } else {
            actionButtons = `
                <button class="btn btn-sm btn-warning mb-1 me-1" onclick="editModule(${module.moduleId})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger mb-1" onclick="deleteModule(${module.moduleId})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
        }

        row.innerHTML = `
            <td>${module.moduleCode || 'N/A'}</td>
            <td>${module.moduleName || 'N/A'}</td>
            <td>${module.levelName || 'N/A'}</td>
            <td>${instructorName}</td>
            <td>${actionButtons}</td>
        `;
        cuerpoTabla.appendChild(row);
    });
}

// Renderizar paginación (Se mantiene tu código original)
function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Anterior';
    prevButton.className = `btn btn-sm ${currentPage === 0 ? 'btn-secondary' : 'btn-primary'}`;
    prevButton.disabled = currentPage === 0;
    prevButton.onclick = () => currentPage > 0 && loadModules(currentPage - 1);
    paginationContainer.appendChild(prevButton);
    
    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` Página ${currentPage + 1} de ${totalPages} `;
    pageInfo.className = 'mx-2';
    paginationContainer.appendChild(pageInfo);
    
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Siguiente';
    nextButton.className = `btn btn-sm ${currentPage >= totalPages - 1 ? 'btn-secondary' : 'btn-primary'}`;
    nextButton.disabled = currentPage >= totalPages - 1;
    nextButton.onclick = () => currentPage < totalPages - 1 && loadModules(currentPage + 1);
    paginationContainer.appendChild(nextButton);
}

// Función debounce para búsqueda (Se mantiene tu código original)
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

// Mostrar mensajes con SweetAlert2 (Se mantiene tu código original)
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


// -----------------------------------------------------
// 5. INICIALIZACIÓN Y EVENT LISTENERS
// -----------------------------------------------------

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM cargado, iniciando carga de datos...');
    
    // Primero obtener información del usuario
    await getUserInfo();
    
    // Carga paralela de datos de combos
    await Promise.all([
        loadLevels(),
        loadInstructors() 
    ]);
    // Carga de la tabla principal
    await loadModules();
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

// -----------------------------------------------------
// FUNCIÓN PARA OBTENER INFORMACIÓN DEL USUARIO
// -----------------------------------------------------

/**
 * Obtiene la información del usuario autenticado y su rol
 */
async function getUserInfo() {
    try {
        const userInfo = await me();
        console.log('User info received:', userInfo); // Debug log
        
        if (userInfo.authenticated && userInfo.instructor && userInfo.instructor.role) {
            userRole = userInfo.instructor.role;
            console.log('User role set to:', userRole); // Debug log
            handleRoleBasedUI();
            return userInfo.instructor;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return null;
    }
}

/**
 * Controla la visibilidad y funcionalidad de la UI según el rol del usuario
 */
function handleRoleBasedUI() {
    const formContainer = document.querySelector('.form-container');
    const addNewButton = document.querySelector('.btn-add-new'); // Si tienes un botón para agregar nuevo
    
    console.log('Handling UI for role:', userRole); // Debug log
    
    if (userRole === 'Docente') {
        // Ocultar el formulario para usuarios Docente
        if (formContainer) {
            formContainer.style.display = 'none';
            console.log('Form hidden for Docente role'); // Debug log
        }
        
        // Ocultar botón de agregar nuevo si existe
        if (addNewButton) {
            addNewButton.style.display = 'none';
        }
        
        // Agregar mensaje informativo
        addDocenteMessage();
    } else {
        // Mostrar el formulario para otros roles
        if (formContainer) {
            formContainer.style.display = 'block';
            console.log('Form shown for role:', userRole); // Debug log
        }
        
        if (addNewButton) {
            addNewButton.style.display = 'block';
        }
    }
}

/**
 * Agrega un mensaje informativo para usuarios Docente
 */
function addDocenteMessage() {
    const mainContainer = document.querySelector('.container') || document.querySelector('main') || document.body;
    
    // Verificar si ya existe el mensaje
    if (document.querySelector('.docente-info-message')) {
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'docente-info-message';
    messageDiv.style.cssText = `
        background: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 8px;
        padding: 16px;
        margin: 20px 0;
        color: #1976d2;
        text-align: center;
        font-weight: 500;
    `;
    messageDiv.innerHTML = `
        <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
        Como usuario Docente, solo puede consultar la información de los módulos. 
        Las funciones de creación, edición y eliminación están restringidas.
    `;
    
    // Insertar el mensaje al inicio del contenedor principal
    if (mainContainer.firstChild) {
        mainContainer.insertBefore(messageDiv, mainContainer.firstChild);
    } else {
        mainContainer.appendChild(messageDiv);
    }
}

// Exportar funciones para uso global (necesario para onclick en el HTML)
window.editModule = editModule;
window.deleteModule = deleteModule;