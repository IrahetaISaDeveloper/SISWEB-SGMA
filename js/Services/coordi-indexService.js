// services/coordi-indexService.js

const fetchVehicles = async () => {
    try {
        const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/vehicles/getDataVehicles?page=0&size=50');
        if (!response.ok) {
            throw new Error('Error al obtener vehículos.');
        }
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            return data.data.content;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        throw error;
    }
};

const fetchStudents = async () => {
    try {
        const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/students/getDataStudents');
        if (!response.ok) {
            throw new Error('Error al obtener estudiantes.');
        }
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            return data.data.content;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        throw error;
    }
};

const fetchInstructors = async () => {
    try {
        const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/instructors/getDataInstructors');
        if (!response.ok) {
            throw new Error('Error al obtener instructores.');
        }
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            return data.data.content;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener instructores:', error);
        throw error;
    }
};

const fetchModules = async () => {
    try {
        const response = await fetch('https://sgma-66ec41075156.herokuapp.com/api/modules/getAllModules');
        if (!response.ok) {
            throw new Error('Error al obtener módulos.');
        }
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            return data.data.content;
        }
        return [];
    } catch (error) {
        console.error('Error al obtener módulos:', error);
        throw error;
    }
};

export { fetchVehicles, fetchStudents, fetchInstructors, fetchModules };