// controllers/admin-userController.js
import {
    fetchRoles,
    fetchLevels,
    fetchGrades,
    fetchInstructors,
    uploadImage,
    addInstructor,
    updateInstructor,
    deleteInstructor,
} from '../Services/admin-userService.js';

let instructoresOriginal = [];

const cargarRoles = async () => {
    try {
        const roles = await fetchRoles();
        const idRolEl = document.getElementById('idRol');
        idRolEl.innerHTML = '';
        roles.forEach(rol => {
            const opcion = document.createElement('option');
            opcion.value = rol.rolId;
            opcion.textContent = rol.rolName;
            idRolEl.appendChild(opcion);
        });
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
    }
};

const cargarLevels = async () => {
    try {
        const levels = await fetchLevels();
        const idLevelEl = document.getElementById('idLevel');
        idLevelEl.innerHTML = '';
        levels.forEach(level => {
            const opcion = document.createElement('option');
            opcion.value = level.levelId;
            opcion.textContent = level.levelName;
            idLevelEl.appendChild(opcion);
        });
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los niveles.', 'error');
    }
};

const cargarGrupos = async () => {
    try {
        const grades = await fetchGrades();
        const filtroGrupoEl = document.getElementById('filtro-grupo');
        filtroGrupoEl.innerHTML = '<option value="">Todos los grupos</option>';
        grades.forEach(grade => {
            const opcion = document.createElement('option');
            opcion.value = grade.gradeGroup;
            opcion.textContent = `Grupo ${grade.gradeGroup}`;
            filtroGrupoEl.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error al cargar grupos:', error);
    }
};

const cargarUsuarios = async () => {
    try {
        const instructores = await fetchInstructors();
        instructoresOriginal = instructores;
        filtrarYMostrarUsuarios();
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los instructores.', 'error');
    }
};

const filtrarYMostrarUsuarios = () => {
    const filtroAnoEl = document.getElementById('filtro-ano');
    const filtroGrupoEl = document.getElementById('filtro-grupo');
    const buscadorUsuariosEl = document.getElementById('buscador-usuarios');

    let lista = instructoresOriginal.slice();

    // Filtro por año
    const levelId = filtroAnoEl.value;
    if (levelId) {
        lista = lista.filter(i => String(i.levelId) === levelId);
    }

    // Filtro por grupo
    const grupo = filtroGrupoEl.value;
    if (grupo) {
        lista = lista.filter(i => String(i.gradeGroup) === grupo);
    }

    // Filtro por texto buscador
    const texto = buscadorUsuariosEl.value.trim().toLowerCase();
    if (texto) {
        lista = lista.filter(i =>
            `${i.firstName} ${i.lastName}`.toLowerCase().includes(texto) ||
            (i.email && i.email.toLowerCase().includes(texto))
        );
    }

    cargarTabla(lista);
};

const cargarTabla = (instructores) => {
    const cuerpoTablaUsuarios = document.getElementById('cuerpo-tabla-usuarios');
    cuerpoTablaUsuarios.innerHTML = '';
    instructores.forEach(instructor => {
        cuerpoTablaUsuarios.innerHTML += `
            <tr>
                <td><img src="${instructor.instructorImage || 'https://i.ibb.co/N6fL89pF/yo.jpg'}" alt="Foto de ${instructor.firstName} ${instructor.lastName}" class="miniatura-perfil" /></td>
                <td>${instructor.firstName} ${instructor.lastName}</td>
                <td>${instructor.email}</td>
                <td>${instructor.roleName}</td>
                <td>${instructor.levelName}</td>
                <td>
                    <div style="display:flex;gap:8px;">
                      <button onclick="cargarParaEditarUsuario('${instructor.instructorId}')">Editar</button>
                      <button onclick="borrarUsuario('${instructor.instructorId}')">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    });
};

const initAdminUserController = async () => {
    await cargarRoles();
    await cargarLevels();
    await cargarGrupos();
    await cargarUsuarios();

    document.getElementById('filtro-ano').addEventListener('change', filtrarYMostrarUsuarios);
    document.getElementById('filtro-grupo').addEventListener('change', filtrarYMostrarUsuarios);
    document.getElementById('buscador-usuarios').addEventListener('input', filtrarYMostrarUsuarios);
};

export { initAdminUserController };