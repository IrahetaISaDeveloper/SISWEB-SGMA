const STUDENTS_API_URL = 'http://localhost:8080/api/students/getDataStudents';
const ADD_STUDENT_API_URL = 'http://localhost:8080/api/students/addNewStudent';
const UPDATE_STUDENT_API_URL = 'http://localhost:8080/api/students/updateStudent/';
const DELETE_STUDENT_API_URL = 'http://localhost:8080/api/students/deleteStudent/';
const LEVELS_API_URL = 'http://localhost:8080/api/levels/getDataLevels';
const GRADES_API_URL = 'http://localhost:8080/api/grades/getAllGrades';

const form = document.getElementById('user-form');
const fullNameEl = document.getElementById('fullName');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const userIdEl = document.getElementById('userId');
const cancelBtn = document.getElementById('btn-cancel');
const submitBtn = document.getElementById('btn-submit');
const tbody = document.getElementById('users-tbody');
const filtroAnoEl = document.getElementById('filtro-ano');
const filtroGrupoEl = document.getElementById('filtro-grupo');
const buscadorUsuariosEl = document.getElementById('buscador-usuarios');
const idLevelEl = document.getElementById('idLevel');
const idGradeEl = document.getElementById('idGrade'); // Usar este para el grupo

let studentsOriginal = [];
let grades = [];

async function cargarLevels() {
  try {
    const res = await fetch(LEVELS_API_URL);
    const data = await res.json();
    const levels = Array.isArray(data) ? data : (data.data || []);
    if (filtroAnoEl) {
      filtroAnoEl.innerHTML = '<option value="">Seleccione año</option>';
      levels.forEach(level => {
        filtroAnoEl.innerHTML += `<option value="${level.levelId}">${level.levelName}</option>`;
      });
    }
  } catch (error) {
    console.error('Error al cargar niveles:', error);
  }
}

async function cargarGrupos() {
  try {
    const res = await fetch(GRADES_API_URL);
    const data = await res.json();
    grades = Array.isArray(data) ? data : (data.data || []);
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
    console.error('Error al cargar grupos:', error);
  }
}

async function cargarEstudiantes() {
  try {
    const res = await fetch(STUDENTS_API_URL);
    const data = await res.json();
    let students = [];
    if (data && data.data && Array.isArray(data.data.content)) {
      students = data.data.content;
    }
    studentsOriginal = students;
    filtrarYMostrarEstudiantes();
  } catch (error) {
    console.error('Error al cargar los estudiantes:', error);
    Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los estudiantes. Intenta de nuevo más tarde.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
  }
}

function filtrarYMostrarEstudiantes() {
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
}

function cargarTablaEstudiantes(students) {
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
}

window.addEventListener('DOMContentLoaded', async () => {
  await cargarLevels();
  await cargarGrupos();
  await cargarEstudiantes();
  if (filtroAnoEl) filtroAnoEl.addEventListener('change', filtrarYMostrarEstudiantes);
  if (filtroGrupoEl) filtroGrupoEl.addEventListener('change', filtrarYMostrarEstudiantes);
  if (buscadorUsuariosEl) buscadorUsuariosEl.addEventListener('input', filtrarYMostrarEstudiantes);
});

