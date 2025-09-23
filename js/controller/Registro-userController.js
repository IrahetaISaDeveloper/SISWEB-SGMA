// controllers/Registro-userController.js
import { subirImagen, registrarUsuario } from '../Services/Registro-userService.js';

const cargarDatosUsuarioNav = () => {
    const nombreUsuarioNav = document.getElementById('nombre-usuario');
    const rolUsuarioNav = document.getElementById('rol-usuario');
    const detalleUsuarioNav = document.getElementById('detalle-usuario');
    const avatarUsuarioNav = document.getElementById('avatar-usuario');

    if (nombreUsuarioNav && rolUsuarioNav && detalleUsuarioNav && avatarUsuarioNav) {
        const usuarioSesion = JSON.parse(localStorage.getItem('usuarioSesion'));
        if (usuarioSesion) {
            nombreUsuarioNav.textContent = usuarioSesion.fullName ? usuarioSesion.fullName.toUpperCase() : 'USUARIO';
            if (usuarioSesion.tbRoleId === "2") {
                rolUsuarioNav.textContent = 'Maestro';
                detalleUsuarioNav.textContent = '';
            } else if (usuarioSesion.tbRoleId === "3") {
                rolUsuarioNav.textContent = 'Alumno';
                detalleUsuarioNav.textContent = usuarioSesion.grado ? usuarioSesion.grado.charAt(0).toUpperCase() + usuarioSesion.grado.slice(1) + ' Año' : '';
            }
            avatarUsuarioNav.src = usuarioSesion.fotoPerfil || 'placeholder-avatar.png';
        } else {
            nombreUsuarioNav.textContent = 'INVITADO';
            rolUsuarioNav.textContent = '';
            detalleUsuarioNav.textContent = '';
            avatarUsuarioNav.src = 'placeholder-avatar.png';
        }
    }
};

const handleRegistroUsuario = async (evento) => {
    evento.preventDefault();

    const formularioRegistro = document.getElementById('formulario-registro');
    const entradaNombres = document.getElementById('nombres');
    const entradaApellidos = document.getElementById('apellidos');
    const entradaCorreo = document.getElementById('correo');
    const errorCorreo = document.getElementById('error-correo');
    const entradaPassword = document.getElementById('password');
    const selectorNativoGrado = document.getElementById('grado');
    const entradaFotoPerfil = document.getElementById('fotoPerfil');
    const urlFotoPerfilInput = document.getElementById('urlFotoPerfil');

    errorCorreo.textContent = '';
    errorCorreo.style.display = 'none';

    const nombres = entradaNombres.value.trim();
    const apellidos = entradaApellidos.value.trim();
    const correo = entradaCorreo.value.trim();
    const password = entradaPassword.value.trim();

    let idRolTb;
    let grado = '';

    if (!nombres || !apellidos || !correo || !password) {
        Swal.fire('error', 'Error de Validación', 'Por favor, completa todos los campos obligatorios.');
        return;
    }

    const dominioPermitido = '@ricaldone.edu.sv';
    const patronMaestro = /^[a-zA-Z0-9.]+_[a-zA-Z0-9.]+@ricaldone\.edu\.sv$/;

    if (!correo.endsWith(dominioPermitido)) {
        errorCorreo.textContent = 'Correo no permitido, por favor utiliza un correo de ' + dominioPermitido;
        errorCorreo.style.display = 'block';
        Swal.fire('error', 'Correo Inválido', 'El correo electrónico debe terminar con ' + dominioPermitido + '.');
        return;
    }

    if (password.length < 6) {
        Swal.fire('error', 'Contraseña Inválida', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    if (patronMaestro.test(correo)) {
        idRolTb = "2";
    } else {
        idRolTb = "3";
        grado = selectorNativoGrado.value.trim();
        if (!grado) {
            Swal.fire('error', 'Error de Validación', 'Por favor, selecciona tu año.');
            return;
        }
    }

    let urlImagen = '';

    if (entradaFotoPerfil.files.length > 0) {
        try {
            urlImagen = await subirImagen(entradaFotoPerfil.files[0]);
            urlFotoPerfilInput.value = urlImagen;
        } catch (error) {
            Swal.fire('error', 'Error al Subir Imagen', error.message);
            return;
        }
    }

    const nuevoUsuario = {
        email: correo,
        password: password,
        fullName: `${nombres} ${apellidos}`,
        tbRoleId: idRolTb,
        fotoPerfil: urlImagen
    };

    if (idRolTb === "3") {
        nuevoUsuario.grado = grado;
    }

    try {
        const result = await registrarUsuario(nuevoUsuario);

        localStorage.setItem('usuarioSesion', JSON.stringify({
            email: nuevoUsuario.email,
            fullName: nuevoUsuario.fullName,
            tbRoleId: nuevoUsuario.tbRoleId,
            grado: nuevoUsuario.grado,
            fotoPerfil: nuevoUsuario.fotoPerfil
        }));
        cargarDatosUsuarioNav();

        Swal.fire('success', '¡Éxito!', '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', false, 2000)
            .then(() => {
                window.location.href = 'login.html';
            });
    } catch (error) {
        Swal.fire('error', 'Error al Crear Cuenta', error.message);
    }
};

const initRegistroController = () => {
    const formularioRegistro = document.getElementById('formulario-registro');
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', handleRegistroUsuario);
    }
    cargarDatosUsuarioNav();
};

export { initRegistroController };