// Helper para obtener el valor de una cookie por nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Función para cargar los datos del perfil
async function cargarPerfil() {
    const token = getCookie('token'); // Ajusta el nombre de la cookie si es diferente
    if (!token) {
        Swal.fire('Error', 'No autenticado. Por favor inicia sesión.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/meInstructor', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.authenticated) {
            Swal.fire('Error', 'No autenticado. Por favor inicia sesión.', 'error');
            return;
        }

        const instructor = data.instructor;
        // Actualiza los campos del perfil
        document.getElementById('nombreUsuario').textContent = instructor.names.toUpperCase();
        document.getElementById('rolUsuario').textContent = instructor.role;
        document.getElementById('emailUsuario').textContent = instructor.email;
        document.getElementById('nombreCompletoUsuario').textContent = `${instructor.names} ${instructor.lastNames}`;
        // Si tienes teléfono, año impartido y módulo asignado en el objeto instructor, actualízalos aquí
        // document.getElementById('telefonoUsuario').textContent = instructor.phone || '';
        // document.getElementById('anioImpartidoUsuario').textContent = instructor.level || '';
        // document.getElementById('moduloAsignadoUsuario').textContent = instructor.module || '';
        document.getElementById('anioImpartidoUsuario').textContent = instructor.level || '';
        // ...actualiza otros campos si existen en el objeto instructor...
    } catch (error) {
        Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
    }
}

// Ejecuta la carga del perfil al cargar la página
document.addEventListener('DOMContentLoaded', cargarPerfil);