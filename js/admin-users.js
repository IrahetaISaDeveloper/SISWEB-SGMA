const ROLES_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/Roles/getAllRoles';
const INSTRUCTORS_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/instructors/getAllInstructors';
const LEVELS_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/levels/getAllLevels';
const GRADES_API_URL = 'hhttps://sgma-66ec41075156.herokuapp.com/api/grades/getAllGrades';
const ADD_INSTRUCTOR_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/instructors/newInstructor';
const UPDATE_INSTRUCTOR_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/instructors/updateInstructor/';

const formulario = document.getElementById('formulario-usuario');
const nombreCompletoEl = document.getElementById('nombreCompleto');
const correoEl = document.getElementById('correo');
const contrasenaEl = document.getElementById('contrasena');
const idRolEl = document.getElementById('idRol');
const idLevelEl = document.getElementById('idLevel');
const fotoPerfilArchivoEl = document.getElementById('fotoPerfil-archivo');
const urlFotoPerfilEl = document.getElementById('url-foto-perfil');
const previsualizacionFotoPerfilEl = document.getElementById('previsualizacion-foto-perfil');
const idUsuarioEl = document.getElementById('idUsuario');
const btnCancelar = document.getElementById('btn-cancelar');
const btnEnviar = document.getElementById('btn-enviar');
const cuerpoTablaUsuarios = document.getElementById('cuerpo-tabla-usuarios');
const filtroAnoEl = document.getElementById('filtro-ano');
const filtroGrupoEl = document.getElementById('filtro-grupo');
const buscadorUsuariosEl = document.getElementById('buscador-usuarios');

let roles = [];
let instructoresOriginal = [];
let grades = [];

async function cargarRoles() {
  try {
    const res = await fetch(ROLES_API_URL);
    const data = await res.json();
    roles = Array.isArray(data) ? data : (data.data || []);
    idRolEl.innerHTML = '';
    roles.forEach(rol => {
      const opcion = document.createElement('option');
      opcion.value = rol.rolId;
      opcion.textContent = rol.rolName;
      idRolEl.appendChild(opcion);
    });
  } catch (error) {
    console.error('Error al cargar los roles:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los roles. Intenta de nuevo más tarde.',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm-button'
      }
    });
  }
}

async function cargarLevels() {
  try {
    const res = await fetch(LEVELS_API_URL);
    const data = await res.json();
    const levels = Array.isArray(data) ? data : (data.data || []);
    idLevelEl.innerHTML = '';
    levels.forEach(level => {
      const opcion = document.createElement('option');
      opcion.value = level.levelId || level.id; // Asegura que el value sea el id numérico
      opcion.textContent = `${level.levelName} (${level.levelId || level.id})`; // Muestra nombre y id si quieres
      idLevelEl.appendChild(opcion);
    });
  } catch (error) {
    console.error('Error al cargar los niveles:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los niveles académicos. Intenta de nuevo más tarde.',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm-button'
      }
    });
  }
}

async function cargarGrupos() {
  try {
    const res = await fetch(GRADES_API_URL);
    const data = await res.json();
    grades = Array.isArray(data) ? data : (data.data || []);
    filtroGrupoEl.innerHTML = '<option value="">Todos los grupos</option>';
    grades.forEach(grade => {
      const opcion = document.createElement('option');
      opcion.value = grade.gradeGroup;
      opcion.textContent = `Grupo ${grade.gradeGroup}`;
      filtroGrupoEl.appendChild(opcion);
    });
  } catch (error) {
    console.error('Error al cargar los grupos:', error);
    // Puedes mostrar un mensaje si lo deseas
  }
}

async function cargarUsuarios() {
  try {
    const res = await fetch(INSTRUCTORS_API_URL);
    const data = await res.json();
    // Ajusta según la estructura real del JSON
    let instructores = [];
    if (data && data.data && Array.isArray(data.data.content)) {
      instructores = data.data.content;
    }
    instructoresOriginal = instructores; // Guarda la lista original para filtrar
    filtrarYMostrarUsuarios();
  } catch (error) {
    console.error('Error al cargar los instructores:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los instructores. Intenta de nuevo más tarde.',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm-button'
      }
    });
  }
}

function filtrarYMostrarUsuarios() {
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
}

function cargarTabla(instructores) {
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
}