cancelBtn.addEventListener('click', () => {
  form.reset();
  userIdEl.value = '';
  cancelBtn.hidden = true;
  submitBtn.textContent = 'Agregar Estudiante';
  passwordEl.disabled = false;
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fullName = fullNameEl.value.trim();
  const email = emailEl.value.trim();
  let password = passwordEl.value.trim();
  const isEditing = !!userIdEl.value;
  const gradeId = idGradeEl ? idGradeEl.value : '';
  let lastName = '';
  if (document.getElementById('apellidos')) {
    lastName = document.getElementById('apellidos').value.trim();
  }
  let studentCard = '';
  if (document.getElementById('studentCard')) {
    studentCard = document.getElementById('studentCard').value.trim();
  }

  if (!studentCard || studentCard.length < 5) {
    Swal.fire({
        title: 'Error',
        text: 'El carnet debe tener al menos 5 caracteres.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
    return;
  }
  if (!fullName || fullName.length < 3) {
    Swal.fire({
        title: 'Error',
        text: 'El nombre debe tener al menos 3 caracteres.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
    return;
  }
  if (lastName !== undefined && lastName.length < 2) {
    Swal.fire({
        title: 'Error',
        text: 'El apellido debe tener al menos 2 caracteres.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    Swal.fire({
        title: 'Error',
        text: 'Por favor, introduce un formato de correo electrónico válido.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
    return;
  }
  if (!isEditing && (!password || password.length < 6)) {
    Swal.fire({
        title: 'Error',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
    return;
  }
  if (!gradeId) {
    Swal.fire({
        title: 'Error',
        text: 'Por favor, selecciona un grupo.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
    return;
  }

  const cargaUtil = {
    studentCard,
    firstName: fullName,
    lastName,
    email,
    gradeId: Number(gradeId)
  };
  if (!isEditing) {
    cargaUtil.password = password;
  }
  if (isEditing) {
    cargaUtil.studentId = Number(userIdEl.value);
  }

  try {
    if (isEditing) {
      await fetch(`${UPDATE_STUDENT_API_URL}${userIdEl.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargaUtil)
      });
      Swal.fire({
          title: '¡Actualizado!',
          text: 'Estudiante actualizado correctamente.',
          icon: 'success',
          customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              content: 'swal-custom-content',
              confirmButton: 'swal-custom-confirm-button'
          },
          buttonsStyling: false
      });
    } else {
      await fetch(ADD_STUDENT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargaUtil)
      });
      Swal.fire({
          title: '¡Agregado!',
          text: 'Estudiante agregado correctamente.',
          icon: 'success',
          customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              content: 'swal-custom-content',
              confirmButton: 'swal-custom-confirm-button'
          },
          buttonsStyling: false
      });
    }
  } catch (error) {
    console.error('Error al guardar estudiante:', error);
    Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el estudiante. Intenta de nuevo.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
  }

  form.reset();
  userIdEl.value = '';
  cancelBtn.hidden = true;
  submitBtn.textContent = 'Agregar Estudiante';
  passwordEl.disabled = false;
  cargarEstudiantes();
});

async function cargarParaEditarEstudiante(id) {
  try {
    const res = await fetch(`http://localhost:8080/api/students/getStudentById/${id}`);
    const result = await res.json();
    const student = result.data || {};
    fullNameEl.value = student.firstName || '';
    if (document.getElementById('apellidos')) {
      document.getElementById('apellidos').value = student.lastName || '';
    }
    if (document.getElementById('studentCard')) {
      document.getElementById('studentCard').value = student.studentCard || '';
    }
    emailEl.value = student.email || '';
    passwordEl.value = '';
    if (idGradeEl) {
      setTimeout(() => {
        idGradeEl.value = student.gradeId || '';
      }, 0);
    }
    userIdEl.value = student.studentId || '';
    submitBtn.textContent = 'Actualizar Estudiante';
    cancelBtn.hidden = false;
    passwordEl.disabled = false;
  } catch (error) {
    console.error('Error al cargar estudiante para editar:', error);
    Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el estudiante para editar.',
        icon: 'error',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
        },
        buttonsStyling: false
    });
  }
}

async function borrarEstudiante(id) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el estudiante de forma permanente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      content: 'swal-custom-content',
      confirmButton: 'swal-custom-confirm-button',
      cancelButton: 'swal-custom-cancel-button'
    }
  });
  if (result.isConfirmed) {
    try {
      const res = await fetch(`${DELETE_STUDENT_API_URL}${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        Swal.fire({
            title: '¡Eliminado!',
            text: 'El estudiante ha sido eliminado.',
            icon: 'success',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                content: 'swal-custom-content',
                confirmButton: 'swal-custom-confirm-button'
            },
            buttonsStyling: false
        });
        cargarEstudiantes();
      } else {
        throw new Error('No se pudo eliminar el estudiante');
      }
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el estudiante. Intenta de nuevo.',
          icon: 'error',
          customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              content: 'swal-custom-content',
              confirmButton: 'swal-custom-confirm-button'
          },
          buttonsStyling: false
      });
    }
  }
}