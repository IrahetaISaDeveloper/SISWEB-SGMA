// controllers/admin-modulesController.js
import { fetchLevels, fetchModules, addModule, updateModule, deleteModule } from '../Services/admin-modulesService.js';

let modulos = [];
let levels = [];

const cargarLevels = async () => {
    try {
        levels = await fetchLevels();
        const comboLevelEl = document.getElementById('comboLevel');
        comboLevelEl.innerHTML = '';
        levels.forEach(level => {
            const opcion = document.createElement('option');
            opcion.value = level.id;
            opcion.textContent = level.levelName;
            comboLevelEl.appendChild(opcion);
        });
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los niveles.', 'error');
    }
};

const cargarModulos = async () => {
    try {
        modulos = await fetchModules();
        cargarTabla(modulos);
    } catch (error) {
        const cuerpoTabla = document.getElementById('cuerpo-tabla-modulos');
        cuerpoTabla.innerHTML = `<tr><td colspan="4" style="text-align: center;">No se pudieron cargar los módulos.</td></tr>`;
    }
};

const cargarTabla = (modulosACargar) => {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-modulos');
    cuerpoTabla.innerHTML = '';
    modulosACargar.forEach(modulo => {
        cuerpoTabla.innerHTML += `
            <tr>
                <td>${modulo.moduleName}</td>
                <td>${modulo.description}</td>
                <td>${modulo.levelName}</td>
                <td>
                    <button onclick="cargarParaEditarModulo('${modulo.moduleId}')">Editar</button>
                    <button onclick="borrarModulo('${modulo.moduleId}')">Eliminar</button>
                </td>
            </tr>
        `;
    });
};

const cargarParaEditarModulo = (id) => {
    const modulo = modulos.find(m => m.moduleId === id);
    if (!modulo) return;

    document.getElementById('nombreModulo').value = modulo.moduleName || '';
    document.getElementById('descripcionModulo').value = modulo.description || '';
    document.getElementById('comboLevel').value = modulo.levelId || '';
    document.getElementById('idModulo').value = modulo.moduleId || '';
    document.getElementById('btn-enviar').textContent = 'Actualizar Módulo';
    document.getElementById('btn-cancelar').hidden = false;
};

const borrarModulo = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el módulo de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
        try {
            await deleteModule(id);
            Swal.fire('¡Eliminado!', 'El módulo ha sido eliminado.', 'success');
            cargarModulos();
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar el módulo.', 'error');
        }
    }
};

const manejarFormulario = async (evento) => {
    evento.preventDefault();

    const nombreModulo = document.getElementById('nombreModulo').value.trim();
    const descripcionModulo = document.getElementById('descripcionModulo').value.trim();
    const levelId = document.getElementById('comboLevel').value;
    const idModulo = document.getElementById('idModulo').value;

    if (!nombreModulo || !descripcionModulo || !levelId) {
        Swal.fire('Error', 'Por favor, completa todos los campos obligatorios.', 'error');
        return;
    }

    const modulo = { moduleName: nombreModulo, description: descripcionModulo, levelId };

    try {
        if (idModulo) {
            await updateModule(idModulo, modulo);
            Swal.fire('¡Actualizado!', 'El módulo ha sido actualizado con éxito.', 'success');
        } else {
            await addModule(modulo);
            Swal.fire('¡Agregado!', 'El módulo ha sido agregado con éxito.', 'success');
        }
        cargarModulos();
        document.getElementById('formulario-modulo').reset();
        document.getElementById('btn-enviar').textContent = 'Agregar Módulo';
        document.getElementById('btn-cancelar').hidden = true;
    } catch (error) {
        Swal.fire('Error', 'No se pudo guardar el módulo.', 'error');
    }
};

const initAdminModulesController = async () => {
    await cargarLevels();
    await cargarModulos();

    document.getElementById('formulario-modulo').addEventListener('submit', manejarFormulario);
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        document.getElementById('formulario-modulo').reset();
        document.getElementById('btn-enviar').textContent = 'Agregar Módulo';
        document.getElementById('btn-cancelar').hidden = true;
    });

    document.getElementById('buscador-modulos').addEventListener('input', (e) => {
        const texto = e.target.value.trim().toLowerCase();
        const modulosFiltrados = modulos.filter(m =>
            m.moduleName.toLowerCase().includes(texto) ||
            m.description.toLowerCase().includes(texto)
        );
        cargarTabla(modulosFiltrados);
    });

    document.getElementById('filtro-ano-modulo').addEventListener('change', (e) => {
        const levelId = e.target.value;
        const modulosFiltrados = levelId
            ? modulos.filter(m => String(m.levelId) === levelId)
            : modulos;
        cargarTabla(modulosFiltrados);
    });
};

export { initAdminModulesController };