// controllers/perfil-coordController.js
import { getCookie, fetchPerfilInstructor } from '../Services/perfil-coordService.js';

const cargarPerfil = async () => {
    const token = getCookie('token');
    if (!token) {
        Swal.fire('Error', 'No autenticado. Por favor inicia sesión.', 'error');
        return;
    }

    try {
        const data = await fetchPerfilInstructor(token);

        if (!data.authenticated) {
            Swal.fire('Error', 'No autenticado. Por favor inicia sesión.', 'error');
            return;
        }

        const instructor = data.instructor;
        document.getElementById('nombreUsuario').textContent = instructor.names.toUpperCase();
        document.getElementById('rolUsuario').textContent = instructor.role;
        document.getElementById('emailUsuario').textContent = instructor.email;
        document.getElementById('nombreCompletoUsuario').textContent = `${instructor.names} ${instructor.lastNames}`;
        document.getElementById('anioImpartidoUsuario').textContent = instructor.level || '';
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
};

const initPerfilController = () => {
    document.addEventListener('DOMContentLoaded', cargarPerfil);
};

export { initPerfilController };