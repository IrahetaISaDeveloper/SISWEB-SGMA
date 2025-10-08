import { me } from './service/authService.js';

// Helper para obtener el valor de una cookie por nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Carga los datos del perfil
async function cargarPerfil() {
    try {
        const data = await me();

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
        
        // Mapear campos adicionales si están disponibles en la respuesta
        if (instructor.phone) {
            document.getElementById('telefonoUsuario').textContent = instructor.phone;
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', cargarPerfil);