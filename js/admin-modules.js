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

// -----------------------------------------------------
// 1. UTILERÍA DE API (MEJORA CLAVE) 🔑
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
    
    // Si necesitas autenticación con JWT, descomenta y usa esta línea:
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
        let errorMessage = responseData.message || `Error HTTP: ${response.status}`;
        if (response.status === 403) {
            errorMessage = "Acceso denegado (403). Verifique su sesión.";
        }
        throw new Error(errorMessage);
    }

    let extractedData = responseData.data;
    let paginationInfo = {};

    // Normalización de la respuesta:
    if (extractedData) {
        // Caso Paginado: Los datos están en 'content'
        if (extractedData.content && Array.isArray(extractedData.content)) {
            extractedData = extractedData.content;
            paginationInfo = { ...extractedData }; // Copia la info de paginación
        } 
        // Caso Lista Simple: Los datos son directamente el array
        else if (Array.isArray(extractedData)) {
            // Ya es el array. No es necesario hacer nada.
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
// 2. CARGA Y POBLACIÓN DE DATOS (NIVELES E INSTRUCTORES)
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
        // El endpoint de instructores devuelve un objeto paginado, apiFetch lo manejará.
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

// Poblar combobox de niveles
function populateLevelsCombo() {
    if (!comboLevelEl) return;
    
    comboLevelEl.innerHTML = '<option value="">Seleccione un nivel</option>';
    
    if (!levels || levels.length === 0) {
        comboLevelEl.innerHTML += '<option value="" disabled>No hay niveles disponibles</option>';
        return;
    }
    
    levels.forEach(level => {
        // CORRECCIÓN CLAVE: Usar level.id en lugar de level.levelId
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
// 3. LÓGICA DE MÓDULOS Y TABLA
// -----------------------------------------------------

// Cargar módulos con paginación
async function loadModules(page = 0) {
    try {
        const url = `${API_BASE_URL}/api/modules/getAllModules?page=${page}&size=${pageSize}`;
        const result = await apiFetch(url);
        
        modules = result.datos;
        currentPage = result.paginacion.number || 0;
        totalPages = result.paginacion.totalPages || 0;
        
        renderModulesTable();
        renderPagination();
    } catch (error) {
        console.error('Error al cargar módulos:', error);
        showMessage('Error al cargar módulos: ' + error.message, 'error');
    }
}

// Renderizar tabla de módulos (CORREGIDA)
function renderModulesTable() {
    if (!cuerpoTabla) return;
    cuerpoTabla.innerHTML = '';
    
    modules.forEach(module => {
        const row = document.createElement('tr');
        
        // Determinar el nombre del instructor de manera segura
        // El JSON del módulo tiene levelName (string) pero el instructor puede ser null,
        // o un objeto { instructorId, instructorName } o tener el nombre directo.
        const instructorName = module.instructor?.instructorName || 
                               (module.instructorName || 'N/A'); // Usar el campo instructorName del DTO si existe.

        row.innerHTML = `
            <td>${module.moduleCode || 'N/A'}</td>
            <td>${module.moduleName || 'N/A'}</td>
            <td>${module.levelName || 'N/A'}</td>
            
            <td>${instructorName}</td>
            
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

// El resto de tus funciones (handleFormSubmit, createModule, updateModule, editModule, deleteModule, etc.)
// pueden permanecer prácticamente iguales, ya que ahora dependen de los datos correctamente cargados
// y la tabla se renderiza con la corrección de columnas.

// -----------------------------------------------------
// 4. INICIALIZACIÓN Y EVENTOS
// -----------------------------------------------------

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM cargado, iniciando carga de datos...');
    // Carga los combos primero
    await loadLevels();
    await loadInstructors(); 
    // Luego carga la tabla de módulos
    await loadModules();
    setupEventListeners();
});

// Event Listeners (Tu código original)
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

// Exportar funciones para uso global (necesario para onclick en el HTML)
window.editModule = editModule;
window.deleteModule = deleteModule;
// El resto de funciones auxiliares (validateForm, resetForm, renderPagination, showMessage, debounce) 
// se mantienen igual que en tu código original.

// Implementación de editModule
function editModule(id) {
    const module = modules.find(m => m.moduleId === id);
    if (!module) {
        showMessage('Error: Módulo no encontrado', 'error');
        return;
    }
    
    // Asigna valores
    idModuloEl.value = module.moduleId;
    codigoModuloEl.value = module.moduleCode || '';
    nombreModuloEl.value = module.moduleName || '';
    if (descripcionModuloEl) {
        descripcionModuloEl.value = module.moduleDescription || '';
    }
    
    // Seleccionar el Level y el Instructor
    // NOTA: Para el comboLevel, usamos 'levelId' del módulo, pero el valor del combo es 'id' del nivel.
    // Esto funciona porque ambos son numéricamente iguales:
    if (module.levelId && comboLevelEl) {
        // levelId del módulo coincide con el ID del nivel
        comboLevelEl.value = String(module.levelId); 
    }
    if (module.instructorId && comboInstructorEl) {
        // instructorId del módulo coincide con el ID del instructor
        comboInstructorEl.value = String(module.instructorId);
    }
    
    // Cambiar el botón a modo edición
    if (botonEnviar) {
        botonEnviar.textContent = 'Actualizar';
        botonEnviar.className = 'btn btn-warning';
    }
    
    // Scroll al formulario
    if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth' });
    }
    
    showMessage('Módulo cargado para edición', 'success');
}