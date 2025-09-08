// Helper para obtener token de autenticación de las cookies
function getAuthToken() {
    const match = document.cookie.match(/(^|;) *token=([^;]*)/);
    return match ? match[2] : null;
}

// Renderizar la tabla de vehículos
function renderVehiclesTable(vehicles) {
    const tbody = document.querySelector('.tabla-moderna tbody');
    if (!tbody) {
        console.error('No se encontró el tbody de la tabla de vehículos. Verifica que exista .tabla-moderna y su <tbody>.');
        return;
    }
    tbody.innerHTML = '';
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;">No se encontraron vehículos.</td></tr>`;
        return;
    }
    vehicles.forEach(vehicle => {
        // Concatenar nombre y apellido del estudiante
        const estudiante = (vehicle.studentName || '-') + ' ' + (vehicle.studentLastName || '');
        // Verificar imagen válida
        let imgSrc = vehicle.vehicleImage;
        if (!imgSrc || imgSrc === 'null' || imgSrc === null) {
            imgSrc = 'imgs/default-car.png';
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="checkbox-row">
            </td>
            <td>${vehicle.plateNumber || '-'}</td>
            <td>${vehicle.brand || '-'}</td>
            <td>${vehicle.model || '-'}</td>
            <td>${vehicle.typeName || '-'}</td>
            <td>${vehicle.idStatus != null ? vehicle.idStatus : '-'}</td>
            <td>${estudiante.trim() || '-'}</td>
            <td>${vehicle.ownerName || '-'}</td>
            <td>${vehicle.ownerPhone || '-'}</td>
            <td>
                <img src="${imgSrc}" alt="Imagen" class="vehiculo-img" style="width:40px;height:40px;border-radius:6px;border:1px solid #ccc;">
            </td>
            <td>
                <div class="acciones-vehiculo" style="display:flex;gap:8px;">
                    <button class="btn-opciones" title="Ver detalles" onclick="showVehicleModal(${vehicle.vehicleId})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-opciones" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-opciones" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Mostrar vehículos con estado = 1 en la tarjeta-sidebar
function renderSidebarPendingVehicles(vehicles) {
    const lista = document.querySelector('.tarjeta-sidebar .lista-registros');
    const badge = document.querySelector('.tarjeta-sidebar .badge-contador');
    if (!lista) return;
    const pendientes = vehicles.filter(v => v.idStatus === 1);
    if (badge) badge.textContent = pendientes.length;
    lista.innerHTML = ''; // Limpia la lista
    if (pendientes.length === 0) {
        lista.innerHTML = '<div style="text-align:center;color:#888;">No hay vehículos pendientes.</div>';
        return;
    }
    pendientes.forEach(vehicle => {
        const div = document.createElement('div');
        div.className = 'item-registro';
        div.innerHTML = `
            <div class="icono-vehiculo">
                <i class="fas fa-car"></i>
            </div>
            <div class="info-vehiculo">
                <span class="placa-vehiculo">${vehicle.plateNumber || '-'}</span>
                <span class="servicio-vehiculo">${vehicle.model || '-'}</span>
                <span class="fecha-vehiculo">${vehicle.brand || ''}</span>
            </div>
            <div class="acciones-vehiculo">
                <button class="btn-opciones" title="Más opciones">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
        lista.appendChild(div);
    });
}

// Obtener todos los vehículos
function fetchAllVehicles() {
    const token = getAuthToken();
    // Solicita hasta 50 vehículos (ajusta el size según lo permitido por la API)
    fetch('http://localhost:8080/api/vehicles/getDataVehicles?page=0&size=50', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log('Datos recibidos:', data); // Depuración
        let vehicles = [];
        if (data && data.data && Array.isArray(data.data.content)) {
            vehicles = data.data.content;
        }
        renderVehiclesTable(vehicles);
        renderSidebarPendingVehicles(vehicles); // <-- Mostrar en tarjeta-sidebar
    })
    .catch(err => {
        console.error('Error al obtener vehículos:', err);
        renderVehiclesTable([]);
        renderSidebarPendingVehicles([]); // Limpia la tarjeta-sidebar
    });
}

// Buscador por placa
document.getElementById('buscarRegistro').addEventListener('input', function(e) {
    const plate = e.target.value.trim();
    if (plate.length === 0) {
        fetchAllVehicles();
        return;
    }
    const token = getAuthToken();
    fetch(`http://localhost:8080/api/vehicles/plate/${plate}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        // Si la API retorna un array, úsalo directamente; si retorna un objeto, conviértelo en array
        let vehicles = [];
        if (Array.isArray(data)) {
            vehicles = data;
        } else if (data && data.data && Array.isArray(data.data.content)) {
            vehicles = data.data.content;
        } else if (data) {
            vehicles = [data];
        }
        renderVehiclesTable(vehicles);
    })
    .catch(err => {
        console.error('Error en búsqueda por placa:', err);
        renderVehiclesTable([]);
    });
});

// Mostrar modal de detalles (implementación básica)
window.showVehicleModal = function(vehicleId) {
    // Aquí puedes hacer fetch por ID si quieres mostrar más detalles
    // ...implementación opcional...
    document.getElementById('modalVehiculo').style.display = 'block';
}

// Cerrar modal
document.querySelector('.btn-cerrar-modal').addEventListener('click', function() {
    document.getElementById('modalVehiculo').style.display = 'none';
});

// Inicializar
document.addEventListener('DOMContentLoaded', fetchAllVehicles);