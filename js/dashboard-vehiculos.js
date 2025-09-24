function getAuthToken() {
    const match = document.cookie.match(/(^|;) *token=([^;]*)/);
    return match ? match[2] : null;
}

// Renderiza la tabla de vehículos
function renderVehiclesTable(vehicles) {
    // Guardar la lista globalmente
    window.__listaVehiculos = vehicles;
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
        div.__vehiculoData = vehicle; // Asocia el objeto vehículo al elemento
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

// Obtiene todos los vehículos
function fetchAllVehicles() {
    const token = getAuthToken();
    fetch('https://sgma-66ec41075156.herokuapp.com/api/vehicles/getDataVehicles?page=0&size=50', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        let vehicles = [];
        if (data && data.data && Array.isArray(data.data.content)) {
            vehicles = data.data.content;
        }
        window.__listaVehiculos = vehicles; // Actualiza la lista global
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
    const token = getAuthToken();
    fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/plate/${plate}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
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
        window.__listaVehiculos = vehicles; // Actualiza la lista global
        renderVehiclesTable(vehicles);
    })
    .catch(err => {
        console.error('Error en búsqueda por placa:', err);
        renderVehiclesTable([]);
    });
});

// Modificar showVehicleModal para llenar el modal
window.showVehicleModal = function(vehicleId) {
    let vehiculo = null;
    if (window.__listaVehiculos) {
        vehiculo = window.__listaVehiculos.find(v => v.vehicleId === vehicleId);
    }
    if (vehiculo) {
        llenarModalVehiculo(vehiculo);
    }
    const modalVehiculo = document.getElementById('modalVehiculo');
    if (modalVehiculo) {
        modalVehiculo.style.display = 'flex';
    }
}

// Función para llenar el modal con datos del vehículo
function llenarModalVehiculo(vehiculo) {
    window.vehiculoSeleccionado = vehiculo;
    const tabVehiculo = document.getElementById('tab-vehiculo');
    if (tabVehiculo) {
        tabVehiculo.innerHTML = `
            <ul style="list-style:none;padding:0;">
                <li><b>Placa:</b> ${vehiculo.plateNumber || '-'}</li>
                <li><b>Marca:</b> ${vehiculo.brand || '-'}</li>
                <li><b>Modelo:</b> ${vehiculo.model || '-'}</li>
                <li><b>Tipo:</b> ${vehiculo.typeName || '-'}</li>
                <li><b>Estado:</b> ${vehiculo.idStatus || '-'}</li>
                <li><b>Estudiante:</b> ${(vehiculo.studentName || '-') + ' ' + (vehiculo.studentLastName || '')}</li>
                <li><b>Propietario:</b> ${vehiculo.ownerName || '-'}</li>
                <li><b>Teléfono:</b> ${vehiculo.ownerPhone || '-'}</li>
                <li><b>N° Tarjeta Circulación:</b> ${vehiculo.circulationCardNumber || '-'}</li>
                <li><b>Color:</b> ${vehiculo.color || '-'}</li>
                <li><b>Imagen:</b> <img src="${vehiculo.vehicleImage || 'imgs/default-car.png'}" style="width:60px;height:60px;border-radius:6px;border:1px solid #ccc;"></li>
            </ul>
        `;
    }
}

// Listener global para abrir el modal al hacer click en un pendiente
document.body.addEventListener('click', function(e) {
    const itemRegistro = e.target.closest('.item-registro');
    const modalVehiculo = document.getElementById('modalVehiculo');
    if (itemRegistro && itemRegistro.__vehiculoData) {
        llenarModalVehiculo(itemRegistro.__vehiculoData);
        if (modalVehiculo) modalVehiculo.style.display = 'flex';
    }
    // ...existing code for .btn-opciones...
}, true);

// Aprobar vehículo desde el modal
const btnAprobar = document.querySelector('.btn-modal.primario');
if (btnAprobar) {
    btnAprobar.onclick = function() {
        if (!window.vehiculoSeleccionado) return;
        const token = getAuthToken();
        const modalVehiculo = document.getElementById('modalVehiculo');
        fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/updateStatus/${window.vehiculoSeleccionado.vehicleId}?newStatus=2`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            fetchAllVehicles();
            if (modalVehiculo) modalVehiculo.style.display = 'none';
        })
        .catch(err => {
            alert('Error al aprobar el vehículo');
        });
    }
}

document.querySelector('.btn-cerrar-modal').addEventListener('click', function() {
    document.getElementById('modalVehiculo').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', fetchAllVehicles);