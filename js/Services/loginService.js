// services/loginService.js

const login = async (email, password) => {
    try {
        const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/instructorAuth/instructorLogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Importante para que la cookie authToken se guarde
            body: JSON.stringify({ email, password })
        });

        return response;
    } catch (error) {
        throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
    }
};

const obtenerDatosInstructor = async () => {
    try {
        const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/instructorAuth/meInstructor', {
            method: 'GET',
            credentials: 'include', // La cookie authToken se envía automáticamente
        });

        return await response.json();
    } catch (error) {
        throw new Error('Error obteniendo datos del instructor.');
    }
};

export { login, obtenerDatosInstructor };