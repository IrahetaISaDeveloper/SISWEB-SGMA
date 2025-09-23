// services/ReportesService.js

const fetchEstudiantes = async () => {
    try {
        const res = await fetch('https://sgma-66ec41075156.herokuapp.com/api/students/getDataStudents');
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            return data.data.content;
        } else if (data && Array.isArray(data.data)) {
            return data.data;
        }
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
    }
    return [];
};

const fetchInstructores = async () => {
    try {
        const res = await fetch('https://sgma-66ec41075156.herokuapp.com/api/instructors/getDataInstructors');
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            return data.data.content;
        } else if (data && Array.isArray(data.data)) {
            return data.data;
        }
    } catch (error) {
        console.error('Error al obtener instructores:', error);
    }
    return [];
};

const fetchVehiculos = async () => {
    try {
        const res = await fetch('https://sgma-66ec41075156.herokuapp.com/api/vehicles/getDataVehicles');
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data.content)) {
            return data.data.content;
        } else if (data && Array.isArray(data.data)) {
            return data.data;
        }
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
    }
    return [];
};

export { fetchEstudiantes, fetchInstructores, fetchVehiculos };