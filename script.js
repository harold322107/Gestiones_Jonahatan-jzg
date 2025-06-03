// Inicialización y configuración
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tema
    initTheme();
    
    // Cargar datos almacenados o crear datos de ejemplo
    loadClients();
    
    // Actualizar alertas
    updateAlerts();
    
    // Configurar eventos
    setupEventListeners();
});

// Gestión del tema (claro/oscuro)
function initTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }
    
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Funciones para gestionar clientes
function loadClients() {
    let clients = getClientsFromStorage();
    
    // Si no hay clientes almacenados, crear algunos de ejemplo
    if (clients.length === 0) {
        clients = createSampleClients();
        saveClientsToStorage(clients);
    }
    
    renderClientsTable(clients);
}

function getClientsFromStorage() {
    const storedClients = localStorage.getItem('clients');
    return storedClients ? JSON.parse(storedClients) : [];
}

function saveClientsToStorage(clients) {
    localStorage.setItem('clients', JSON.stringify(clients));
}

function createSampleClients() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return [
        {
            id: generateId(),
            name: 'CR-001',
            identification: '1234567890',
            loanDate: '3001234567',
            amount: 'Juan Pérez López',
            installments: formatDate(tomorrow),
            installmentValue: 12,
            nextDueDate: 91666.67,
            status: 'pendiente'
        },
        {
            id: generateId(),
            name: 'CR-002',
            identification: '0987654321',
            loanDate: '3109876543',
            amount: 'María González Ruiz',
            installments: formatDate(today),
            installmentValue: 6,
            nextDueDate: 87500,
            status: 'retraso'
        },
        {
            id: generateId(),
            name: 'CR-003',
            identification: '5678901234',
            loanDate: '3205678901',
            amount: 'Carlos Rodríguez Gómez',
            installments: formatDate(nextWeek),
            installmentValue: 24,
            nextDueDate: 91666.67,
            status: 'cancelado'
        }
    ];
}

