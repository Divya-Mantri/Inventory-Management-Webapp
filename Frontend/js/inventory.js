document.addEventListener("DOMContentLoaded", function() {
    // Form Validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Search Bar Functioning
    function filterItems() {
        let searchTerm = document.getElementById('searchInput').value.toLowerCase();
        let inventoryItems = document.querySelectorAll('#inventory-item tr');
        inventoryItems.forEach(function(item) {
            let itemName = item.querySelector('.item-name').textContent.toLowerCase();
            if (itemName.includes(searchTerm)) {
                item.style.display = 'table-row';
            } else {
                item.style.display = 'none';
            }
        });
    }

    document.getElementById('searchBtn').addEventListener('click', filterItems);
    document.getElementById('searchInput').addEventListener('input', filterItems);

    // Fetch Products
    async function fetchProducts() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }
        try {
            console.log('Fetching products...');
            const res = await fetch('http://localhost:5000/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to fetch products');
            }
            const products = await res.json();
            console.log('Products fetched:', products);
            const tbody = document.getElementById('inventory-item');
            tbody.innerHTML = '';
            products.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.id}</td>
                    <td class="item-name"><strong>${p.itemName}</strong></td>
                    <td>${p.description}</td>
                    <td>${p.category}</td>
                    <td>${p.quantity}</td>
                    <td>${p.price}</td>
                    <td><span class="badge ${p.quantity > 0 ? 'bg-success' : 'bg-danger'}">${p.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editItem(${p.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem(${p.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (err) {
            console.error('Fetch products error:', err);
            alert('Error fetching products: ' + err.message);
        }
    }

    // Add Item
    document.getElementById('addItemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!this.checkValidity()) {
            this.classList.add('was-validated');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }

        const data = {
            itemName: document.getElementById('itemName').value.trim(),
            description: document.getElementById('description').value.trim(),
            category: document.getElementById('category').value,
            quantity: parseInt(document.getElementById('quantity').value),
            price: parseFloat(document.getElementById('price').value)
        };

        try {
            console.log('Adding item:', data);
            const res = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to add item');
            }
            console.log('Item added');
            this.reset();
            this.classList.remove('was-validated');
            fetchProducts();
        } catch (err) {
            console.error('Add item error:', err);
            alert('Error: ' + err.message);
        }
    });

    // Edit Item
    window.editItem = async function(id) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in first');
                window.location.href = 'login.html';
                return;
            }
            console.log('Fetching item:', id);
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to fetch item');
            }
            const item = await res.json();
            console.log('Item fetched:', item);
            document.getElementById('editIndex').value = id;
            document.getElementById('editItemName').value = item.itemName || '';
            document.getElementById('editDescription').value = item.description || '';
            document.getElementById('editCategory').value = item.category || '';
            document.getElementById('editQuantity').value = item.quantity || 0;
            document.getElementById('editPrice').value = item.price || 0;
            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        } catch (err) {
            console.error('Edit item fetch error:', err);
            alert('Error: ' + err.message);
        }
    };

    document.getElementById('editItemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('editIndex').value);
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }
        const data = {
            itemName: document.getElementById('editItemName').value.trim(),
            description: document.getElementById('editDescription').value.trim(),
            category: document.getElementById('editCategory').value,
            quantity: parseInt(document.getElementById('editQuantity').value),
            price: parseFloat(document.getElementById('editPrice').value)
        };
        try {
            console.log('Updating item:', id, data);
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to update item');
            }
            const updatedItem = await res.json();
            console.log('Item updated:', updatedItem);
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            if (modal) modal.hide();
            this.reset();
            await fetchProducts();
            console.log('Table refreshed after edit');
        } catch (err) {
            console.error('Edit item error:', err);
            alert('Error updating item: ' + err.message);
        }
    });

    // Delete Item
    window.deleteItem = async function(id) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }
        try {
            console.log('Deleting item:', id);
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to delete item');
            }
            console.log('Item deleted');
            fetchProducts();
        } catch (err) {
            console.error('Delete item error:', err);
            alert('Error: ' + err.message);
        }
    };

    // Logout
    window.logout = function() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };

    // Initial Fetch
    fetchProducts();
});