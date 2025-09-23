// services/perfil-coordService.js

// Helper para obtener el valor de una cookie por nombre
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Servicio para obtener los datos del perfil del instructor
const fetchPerfilInstructor = async (token) => {
    try {
        const response = await fetch('/api/meInstructor', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos del perfil.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('No se pudo conectar con el servidor.');
    }
};

export { getCookie, fetchPerfilInstructor };