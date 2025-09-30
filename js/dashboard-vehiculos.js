let allVehicles = [];

// Renderiza la tabla de vehículos
function renderVehiclesTable(vehicles) {
    allVehicles = vehicles;
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
        const estudiante = (vehicle.studentName || '-') + ' ' + (vehicle.studentLastName || '');
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

// Renderiza vehículos pendientes en la tarjeta-sidebar
function renderSidebarPendingVehicles(vehicles) {
    const lista = document.querySelector('.tarjeta-sidebar .lista-registros');
    const badge = document.querySelector('.tarjeta-sidebar .badge-contador');
    if (!lista) return;
    const pendientes = vehicles.filter(v => v.idStatus === 1);
    if (badge) badge.textContent = pendientes.length;
    lista.innerHTML = '';
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
        // Abrir modal al hacer clic en el div, excepto si se hace clic en el botón de opciones
        div.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-opciones')) {
                showVehicleModal(vehicle.vehicleId);
            }
        });
        lista.appendChild(div);
    });
}

// Obtiene todos los vehículos
function fetchAllVehicles() {
    fetch('https://sgma-66ec41075156.herokuapp.com/api/vehicles/getAllVehicles', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        let vehicles = [];
        if (data && data.data && Array.isArray(data.data.content)) {
            vehicles = data.data.content;
        }
        renderVehiclesTable(vehicles);
        renderSidebarPendingVehicles(vehicles);
    })
    .catch(err => {
        console.error('Error al obtener vehículos:', err);
        renderVehiclesTable([]);
        renderSidebarPendingVehicles([]);
    });
}

// Buscador por placa
document.getElementById('buscarRegistro').addEventListener('input', function(e) {
    const plate = e.target.value.trim();
    if (plate.length === 0) {
        fetchAllVehicles();
        return;
    }
    
    fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/plate/${plate}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
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

window.showVehicleModal = function(vehicleId) {
    document.getElementById('modalVehiculo').style.display = 'block';
    const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);
    const tabVehiculo = document.getElementById('tab-vehiculo');
    if (vehicle && tabVehiculo) {
        tabVehiculo.innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
                <img src="${vehicle.vehicleImage && vehicle.vehicleImage !== 'null' ? vehicle.vehicleImage : 'imgs/default-car.png'}" style="width:80px;height:80px;border-radius:8px;border:1px solid #ccc;object-fit:cover;" alt="Imagen">
                <div>
                    <div><strong>Placa:</strong> ${vehicle.plateNumber || '-'}</div>
                    <div><strong>Marca:</strong> ${vehicle.brand || '-'}</div>
                    <div><strong>Modelo:</strong> ${vehicle.model || '-'}</div>
                    <div><strong>Tipo:</strong> ${vehicle.typeName || '-'}</div>
                    <div><strong>Estado:</strong> ${vehicle.idStatus != null ? vehicle.idStatus : '-'}</div>
                    <div><strong>Estudiante:</strong> ${(vehicle.studentName || '-') + ' ' + (vehicle.studentLastName || '')}</div>
                    <div><strong>Propietario:</strong> ${vehicle.ownerName || '-'}</div>
                    <div><strong>Tel. Propietario:</strong> ${vehicle.ownerPhone || '-'}</div>
                </div>
            </div>
        `;
    } else if (tabVehiculo) {
        tabVehiculo.innerHTML = '<div style="color:#888;text-align:center;">No se encontraron datos del vehículo.</div>';
    }
}

document.querySelector('.btn-cerrar-modal').addEventListener('click', function() {
    document.getElementById('modalVehiculo').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', fetchAllVehicles);