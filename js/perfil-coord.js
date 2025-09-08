// Helper para obtener el valor de una cookie por nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Carga los datos del perfil
async function cargarPerfil() {
    const token = getCookie('token');
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
        document.getElementById('nombreUsuario').textContent = instructor.names.toUpperCase();
        document.getElementById('rolUsuario').textContent = instructor.role;
        document.getElementById('emailUsuario').textContent = instructor.email;
        document.getElementById('nombreCompletoUsuario').textContent = `${instructor.names} ${instructor.lastNames}`;
        document.getElementById('anioImpartidoUsuario').textContent = instructor.level || '';
    } catch (error) {
        Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', cargarPerfil);