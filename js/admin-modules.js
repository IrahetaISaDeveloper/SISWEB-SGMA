const MODULES_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/modules';
const LEVELS_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/levels/getAllLevels';
const INSTRUCTORS_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/instructors/getAllInstructors';

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

let modulos = [];
let levels = [];
let instructors = [];
let modulosFiltrados = [];

async function cargarLevels() {
    try {
        const res = await fetch(LEVELS_API_URL, {
            credentials: 'include'
        });
        const data = await res.json();
        console.log('Levels data:', data); // Debug log
        
        // Extract the levels array from the response structure
        if (data.success && data.data) {
            levels = Array.isArray(data.data) ? data.data : [];
        } else {
            levels = [];
        }
        
        // Populate main form combobox
        comboLevelEl.innerHTML = '<option value="">Seleccionar año académico...</option>';
        
        // Populate filter dropdown
        filtroAnoModuloEl.innerHTML = '<option value="">Todos los años</option>';
        
        levels.forEach(level => {
            const levelId = level.levelId || level.id;
            const levelName = level.levelName;
            
            // Main form option
            const opcionForm = document.createElement('option');
            opcionForm.value = levelId;
            opcionForm.textContent = levelName;
            comboLevelEl.appendChild(opcionForm);
            
            // Filter option
            const opcionFilter = document.createElement('option');
            opcionFilter.value = levelId;
            opcionFilter.textContent = levelName;
            filtroAnoModuloEl.appendChild(opcionFilter);
        });
    } catch (error) {
        console.error('Error loading levels:', error);
        levels = [];
    }
}

