// services/Registro-userService.js

const subirImagen = async (archivoFoto) => {
    const datosFormulario = new FormData();
    datosFormulario.append('image', archivoFoto);

    const urlApiImagen = 'https://api.imgbb.com/1/upload?expiration=600&key=eaf6049b5324954d994475cb0c0a6156';

    try {
        const respuestaImagen = await fetch(urlApiImagen, {
            method: 'POST',
            body: datosFormulario,
        });

        if (respuestaImagen.ok) {
            const resultadoImagen = await respuestaImagen.json();
            return resultadoImagen.data.url;
        } else {
            const datosError = await respuestaImagen.json();
            throw new Error(datosError.message || 'Error al subir la imagen.');
        }
    } catch (error) {
        throw new Error('Error de conexión al subir la imagen.');
    }
};

const registrarUsuario = async (nuevoUsuario) => {
    try {
        const response = await fetch('https://685b5bb389952852c2d94520.mockapi.io/tbUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoUsuario),
        });

        if (response.ok) {
            return await response.json();
        } else {
            const datosError = await response.json();
            throw new Error(datosError.message || 'Error al crear la cuenta.');
        }
    } catch (error) {
        throw new Error('Error de conexión al intentar crear la cuenta.');
    }
};

export { subirImagen, registrarUsuario };