document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password-input');
    const togglePassword = document.getElementById('toggle-password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const eyeIcon = this.querySelector('i'); // Get the <i> element within the span
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
        loginButton.addEventListener('click', async function() {
            const usernameInput = document.getElementById('username-input');

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
                
                const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/instructorAuth/instructorLogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // Importante para que la cookie authToken se guarde
                    body: JSON.stringify({ email, password })
                });

                // El backend debe enviar la cookie authToken si las credenciales son correctas
                if (response.ok) {
                    // Puedes mostrar mensaje de éxito o redirigir
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
                    text: 'No se pudo conectar con el servidor. Intenta más tarde.',
                });
            }
        });
    } else {
        console.error("Error: Botón de inicio de sesión no encontrado.");
    }

    const vehicleTrackingButton = document.getElementById('vehicle-tracking-btn');
    if (vehicleTrackingButton) {
        vehicleTrackingButton.addEventListener('click', function() {
            window.location.href = 'auth-seguimiento.html';
        });
    }

    // Ejemplo: consulta autenticada usando la cookie creada por el backend
    async function obtenerDatosInstructor() {
        try {
            const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/instructorAuth/meInstructor', {
                method: 'GET',
                credentials: 'include', // La cookie authToken se envía automáticamente
            });
            const data = await response.json();
            if (data.authenticated) {
                // Procesa los datos del instructor
                console.log('Datos del instructor:', data.instructor);
            } else {
                console.log('No autenticado');
            }
        } catch (error) {
            console.error('Error obteniendo datos del instructor:', error);
        }
    }

    // Llama a la función para obtener los datos del instructor después de iniciar sesión
    // obtenerDatosInstructor();
});