window.addEventListener('DOMContentLoaded', async () => {
  await cargarRoles();
  await cargarLevels();
  await cargarGrupos();
  await cargarUsuarios();

  filtroAnoEl.addEventListener('change', filtrarYMostrarUsuarios);
  filtroGrupoEl.addEventListener('change', filtrarYMostrarUsuarios);
  buscadorUsuariosEl.addEventListener('input', filtrarYMostrarUsuarios);
});

fotoPerfilArchivoEl.addEventListener('change', function() {
  const archivo = this.files[0];
  if (archivo) {
    const lector = new FileReader();
    lector.onload = function(e) {
      previsualizacionFotoPerfilEl.src = e.target.result;
    };
    lector.readAsDataURL(archivo);
  } else {
    // If no file is selected, revert to the current stored URL or default
    previsualizacionFotoPerfilEl.src = urlFotoPerfilEl.value || 'https://i.ibb.co/N6fL89pF/yo.jpg';
  }
});

btnCancelar.addEventListener('click', () => {
  formulario.reset();
  idUsuarioEl.value = '';
  btnEnviar.textContent = 'Agregar Usuario';
  btnCancelar.hidden = true;
  fotoPerfilArchivoEl.value = ''; // Clear file input
  previsualizacionFotoPerfilEl.src = ''; // Clear image preview
  contrasenaEl.disabled = false;
  const contrasenaGroup = document.getElementById('contrasena').closest('.grupo-formulario');
  if (contrasenaGroup) contrasenaGroup.style.display = '';
});

async function subirImagen(archivo) {
  // Subida de imagen a Cloudinary usando el endpoint backend
  const fd = new FormData();
  fd.append('image', archivo);
  fd.append('folder', 'instructors');
  try {
    const res = await fetch('https://sgma-66ec41075156.herokuapp.com/api/image/upload-to-folder', {
      method: 'POST',
      body: fd
    });
    const obj = await res.json();
    if (obj.url) {
      return obj.url;
    } else {
      throw new Error('URL de imagen no encontrada en la respuesta de Cloudinary.');
    }
  } catch (error) {
    console.error('Error al subir imagen:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error de Subida',
      text: 'No se pudo subir la imagen. Intenta de nuevo.',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm-button'
      }
    });
    return null;
  }
}

