let allVehicles = [];
let userRole = null;

// Import the auth service
import { me } from './service/authService.js';

// Obtiene información del usuario autenticado usando el servicio de auth
async function getUserInfo() {
    try {
        const userInfo = await me();
        console.log('User info received:', userInfo); // Debug log
        
        if (userInfo.authenticated && userInfo.instructor && userInfo.instructor.role) {
            userRole = userInfo.instructor.role;
            console.log('User role set to:', userRole); // Debug log
            handleSidebarVisibility();
            updateSidebarTitle();
            return userInfo.instructor;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return null;
    }
}

// Actualiza el título del sidebar según el rol
function updateSidebarTitle() {
    const sidebarTitle = document.getElementById('sidebar-title');
    if (sidebarTitle && userRole) {
        if (userRole === 'Animador') {
            sidebarTitle.textContent = 'Pendientes de Revisión';
        } else if (userRole === 'Coordinador') {
            sidebarTitle.textContent = 'En Revisión';
        }
    }
}

// Controla la visibilidad del sidebar según el rol
function handleSidebarVisibility() {
    const sidebar = document.querySelector('.panel-lateral');
    const mainContent = document.querySelector('.contenido-principal');
    const contenidoLayout = document.querySelector('.contenido-layout');
    
    console.log('Handling sidebar visibility for role:', userRole); // Debug log
    
    if (userRole === 'Docente') {
        if (sidebar) {
            sidebar.style.display = 'none';
            console.log('Sidebar hidden for Docente'); // Debug log
        }
        if (contenidoLayout) {
            contenidoLayout.style.gridTemplateColumns = '1fr';
        }
        if (mainContent) {
            mainContent.style.width = '100%';
            mainContent.style.maxWidth = '100%';
        }
    } else {
        if (sidebar) {
            sidebar.style.display = 'block';
            console.log('Sidebar shown for role:', userRole); // Debug log
        }
        if (contenidoLayout) {
            contenidoLayout.style.gridTemplateColumns = '';
        }
        if (mainContent) {
            mainContent.style.width = '';
            mainContent.style.maxWidth = '';
        }
    }
}

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
                    <button class="btn-accion" title="Ver detalles" onclick="showVehicleModal(${vehicle.vehicleId})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-accion" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion" title="Eliminar">
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
    
    console.log('Rendering sidebar for role:', userRole, 'with vehicles:', vehicles.length); // Debug log
    
    // Filtra vehículos según el rol del usuario
    let pendientes = [];
    if (userRole === 'Animador') {
        pendientes = vehicles.filter(v => v.idStatus === 1);
        console.log('Animador - vehicles with status 1:', pendientes.length); // Debug log
    } else if (userRole === 'Coordinador') {
        pendientes = vehicles.filter(v => v.idStatus === 2);
        console.log('Coordinador - vehicles with status 2:', pendientes.length); // Debug log
    }
    // Para 'Docente' no se muestran vehículos pendientes (sidebar oculto)
    
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

let selectedVehicleId = null;

window.showVehicleModal = function(vehicleId) {
    const modal = document.getElementById('modalVehiculo');
    modal.classList.add('activo'); // Use class instead of style.display
    selectedVehicleId = vehicleId;
    const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);
    const tabVehiculo = document.getElementById('tab-vehiculo');
    if (vehicle && tabVehiculo) {
        const imageSrc = vehicle.vehicleImage && vehicle.vehicleImage !== 'null' ? vehicle.vehicleImage : 'imgs/default-car.png';
        tabVehiculo.innerHTML = `
            <div class="modal-vehiculo-imagen-container">
                <h4>Imagen del Vehículo</h4>
                <img src="${imageSrc}" class="modal-vehiculo-imagen" alt="Imagen del vehículo">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;">
                <div>
                    <div style="margin-bottom:12px;"><strong>Placa:</strong> ${vehicle.plateNumber || '-'}</div>
                    <div style="margin-bottom:12px;"><strong>Marca:</strong> ${vehicle.brand || '-'}</div>
                    <div style="margin-bottom:12px;"><strong>Modelo:</strong> ${vehicle.model || '-'}</div>
                    <div style="margin-bottom:12px;"><strong>Tipo:</strong> ${vehicle.typeName || '-'}</div>
                </div>
                <div>
                    <div style="margin-bottom:12px;"><strong>Estado:</strong> ${vehicle.idStatus != null ? vehicle.idStatus : '-'}</div>
                    <div style="margin-bottom:12px;"><strong>Estudiante:</strong> ${(vehicle.studentName || '-') + ' ' + (vehicle.studentLastName || '')}</div>
                    <div style="margin-bottom:12px;"><strong>Propietario:</strong> ${vehicle.ownerName || '-'}</div>
                    <div style="margin-bottom:12px;"><strong>Tel. Propietario:</strong> ${vehicle.ownerPhone || '-'}</div>
                </div>
            </div>
        `;
    } else if (tabVehiculo) {
        tabVehiculo.innerHTML = '<div style="color:#888;text-align:center;">No se encontraron datos del vehículo.</div>';
    }
}

// Evento para el botón Aprobar
const btnAprobar = document.querySelector('.btn-modal.primario');
if (btnAprobar) {
    btnAprobar.addEventListener('click', function() {
        if (selectedVehicleId && userRole) {
            // Determina el nuevo estado según el rol del usuario
            let newStatusValue;
            if (userRole === 'Animador') {
                newStatusValue = 2;
            } else if (userRole === 'Coordinador') {
                newStatusValue = 3;
            } else {
                // Si no es Animador ni Coordinador, no debería poder aprobar
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin permisos',
                        text: 'No tienes permisos para aprobar vehículos.'
                    });
                } else {
                    alert('No tienes permisos para aprobar vehículos');
                }
                return;
            }

            console.log(`Updating vehicle ${selectedVehicleId} to status ${newStatusValue} for role ${userRole}`);

            fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/updateStatusVehicle/${selectedVehicleId}?newStatus=${newStatusValue}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                // Mostrar SweetAlert de éxito
                const successMessage = userRole === 'Animador' 
                    ? 'El vehículo ha sido enviado a revisión del coordinador.' 
                    : 'El vehículo ha sido aprobado completamente.';
                
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Aprobado',
                        text: successMessage
                    });
                } else {
                    alert(successMessage);
                }
                document.getElementById('modalVehiculo').style.display = 'none';
                fetchAllVehicles();
            })
            .catch(err => {
                console.error('Error al aprobar vehículo:', err);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo aprobar el vehículo.'
                    });
                } else {
                    alert('Error al aprobar vehículo');
                }
            });
        }
    });
}

document.querySelector('.btn-cerrar-modal').addEventListener('click', function() {
    const modal = document.getElementById('modalVehiculo');
    modal.classList.remove('activo'); // Use class instead of style.display
});

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, getting user info...'); // Debug log
    await getUserInfo();
    console.log('User info obtained, fetching vehicles...'); // Debug log
    fetchAllVehicles();
});