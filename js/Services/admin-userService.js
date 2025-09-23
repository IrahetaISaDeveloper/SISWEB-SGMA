// services/admin-userService.js

const API_BASE_URL = 'https://sgma-66ec41075156.herokuapp.com/api';

const fetchRoles = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/Roles/getAllRoles`);
        if (!response.ok) throw new Error('Error al obtener roles.');
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
        console.error('Error al cargar roles:', error);
        throw error;
    }
};

const fetchLevels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/levels/getDataLevels`);
        if (!response.ok) throw new Error('Error al obtener niveles.');
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
        console.error('Error al cargar niveles:', error);
        throw error;
    }
};

const fetchGrades = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/grades/getAllGrades`);
        if (!response.ok) throw new Error('Error al obtener grupos.');
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
        console.error('Error al cargar grupos:', error);
        throw error;
    }
};

const fetchInstructors = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/instructors/getDataInstructors`);
        if (!response.ok) throw new Error('Error al obtener instructores.');
        const data = await response.json();
        return data?.data?.content || [];
    } catch (error) {
        console.error('Error al cargar instructores:', error);
        throw error;
    }
};

const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'instructors');
    try {
        const response = await fetch(`${API_BASE_URL}/image/upload-to-folder`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (!data.url) throw new Error('No se pudo obtener la URL de la imagen.');
        return data.url;
    } catch (error) {
        console.error('Error al subir imagen:', error);
        throw error;
    }
};

const addInstructor = async (instructor) => {
    try {
        const response = await fetch(`${API_BASE_URL}/instructors/addNewInstructor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(instructor),
        });
        if (!response.ok) throw new Error('Error al agregar instructor.');
        return await response.json();
    } catch (error) {
        console.error('Error al agregar instructor:', error);
        throw error;
    }
};

const updateInstructor = async (id, instructor) => {
    try {
        const response = await fetch(`${API_BASE_URL}/instructors/updateInstructor/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(instructor),
        });
        if (!response.ok) throw new Error('Error al actualizar instructor.');
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar instructor:', error);
        throw error;
    }
};

const deleteInstructor = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/instructors/deleteInstructor/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar instructor.');
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar instructor:', error);
        throw error;
    }
};

export {
    fetchRoles,
    fetchLevels,
    fetchGrades,
    fetchInstructors,
    uploadImage,
    addInstructor,
    updateInstructor,
    deleteInstructor,
};