function renderClientsTable(clients) {
    const tableBody = document.getElementById('clients-list');
    const noResults = document.getElementById('no-results');
    
    tableBody.innerHTML = '';
    
    if (clients.length === 0) {
        tableBody.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Filtrar clientes con valores undefined o NaN
    clients = clients.filter(client => {
        // Verificar si el cliente tiene los campos requeridos
        return client && client.id && 
               typeof client.name !== 'undefined' && 
               typeof client.identification !== 'undefined' && 
               typeof client.loanDate !== 'undefined' && 
               typeof client.amount !== 'undefined' && 
               typeof client.installments !== 'undefined' && 
               typeof client.installmentValue !== 'undefined' && 
               typeof client.nextDueDate !== 'undefined' && 
               typeof client.status !== 'undefined';
    });
    
    clients.forEach(client => {
        const row = document.createElement('tr');
        
        // Verificar si el cliente está en retraso basado en la fecha actual
        const today = new Date();
        const dueDate = new Date(client.installments); // Ahora la fecha de vencimiento está en installments
        
        if (dueDate < today && client.status === 'pendiente') {
            client.status = 'retraso';
            // Actualizar en el almacenamiento
            updateClientStatus(client.id, 'retraso');
        }
        
        // Asegurar que todos los valores sean válidos
        const name = client.name || '-';
        const identification = client.identification || '-';
        const loanDate = client.loanDate || '-';
        const amount = client.amount || '-';
        const installments = client.installments ? formatDateForDisplay(client.installments) : '-';
        const installmentValue = client.installmentValue || '-';
        const nextDueDate = !isNaN(client.nextDueDate) ? formatCurrency(client.nextDueDate) : '-';
        const status = client.status || 'pendiente';
        
        row.innerHTML = `
            <td>${name}</td>
            <td>${identification}</td>
            <td>${loanDate}</td>
            <td>${amount}</td>
            <td>${installments}</td>
            <td>${installmentValue}</td>
            <td>${nextDueDate}</td>
            <td><span class="status-badge status-${status}">${getStatusText(status)}</span></td>
            <td class="actions-cell">
                <button class="action-btn edit-btn" data-id="${client.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${client.id}" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar eventos a los botones de acción
    addActionButtonsEvents();
}

function updateClientStatus(clientId, newStatus) {
    const clients = getClientsFromStorage();
    const updatedClients = clients.map(client => {
        if (client.id === clientId) {
            return { ...client, status: newStatus };
        }
        return client;
    });
    
    saveClientsToStorage(updatedClients);
}

function getStatusText(status) {
    switch (status) {
        case 'pendiente': return 'Pendiente';
        case 'retraso': return 'Retraso';
        case 'cancelado': return 'Cancelado';
        case 'mora': return 'Retraso'; // Para compatibilidad con datos antiguos
        case 'pagado': return 'Cancelado'; // Para compatibilidad con datos antiguos
        default: return status;
    }
}

function addActionButtonsEvents() {
    // Botones de editar
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const clientId = button.getAttribute('data-id');
            editClient(clientId);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const clientId = button.getAttribute('data-id');
            confirmDeleteClient(clientId);
        });
    });
}

function editClient(clientId) {
    const clients = getClientsFromStorage();
    const client = clients.find(c => c.id === clientId);
    
    if (!client) return;
    
    // Llenar el formulario con los datos del cliente
    document.getElementById('modal-title').textContent = 'Editar Cliente';
    document.getElementById('client-id').value = client.id;
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-identification').value = client.identification;
    document.getElementById('loan-date').value = client.loanDate;
    document.getElementById('loan-amount').value = client.amount;
    document.getElementById('total-installments').value = client.installmentValue;
    document.getElementById('installment-value').value = client.nextDueDate;
    document.getElementById('next-due-date').value = client.installments;
    document.getElementById('client-status').value = client.status;
    
    // Mostrar el modal
    openModal('client-modal');
}

function confirmDeleteClient(clientId) {
    const confirmModal = document.getElementById('confirm-modal');
    const confirmBtn = document.getElementById('confirm-action-btn');
    const confirmMessage = document.getElementById('confirm-message');
    
    // Configurar el mensaje
    confirmMessage.textContent = '¿Está seguro que desea eliminar este cliente?';
    
    // Configurar el botón de confirmación
    confirmBtn.onclick = () => {
        deleteClient(clientId);
        closeModal('confirm-modal');
    };
    
    // Mostrar el modal de confirmación
    openModal('confirm-modal');
}

function confirmDeleteUndefinedClients() {
    const confirmModal = document.getElementById('confirm-modal');
    const confirmBtn = document.getElementById('confirm-action-btn');
    const confirmMessage = document.getElementById('confirm-message');
    
    // Configurar el mensaje
    confirmMessage.textContent = '¿Está seguro que desea eliminar todos los registros con valores inválidos (undefined/NaN)?';
    
    // Configurar el botón de confirmación
    confirmBtn.onclick = () => {
        deleteClient('undefined'); // Pasamos 'undefined' como ID especial para eliminar registros inválidos
        closeModal('confirm-modal');
    };
    
    // Mostrar el modal de confirmación
    openModal('confirm-modal');
}

function deleteClient(clientId) {
    let clients = getClientsFromStorage();
    
    // Si el clientId es 'undefined', eliminar todos los clientes con valores undefined/NaN
    if (clientId === 'undefined') {
        clients = clients.filter(client => {
            return client && client.id && 
                   typeof client.name !== 'undefined' && 
                   typeof client.identification !== 'undefined' && 
                   typeof client.loanDate !== 'undefined' && 
                   typeof client.amount !== 'undefined' && 
                   typeof client.installments !== 'undefined' && 
                   typeof client.installmentValue !== 'undefined' && 
                   typeof client.nextDueDate !== 'undefined' && 
                   typeof client.status !== 'undefined' &&
                   !isNaN(client.nextDueDate);
        });
        
        saveClientsToStorage(clients);
        renderClientsTable(clients);
        updateAlerts();
        
        showToast('Clientes con valores inválidos eliminados correctamente', 'success');
        return;
    }
    
    // Eliminar cliente específico por ID
    const updatedClients = clients.filter(client => client.id !== clientId);
    
    saveClientsToStorage(updatedClients);
    renderClientsTable(updatedClients);
    updateAlerts();
    
    showToast('Cliente eliminado correctamente', 'success');
}

// Funciones para el formulario de cliente
function setupEventListeners() {
    // Botón para agregar nuevo cliente
    document.getElementById('add-client-btn').addEventListener('click', () => {
        resetClientForm();
        openModal('client-modal');
    });
    
    // Botón para eliminar registros inválidos
    document.getElementById('remove-undefined-btn').addEventListener('click', () => {
        confirmDeleteUndefinedClients();
    });
    
    // Formulario de cliente
    document.getElementById('client-form').addEventListener('submit', handleClientFormSubmit);
    
    // Botón cancelar del formulario
    document.getElementById('cancel-btn').addEventListener('click', () => {
        closeModal('client-modal');
    });
    
    // Botón cancelar de confirmación
    document.getElementById('cancel-confirm-btn').addEventListener('click', () => {
        closeModal('confirm-modal');
    });
    
    // Botones para cerrar modales
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Filtros y búsqueda
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('date-filter').addEventListener('change', applyFilters);
    
    // Ordenamiento de columnas
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            sortTable(column);
        });
    });
    
    // Ya no necesitamos calcular automáticamente el valor de la cuota
    // document.getElementById('loan-amount').addEventListener('input', calculateInstallmentValue);
    // document.getElementById('total-installments').addEventListener('input', calculateInstallmentValue);
}

function resetClientForm() {
    document.getElementById('modal-title').textContent = 'Nuevo Cliente';
    document.getElementById('client-form').reset();
    document.getElementById('client-id').value = '';
    
    // Establecer número de celular vacío
    document.getElementById('loan-date').value = '';
    
    // Establecer fecha de vencimiento como un mes después
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('next-due-date').value = formatDate(nextMonth);
    
    // Establecer estado como pendiente por defecto
    document.getElementById('client-status').value = 'pendiente';
}

function handleClientFormSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('client-id').value;
    const isNewClient = !clientId;
    
    const clientData = {
        id: isNewClient ? generateId() : clientId,
        name: document.getElementById('client-name').value,
        identification: document.getElementById('client-identification').value,
        loanDate: document.getElementById('loan-date').value,
        amount: document.getElementById('loan-amount').value,
        installments: document.getElementById('next-due-date').value,
        installmentValue: document.getElementById('total-installments').value,
        nextDueDate: parseFloat(document.getElementById('installment-value').value),
        status: document.getElementById('client-status').value
    };
    
    const clients = getClientsFromStorage();
    
    if (isNewClient) {
        // Agregar nuevo cliente
        clients.push(clientData);
        showToast('Cliente agregado correctamente', 'success');
    } else {
        // Actualizar cliente existente
        const index = clients.findIndex(client => client.id === clientId);
        if (index !== -1) {
            clients[index] = clientData;
        }
        showToast('Cliente actualizado correctamente', 'success');
    }
    
    saveClientsToStorage(clients);
    renderClientsTable(clients);
    updateAlerts();
    closeModal('client-modal');
}

function calculateInstallmentValue() {
    // Ya no necesitamos calcular automáticamente el valor de la cuota
    // porque ahora el campo 'Valor de la Cuota' es un valor directo ingresado por el usuario
    // y no se calcula a partir del monto del préstamo y el número de cuotas
}

// Funciones para filtrar y ordenar
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    let clients = getClientsFromStorage();
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
        clients = clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm) || 
            client.identification.toLowerCase().includes(searchTerm) ||
            client.amount.toLowerCase().includes(searchTerm) ||
            client.loanDate.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por estado
    if (statusFilter && statusFilter !== 'todos') {
        clients = clients.filter(client => client.status === statusFilter);
    }
    
    // Filtrar por fecha
    if (dateFilter) {
        clients = clients.filter(client => new Date(client.installments) >= new Date(dateFilter));
    }
    
    renderClientsTable(clients);
}

let currentSortColumn = null;
let currentSortDirection = 'asc';

function sortTable(column) {
    const clients = getClientsFromStorage();
    
    // Cambiar dirección si es la misma columna
    if (column === currentSortColumn) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // Ordenar clientes
    clients.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];
        
        // Convertir fechas para comparación
        if (column === 'loanDate' || column === 'nextDueDate') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }
        
        // Convertir números para comparación
        if (column === 'amount' || column === 'installments' || column === 'installmentValue') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }
        
        if (valueA < valueB) return currentSortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderClientsTable(clients);
    
    // Actualizar indicadores visuales de ordenamiento
    updateSortIndicators(column, currentSortDirection);
}

function updateSortIndicators(column, direction) {
    const headers = document.querySelectorAll('th[data-sort]');
    
    headers.forEach(header => {
        const sortColumn = header.getAttribute('data-sort');
        const icon = header.querySelector('i');
        
        if (sortColumn === column) {
            icon.className = direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        } else {
            icon.className = 'fas fa-sort';
        }
    });
}

// Funciones para alertas
function updateAlerts() {
    const alertsContent = document.getElementById('alerts-content');
    const clients = getClientsFromStorage();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar la hora a 00:00:00
    
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    
    // Filtrar clientes que vencen en los próximos 2 días o están en mora
    const clientsWithAlerts = clients.filter(client => {
        if (!client.installments || client.status === 'cancelado') return false;
        
        // Incluir clientes en estado de retraso (mora)
        if (client.status === 'retraso') return true;
        
        const dueDate = new Date(client.installments);
        dueDate.setHours(0, 0, 0, 0); // Normalizar la hora a 00:00:00
        
        // Calcular la diferencia en días
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Mostrar alertas para hoy (0 días), mañana (1 día) y pasado mañana (2 días)
        return diffDays >= 0 && diffDays <= 2;
    });
    
    if (clientsWithAlerts.length === 0) {
        alertsContent.innerHTML = '<div class="no-alerts">No hay alertas de vencimiento próximo ni clientes en mora</div>';
        return;
    }
    
    alertsContent.innerHTML = '';
    
    clientsWithAlerts.forEach(client => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        
        let alertMessage = '';
        let alertClass = '';
        
        // Verificar si el cliente está en mora
        if (client.status === 'retraso') {
            alertMessage = 'En mora';
            alertClass = 'alert-overdue';
        } else {
            const dueDate = new Date(client.installments);
            dueDate.setHours(0, 0, 0, 0);
            
            // Calcular días exactos hasta el vencimiento
            const diffTime = dueDate.getTime() - today.getTime();
            const daysToExpire = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (daysToExpire === 0) {
                alertMessage = 'Vence hoy';
                alertClass = 'alert-today';
            } else if (daysToExpire === 1) {
                alertMessage = 'Vence mañana';
                alertClass = 'alert-tomorrow';
            } else if (daysToExpire === 2) {
                alertMessage = 'Vence en 2 días';
                alertClass = 'alert-soon';
            }
        }
        
        alertItem.classList.add(alertClass);
        
        alertItem.innerHTML = `
            <div class="alert-info">
                <span class="alert-name">${client.name} - ${client.amount}</span>
                <span class="alert-date">${alertMessage} - ${formatCurrency(client.nextDueDate)}</span>
            </div>
            <div class="alert-actions">
                <button class="view-client-btn" data-id="${client.id}">Ver detalles</button>
            </div>
        `;
        
        alertsContent.appendChild(alertItem);
    });
    
    // Agregar eventos a los botones de ver detalles
    document.querySelectorAll('.view-client-btn').forEach(button => {
        button.addEventListener('click', () => {
            const clientId = button.getAttribute('data-id');
            editClient(clientId);
        });
    });
}

// Funciones de utilidad
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function getDaysDifference(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Funciones para modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Funciones para notificaciones
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    // Configurar mensaje y tipo
    toastMessage.textContent = message;
    
    // Configurar icono según tipo
    toast.className = 'toast active';
    
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
        toast.classList.add('toast-success');
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-times-circle';
        toast.classList.add('toast-error');
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toast.classList.add('toast-warning');
    }
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.remove('active');
        toast.classList.remove('toast-success', 'toast-error', 'toast-warning');
    }, 3000);
}