formulario.addEventListener('submit', async e => {
  e.preventDefault();

  const firstName = nombreCompletoEl.value.trim();
  const lastName = document.getElementById('apellidos').value.trim();
  const email = correoEl.value.trim();
  let password = contrasenaEl.value.trim();
  const isEditing = !!idUsuarioEl.value;
  const roleId = idRolEl.value;
  const levelId = idLevelEl.value;

  // Validaciones frontend según DTO
  let errores = [];

  // firstName
  if (!firstName) {
    errores.push('El nombre es obligatorio.');
  } else {
    if (firstName.length < 5) errores.push('El nombre debe tener al menos 5 caracteres.');
    if (firstName.length > 50) errores.push('El nombre no puede exceder los 50 caracteres.');
  }

  // lastName
  if (!lastName) {
    errores.push('El apellido es obligatorio.');
  } else {
    if (lastName.length < 5) errores.push('El apellido debe tener al menos 5 caracteres.');
    if (lastName.length > 50) errores.push('El apellido no puede exceder los 50 caracteres.');
  }

  // email
  if (!email) {
    errores.push('El correo institucional es obligatorio.');
  } else {
    const emailRegex = /^[A-Za-z_]+@ricaldone\.edu\.sv$/;
    if (!emailRegex.test(email)) errores.push('Debe ser un correo institucional de instructor válido (ejemplo@ricaldone.edu.sv).');
  }

  // password (solo si no está editando)
  if (!isEditing) {
    if (!password) {
      errores.push('La contraseña es obligatoria.');
    } else {
      if (password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres.');
      if (password.length > 255) errores.push('La contraseña no puede exceder los 255 caracteres.');
    }
  }

  // levelId
  if (!levelId || isNaN(levelId) || Number(levelId) <= 0) {
    errores.push('Selecciona un año académico válido.');
  }

  // roleId
  if (!roleId || isNaN(roleId) || Number(roleId) <= 0) {
    errores.push('Selecciona un rol válido.');
  }

  // instructorImage (se valida después de la subida)
  let instructorImage = urlFotoPerfilEl.value;
  if (fotoPerfilArchivoEl.files.length > 0) {
    const nuevaUrlFoto = await subirImagen(fotoPerfilArchivoEl.files[0]);
    if (nuevaUrlFoto) {
      instructorImage = nuevaUrlFoto;
    } else {
      errores.push('No se pudo subir la imagen del instructor.');
    }
  } else if (!instructorImage) {
    instructorImage = 'https://i.ibb.co/N6fL89pF/yo.jpg';
  }
  if (!instructorImage) {
    errores.push('La imagen del instructor es obligatoria.');
  }

  // Si hay errores, muestra todos y no envía la solicitud
  if (errores.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Errores en el formulario',
      html: '<ul style="text-align:left;">' + errores.map(e => `<li>${e}</li>`).join('') + '</ul>',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm-button'
      }
    });
    return;
  }

  // Estructura para el registro/actualización de instructores
  const cargaUtil = {
    firstName,
    lastName,
    email,
    levelId: Number(levelId),
    roleId: Number(roleId),
    instructorImage
  };
  if (!isEditing) {
    cargaUtil.password = password;
  }
  if (isEditing) {
    cargaUtil.instructorId = Number(idUsuarioEl.value);
  }

  try {
    if (isEditing) {
      await fetch(`${UPDATE_INSTRUCTOR_API_URL}${idUsuarioEl.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargaUtil)
      });
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'El instructor ha sido actualizado correctamente.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content',
          confirmButton: 'swal-custom-confirm-button'
        }
      });
    } else {
      await fetch(ADD_INSTRUCTOR_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargaUtil)
      });
      Swal.fire({
        icon: 'success',
        title: '¡Agregado!',
        text: 'El instructor ha sido agregado correctamente.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content',
          confirmButton: 'swal-custom-confirm-button'
        }
      });
    }
  } catch (error) {
    console.error('Error al guardar instructor:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar el instructor. Intenta de nuevo.',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm-button'
      }
    });
  }

  formulario.reset();
  idUsuarioEl.value = '';
  btnCancelar.hidden = true;
  btnEnviar.textContent = 'Agregar Usuario';
  fotoPerfilArchivoEl.value = '';
  previsualizacionFotoPerfilEl.src = '';
  contrasenaEl.disabled = false;
  cargarUsuarios();
});

async function cargarParaEditarUsuario(id) {
  try {
    const res = await fetch(`https://sgma-66ec41075156.herokuapp.com/api/instructors/getInstructorById/${id}`);
    const result = await res.json();
    const instructor = result.data || {};

    nombreCompletoEl.value = instructor.firstName || '';
    document.getElementById('apellidos').value = instructor.lastName || '';
    correoEl.value = instructor.email || '';
    // Muestra el campo de contraseña y déjalo en blanco
    const contrasenaGroup = document.getElementById('contrasena').closest('.grupo-formulario');
    if (contrasenaGroup) contrasenaGroup.style.display = '';
    contrasenaEl.value = '';

    idRolEl.value = instructor.roleId || '';
    setTimeout(() => {
      idLevelEl.value = instructor.levelId || '';
    }, 0);

    urlFotoPerfilEl.value = instructor.instructorImage || '';
    previsualizacionFotoPerfilEl.src = instructor.instructorImage || 'https://i.ibb.co/N6fL89pF/yo.jpg';
    fotoPerfilArchivoEl.value = '';
    idUsuarioEl.value = instructor.instructorId || '';

    btnEnviar.textContent = 'Actualizar Usuario';
    btnCancelar.hidden = false;
  } catch (error) {
    console.error('Error al cargar usuario para editar:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar la información del usuario para editar.',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm-button'
      }
    });
  }
}

async function borrarUsuario(id) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el usuario de forma permanente.',
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
      const res = await fetch(`https://sgma-66ec41075156.herokuapp.com/api/instructors/deleteInstructor/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El instructor ha sido eliminado correctamente.',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content',
            confirmButton: 'swal-custom-confirm-button'
          }
        });
        cargarUsuarios();
      } else {
        throw new Error('No se pudo eliminar el instructor');
      }
    } catch (error) {
      console.error('Error al eliminar instructor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el instructor. Intenta de nuevo.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content',
          confirmButton: 'swal-custom-confirm-button'
        }
      });
    }
  }
}