// controllers/admin-studentsController.js
import {
    fetchLevels,
    fetchGrades,
    fetchStudents,
    fetchStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
} from '../Services/admin-studentsService.js';

let studentsOriginal = [];
let grades = [];

const cargarLevels = async () => {
    try {
        const levels = await fetchLevels();
        const filtroAnoEl = document.getElementById('filtro-ano');
        if (filtroAnoEl) {
            filtroAnoEl.innerHTML = '<option value="">Seleccione año</option>';
            levels.forEach(level => {
                filtroAnoEl.innerHTML += `<option value="${level.levelId}">${level.levelName}</option>`;
            });
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los niveles.', 'error');
    }
};

const cargarGrupos = async () => {
    try {
        grades = await fetchGrades();
        const filtroGrupoEl = document.getElementById('filtro-grupo');
        const idGradeEl = document.getElementById('idGrade');
        if (filtroGrupoEl) {
            filtroGrupoEl.innerHTML = '<option value="">Seleccione grupo</option>';
            grades.forEach(grade => {
                filtroGrupoEl.innerHTML += `<option value="${grade.gradeGroup}">${grade.gradeGroup}</option>`;
            });
        }
        if (idGradeEl) {
            idGradeEl.innerHTML = '<option value="">Seleccione grupo</option>';
            grades.forEach(grade => {
                idGradeEl.innerHTML += `<option value="${grade.gradeId}">Grupo ${grade.gradeGroup} - Nivel ${grade.levelId}</option>`;
            });
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los grupos.', 'error');
    }
};

const cargarEstudiantes = async () => {
    try {
        studentsOriginal = await fetchStudents();
        filtrarYMostrarEstudiantes();
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los estudiantes.', 'error');
    }
};

const filtrarYMostrarEstudiantes = () => {
    const filtroAnoEl = document.getElementById('filtro-ano');
    const filtroGrupoEl = document.getElementById('filtro-grupo');
    const buscadorUsuariosEl = document.getElementById('buscador-usuarios');

    let lista = studentsOriginal.slice();

    if (filtroAnoEl) {
        const levelId = filtroAnoEl.value;
        if (levelId) {
            lista = lista.filter(i => String(i.levelId) === levelId);
        }
    }

    if (filtroGrupoEl) {
        const grupo = filtroGrupoEl.value;
        if (grupo) {
            lista = lista.filter(i => String(i.gradeGroup) === grupo);
        }
    }

    if (buscadorUsuariosEl) {
        const texto = buscadorUsuariosEl.value.trim().toLowerCase();
        if (texto) {
            lista = lista.filter(i =>
                `${i.firstName} ${i.lastName}`.toLowerCase().includes(texto) ||
                (i.email && i.email.toLowerCase().includes(texto))
            );
        }
    }

    cargarTablaEstudiantes(lista);
};

const cargarTablaEstudiantes = (students) => {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    students.forEach(student => {
        tbody.innerHTML += `
            <tr>
                <td>${student.studentCard}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.gradeGroup}</td>
                <td>
                    <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
                        <button onclick="cargarParaEditarEstudiante('${student.studentId}')" class="edit" style="width:120px;">Editar</button>
                        <button onclick="borrarEstudiante('${student.studentId}')" class="delete" style="width:120px;">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    });
};

const cargarParaEditarEstudiante = async (id) => {
    try {
        const student = await fetchStudentById(id);
        document.getElementById('fullName').value = student.firstName || '';
        document.getElementById('apellidos').value = student.lastName || '';
        document.getElementById('studentCard').value = student.studentCard || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('idGrade').value = student.gradeId || '';
        document.getElementById('userId').value = student.studentId || '';
        document.getElementById('btn-submit').textContent = 'Actualizar Estudiante';
        document.getElementById('btn-cancel').hidden = false;
    } catch (error) {
        Swal.fire('Error', 'No se pudo cargar el estudiante para editar.', 'error');
    }
};

const borrarEstudiante = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el estudiante de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
        try {
            await deleteStudent(id);
            Swal.fire('¡Eliminado!', 'El estudiante ha sido eliminado.', 'success');
            cargarEstudiantes();
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar el estudiante.', 'error');
        }
    }
};

const initAdminStudentsController = async () => {
    await cargarLevels();
    await cargarGrupos();
    await cargarEstudiantes();

    document.getElementById('filtro-ano').addEventListener('change', filtrarYMostrarEstudiantes);
    document.getElementById('filtro-grupo').addEventListener('change', filtrarYMostrarEstudiantes);
    document.getElementById('buscador-usuarios').addEventListener('input', filtrarYMostrarEstudiantes);
};

export { initAdminStudentsController };