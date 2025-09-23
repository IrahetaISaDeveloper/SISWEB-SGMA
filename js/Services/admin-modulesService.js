// services/admin-modulesService.js

const MODULES_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/modules';
const LEVELS_API_URL = 'https://sgma-66ec41075156.herokuapp.com/api/levels/getDataLevels';

const fetchLevels = async () => {
    try {
        const response = await fetch(LEVELS_API_URL);
        if (!response.ok) throw new Error('Error al obtener niveles.');
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
        console.error('Error al cargar niveles:', error);
        throw error;
    }
};

const fetchModules = async () => {
    try {
        const response = await fetch(`${MODULES_API_URL}/getAllModules`);
        if (!response.ok) throw new Error('Error al obtener módulos.');
        const data = await response.json();
        return data?.data?.content || [];
    } catch (error) {
        console.error('Error al cargar módulos:', error);
        throw error;
    }
};

const addModule = async (module) => {
    try {
        const response = await fetch(`${MODULES_API_URL}/addNewModule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(module),
        });
        if (!response.ok) throw new Error('Error al agregar módulo.');
        return await response.json();
    } catch (error) {
        console.error('Error al agregar módulo:', error);
        throw error;
    }
};

const updateModule = async (id, module) => {
    try {
        const response = await fetch(`${MODULES_API_URL}/updateModule/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(module),
        });
        if (!response.ok) throw new Error('Error al actualizar módulo.');
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar módulo:', error);
        throw error;
    }
};

const deleteModule = async (id) => {
    try {
        const response = await fetch(`${MODULES_API_URL}/deleteModule/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar módulo.');
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar módulo:', error);
        throw error;
    }
};

export { fetchLevels, fetchModules, addModule, updateModule, deleteModule };