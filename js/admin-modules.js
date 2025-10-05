const MODULES_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/modules';
const LEVELS_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/levels/getAllLevels';

const formulario = document.getElementById('formulario-modulo');
const nombreModuloEl = document.getElementById('nombreModulo');
const descripcionModuloEl = document.getElementById('descripcionModulo');
const idModuloEl = document.getElementById('idModulo');
const comboLevelEl = document.getElementById('comboLevel');
const botonCancelar = document.getElementById('btn-cancelar');
const botonEnviar = document.getElementById('btn-enviar');
const cuerpoTabla = document.getElementById('cuerpo-tabla-modulos');
const buscadorModulosEl = document.getElementById('buscador-modulos');
const filtroAnoModuloEl = document.getElementById('filtro-ano-modulo');

let modulos = [];
let levels = [];
let modulosFiltrados = [];

async function cargarLevels() {
    try {
        const res = await fetch(LEVELS_API_URL, {
            credentials: 'include'
        });
        const data = await res.json();
        levels = Array.isArray(data) ? data : (data.data || []);
        comboLevelEl.innerHTML = '';
        levels.forEach(level => {
            const opcion = document.createElement('option');
            opcion.value = level.id;
            opcion.textContent = level.levelName;
            comboLevelEl.appendChild(opcion);
        });
    } catch (error) {}
}

async function cargarModulos() {
    try {
        const res = await fetch(`${MODULES_API_URL}/getAllModules`, {
            credentials: 'include'
        });
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            modulos = data.data.content;
        } else {
            modulos = [];
        }
        cargarTabla(modulos);
    } catch (error) {
        cuerpoTabla.innerHTML = `<tr><td colspan="4" style="text-align: center;">No se pudieron cargar los módulos.</td></tr>`;
    }
}

function cargarTabla(modulosACargar) {
    cuerpoTabla.innerHTML = '';
    if (!modulosACargar || modulosACargar.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="4" style="text-align: center;">No hay módulos registrados.</td></tr>`;
        return;
    }
    modulosACargar.forEach(modulo => {
        cuerpoTabla.innerHTML += `
        <tr>
            <td>${modulo.moduleId}</td>
            <td>${modulo.moduleName}</td>
            <td>${modulo.levelName}</td>
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
        idModuloEl.value = moduloAEditar.moduleId;
        comboLevelEl.value = moduloAEditar.levelId;

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
            (m.levelName && m.levelName.toLowerCase().includes(texto))
        );
    }

    cargarTabla(lista);
}

window.addEventListener('DOMContentLoaded', async () => {
    await cargarLevels();
    await cargarModulos();

    buscadorModulosEl.addEventListener('input', aplicarFiltrosYBuscador);
    filtroAnoModuloEl.addEventListener('change', aplicarFiltrosYBuscador);
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
            await fetch(`${MODULES_API_URL}/deleteModule/${id}`, { 
                method: 'DELETE',
                credentials: 'include'
            });
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
        } catch {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el módulo.',
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

botonCancelar.addEventListener('click', () => {
    formulario.reset();
    idModuloEl.value = '';
    botonEnviar.textContent = 'Agregar Módulo';
    botonCancelar.hidden = true;
});

formulario.addEventListener('submit', async e => {
    e.preventDefault();

    const nombre = nombreModuloEl.value.trim();
    const id = idModuloEl.value;
    const levelId = comboLevelEl.value;

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

    if (id) {
        try {
            await fetch(`${MODULES_API_URL}/updateModule/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    moduleId: id,
                    moduleName: nombre,
                    levelId: Number(levelId)
                })
            });
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
        } catch {
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el módulo.',
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
            await fetch(`${MODULES_API_URL}/newModule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    moduleName: nombre,
                    levelId: Number(levelId)
                })
            });
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
        } catch {
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo agregar el módulo.',
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