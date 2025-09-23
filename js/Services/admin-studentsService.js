// services/admin-studentsService.js

const API_BASE_URL = 'https://sgma-66ec41075156.herokuapp.com/api';

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

const fetchStudents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/getDataStudents`);
        if (!response.ok) throw new Error('Error al obtener estudiantes.');
        const data = await response.json();
        return data?.data?.content || [];
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        throw error;
    }
};

const fetchStudentById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/getStudentById/${id}`);
        if (!response.ok) throw new Error('Error al obtener estudiante.');
        const data = await response.json();
        return data?.data || {};
    } catch (error) {
        console.error('Error al cargar estudiante:', error);
        throw error;
    }
};

const addStudent = async (student) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/addNewStudent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });
        if (!response.ok) throw new Error('Error al agregar estudiante.');
        return await response.json();
    } catch (error) {
        console.error('Error al agregar estudiante:', error);
        throw error;
    }
};

const updateStudent = async (id, student) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/updateStudent/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });
        if (!response.ok) throw new Error('Error al actualizar estudiante.');
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        throw error;
    }
};

const deleteStudent = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/deleteStudent/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar estudiante.');
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        throw error;
    }
};

export {
    fetchLevels,
    fetchGrades,
    fetchStudents,
    fetchStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
};