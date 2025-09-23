// controllers/loginController.js
import { login, obtenerDatosInstructor } from '../Services/loginService.js';

const handleLogin = async () => {
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');

    if (!usernameInput || !passwordInput) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Interfaz',
            text: 'Error en la interfaz. Por favor, recarga la página.',
        });
        return;
    }

    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validación de campos vacíos
    if (!email || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Vacíos',
            text: 'Por favor, ingresa tus credenciales completas (correo y contraseña).',
        });
        return;
    }

    // Validación de correo institucional
    if (!email.endsWith('@ricaldone.edu.sv')) {
        Swal.fire({
            icon: 'error',
            title: 'Correo inválido',
            text: 'Debes ingresar tu correo institucional (@ricaldone.edu.sv).',
        });
        return;
    }

    try {
        const response = await login(email, password);

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Bienvenido al sistema.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'coordi-index.html';
            });
        } else {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error de inicio de sesión',
                text: errorText.includes('Credenciales') ? 'Credenciales incorrectas.' : errorText,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: error.message,
        });
    }
};

const handleVehicleTrackingRedirect = () => {
    window.location.href = 'auth-seguimiento.html';
};

const initLoginController = () => {
    const loginButton = document.getElementById('login-btn');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password-input');
    const vehicleTrackingButton = document.getElementById('vehicle-tracking-btn');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const eyeIcon = this.querySelector('i');
            if (eyeIcon.classList.contains('fa-eye')) {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    } else {
        console.error("Error: Botón de inicio de sesión no encontrado.");
    }

    if (vehicleTrackingButton) {
        vehicleTrackingButton.addEventListener('click', handleVehicleTrackingRedirect);
    }
};

export { initLoginController };