async function cargarInstructors() {
    try {
        const res = await fetch(INSTRUCTORS_API_URL, {
            credentials: 'include'
        });
        const data = await res.json();
        console.log('Instructors data:', data); // Debug log
        
        // Extract the instructors array from the response structure
        if (data.success && data.data) {
            // Check if data.data is an array or has a nested structure
            if (Array.isArray(data.data)) {
                instructors = data.data;
            } else if (data.data.content && Array.isArray(data.data.content)) {
                instructors = data.data.content;
            } else if (typeof data.data === 'object') {
                // If data.data is an object, it might contain the array in a property
                const possibleArrays = Object.values(data.data).filter(val => Array.isArray(val));
                instructors = possibleArrays.length > 0 ? possibleArrays[0] : [];
            } else {
                instructors = [];
            }
        } else {
            instructors = [];
        }
        
        console.log('Processed instructors:', instructors); // Debug log
        
        comboInstructorEl.innerHTML = '<option value="">Seleccionar instructor...</option>';
        instructors.forEach(instructor => {
            const opcion = document.createElement('option');
            opcion.value = instructor.instructorId;
            opcion.textContent = `${instructor.firstName} ${instructor.lastName}`;
            comboInstructorEl.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error loading instructors:', error);
        instructors = [];
    }
}

async function cargarModulos() {
    try {
        const res = await fetch(`${MODULES_API_URL}/getAllModules`, {
            credentials: 'include'
        });
        const data = await res.json();
        console.log('Modules data:', data); // Debug log
        
        // Extract the modules array from the response structure
        if (data.success && data.data) {
            if (Array.isArray(data.data)) {
                modulos = data.data;
            } else if (data.data.content && Array.isArray(data.data.content)) {
                modulos = data.data.content;
            } else if (typeof data.data === 'object') {
                // If data.data is an object, it might contain the array in a property
                const possibleArrays = Object.values(data.data).filter(val => Array.isArray(val));
                modulos = possibleArrays.length > 0 ? possibleArrays[0] : [];
            } else {
                modulos = [];
            }
        } else {
            modulos = [];
        }
        
        console.log('Processed modules:', modulos); // Debug log
        cargarTabla(modulos);
    } catch (error) {
        console.error('Error loading modules:', error);
        modulos = [];
        cuerpoTabla.innerHTML = `<tr><td colspan="6" style="text-align: center;">No se pudieron cargar los módulos.</td></tr>`;
    }
}

function cargarTabla(modulosACargar) {
    cuerpoTabla.innerHTML = '';
    if (!modulosACargar || modulosACargar.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay módulos registrados.</td></tr>`;
        return;
    }
    
    // Ensure instructors array is available before using find
    if (!Array.isArray(instructors)) {
        console.warn('Instructors array not properly loaded, using empty array');
        instructors = [];
    }
    
    modulosACargar.forEach(modulo => {
        // Fix instructor name lookup with proper error handling
        const instructor = instructors.find(i => i.instructorId === modulo.instructorId);
        const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Sin asignar';
        
        cuerpoTabla.innerHTML += `
        <tr>
            <td>${modulo.moduleId}</td>
            <td>${modulo.moduleCode || 'N/A'}</td>
            <td>${modulo.moduleName}</td>
            <td>${modulo.levelName}</td>
            <td>${instructorName}</td>
            <td>
                <button onclick="cargarParaEditarModulo('${modulo.moduleId}')">Editar</button>
                <button onclick="borrarModulo('${modulo.moduleId}')">Eliminar</button>
            </td>
        </tr>
        `;
    });
}

function cargarParaEditarModulo(id) {
    const moduloAEditar = modulos.find(modulo => String(modulo.moduleId) === String(id));
    if (moduloAEditar) {
        nombreModuloEl.value = moduloAEditar.moduleName;
        codigoModuloEl.value = moduloAEditar.moduleCode || '';
        idModuloEl.value = moduloAEditar.moduleId;
        comboLevelEl.value = moduloAEditar.levelId;
        comboInstructorEl.value = moduloAEditar.instructorId;

        botonEnviar.textContent = 'Actualizar Módulo';
        botonCancelar.hidden = false;
    } else {
        Swal.fire({
            title: 'Error',
            text: 'Módulo no encontrado para editar.',
            icon: 'error',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                htmlContainer: 'swal-custom-content',
                confirmButton: 'swal-custom-confirm-button'
            }
        });
    }
}

function aplicarFiltrosYBuscador() {
    let lista = modulos.slice();

    const levelId = filtroAnoModuloEl.value;
    if (levelId && levelId !== '') {
        lista = lista.filter(m => String(m.levelId) === levelId);
    }

    const texto = buscadorModulosEl.value.trim().toLowerCase();
    if (texto) {
        lista = lista.filter(m =>
            (m.moduleName && m.moduleName.toLowerCase().includes(texto)) ||
            (m.levelName && m.levelName.toLowerCase().includes(texto)) ||
            (m.moduleCode && m.moduleCode.toLowerCase().includes(texto))
        );
    }

    cargarTabla(lista);
}

window.addEventListener('DOMContentLoaded', async () => {
    console.log('Loading data...'); // Debug log
    await cargarLevels();
    await cargarInstructors();
    await cargarModulos();
    console.log('Data loaded - Levels:', levels.length, 'Instructors:', Array.isArray(instructors) ? instructors.length : 'not array', 'Modules:', modulos.length); // Debug log

    buscadorModulosEl.addEventListener('input', aplicarFiltrosYBuscador);
    filtroAnoModuloEl.addEventListener('change', aplicarFiltrosYBuscador);
});

formulario.addEventListener('submit', async e => {
    e.preventDefault();

    const nombre = nombreModuloEl.value.trim();
    const codigo = codigoModuloEl.value.trim();
    const id = idModuloEl.value;
    const levelId = comboLevelEl.value;
    const instructorId = comboInstructorEl.value;

    if (!nombre) {
        Swal.fire({
            title: 'Error',
            text: 'El nombre del módulo es obligatorio.',
            icon: 'error',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                htmlContainer: 'swal-custom-content',
                confirmButton: 'swal-custom-confirm-button'
            }
        });
        return;
    }
    if (!codigo) {
        Swal.fire({
            title: 'Error',
            text: 'El código del módulo es obligatorio.',
            icon: 'error',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                htmlContainer: 'swal-custom-content',
                confirmButton: 'swal-custom-confirm-button'
            }
        });
        return;
    }
    if (!levelId) {
        Swal.fire({
            title: 'Error',
            text: 'Debes seleccionar un año académico.',
            icon: 'error',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                htmlContainer: 'swal-custom-content',
                confirmButton: 'swal-custom-confirm-button'
            }
        });
        return;
    }
    if (!instructorId) {
        Swal.fire({
            title: 'Error',
            text: 'Debes seleccionar un instructor.',
            icon: 'error',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                htmlContainer: 'swal-custom-content',
                confirmButton: 'swal-custom-confirm-button'
            }
        });
        return;
    }

    if (id) {
        try {
            const response = await fetch(`${MODULES_API_URL}/updateModule/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    moduleId: id,
                    moduleCode: codigo,
                    moduleName: nombre,
                    levelId: Number(levelId),
                    instructorId: Number(instructorId)
                })
            });

            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = { message: await response.text() };
            }
            
            console.log('Update response:', response.status, responseData);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes permisos para realizar esta acción. Verifica tu sesión.');
                }
                throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`);
            }

            await Swal.fire({
                title: 'Éxito',
                text: 'Módulo actualizado correctamente.',
                icon: 'success',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    htmlContainer: 'swal-custom-content',
                    confirmButton: 'swal-custom-confirm-button'
                }
            });
        } catch (error) {
            console.error('Error updating module:', error);
            await Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo actualizar el módulo.',
                icon: 'error',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    htmlContainer: 'swal-custom-content',
                    confirmButton: 'swal-custom-confirm-button'
                }
            });
        }
    } else {
        try {
            const requestBody = {
                moduleCode: codigo,
                moduleName: nombre,
                levelId: Number(levelId),
                instructorId: Number(instructorId)
            };
            console.log('Creating module with data:', requestBody);

            const response = await fetch(`${MODULES_API_URL}/newModule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const textResponse = await response.text();
                responseData = { message: textResponse || 'Error desconocido' };
            }
            
            console.log('Create response:', response.status, responseData);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes permisos para realizar esta acción. Verifica tu sesión.');
                } else if (response.status === 401) {
                    throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                }
                throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`);
            }

            await Swal.fire({
                title: 'Éxito',
                text: 'Módulo agregado correctamente.',
                icon: 'success',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    htmlContainer: 'swal-custom-content',
                    confirmButton: 'swal-custom-confirm-button'
                }
            });
        } catch (error) {
            console.error('Error creating module:', error);
            await Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo agregar el módulo.',
                icon: 'error',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    htmlContainer: 'swal-custom-content',
                    confirmButton: 'swal-custom-confirm-button'
                }
            });
        }
    }

    formulario.reset();
    idModuloEl.value = '';
    botonCancelar.hidden = true;
    botonEnviar.textContent = 'Agregar Módulo';
    await cargarModulos();
}
);

botonCancelar.addEventListener('click', () => {
    formulario.reset();
    idModuloEl.value = '';
    botonEnviar.textContent = 'Agregar Módulo';
    botonCancelar.hidden = true;
});

async function borrarModulo(id) {
    const resultado = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#881F1E',
        cancelButtonColor: '#555',
        confirmButtonText: 'Sí, eliminarlo!',
        cancelButtonText: 'Cancelar',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button',
            cancelButton: 'swal-custom-cancel-button'
        }
    });

    if (resultado.isConfirmed) {
        try {
            const response = await fetch(`${MODULES_API_URL}/deleteModule/${id}`, { 
                method: 'DELETE',
                credentials: 'include'
            });

            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const textResponse = await response.text();
                responseData = { message: textResponse || 'Error desconocido' };
            }
            
            console.log('Delete response:', response.status, responseData);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes permisos para realizar esta acción. Verifica tu sesión.');
                } else if (response.status === 401) {
                    throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                }
                throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`);
            }

            await cargarModulos();
            Swal.fire({
                title: '¡Eliminado!',
                text: 'El módulo ha sido eliminado.',
                icon: 'success',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    htmlContainer: 'swal-custom-content',
                    confirmButton: 'swal-custom-confirm-button'
                }
            });
        } catch (error) {
            console.error('Error deleting module:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo eliminar el módulo.',
                icon: 'error',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    htmlContainer: 'swal-custom-content',
                    confirmButton: 'swal-custom-confirm-button'
                }
            });
        }
    }
}