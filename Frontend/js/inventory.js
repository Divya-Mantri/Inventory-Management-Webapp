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

    // Add Item Functioning
    document.getElementById('addItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!this.checkValidity()) {
            this.classList.add('was-validated');
            return;
        }

        const itemName = document.getElementById('itemName').value.trim();
        const category = document.getElementById('category').value;
        const quantity = document.getElementById('quantity').value;
        const price = document.getElementById('price').value;

        const table = document.getElementById('inventory-item');
        const itemNo = table.querySelectorAll('tr').length + 1;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${itemNo}</td>
            <td class="item-name"><strong>${itemName}</strong></td>
            <td>${document.getElementById('description').value}</td>
            <td>${category}</td>
            <td>${quantity}</td>
            <td>${price}</td>
            <td><span class="badge ${quantity > 0 ? 'bg-success' : 'bg-danger'}">${quantity > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;

        table.appendChild(newRow);

        this.reset();
        this.classList.remove('was-validated');
    });

    // Reindex Table Function
    function reindexTable() {
        const rows = document.querySelectorAll('#inventory-item tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }

    // Delete Item Functionality
    document.getElementById('inventory-item').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-danger')) {
            const row = e.target.closest('tr');
            row.remove();
            reindexTable();
        }
    });

    // Edit Form Functionality
    document.getElementById("inventory-item").addEventListener("click", function(e) {
        if (e.target.classList.contains("btn-primary")) {
            const row = e.target.closest("tr");
            const cells = row.querySelectorAll("td");
            const allRows = document.querySelectorAll("#inventory-item tr");
            const index = Array.from(allRows).indexOf(row);

            document.getElementById("editIndex").value = index;
            document.getElementById("editItemName").value = cells[1].textContent.trim();
            document.getElementById("editDescription").value = cells[2].textContent.trim();
            document.getElementById("editCategory").value = cells[3].textContent.trim();
            document.getElementById("editQuantity").value = cells[4].textContent.trim();
            document.getElementById("editPrice").value = cells[5].textContent.trim();

            if (typeof bootstrap === 'undefined') {
                console.error('Bootstrap is not loaded.');
                return;
            }
            const editModal = new bootstrap.Modal(document.getElementById("editModal"));
            editModal.show();
        }
    });

    document.getElementById("editItemForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const index = parseInt(document.getElementById("editIndex").value);
        const rows = document.querySelectorAll("#inventory-item tr");
        const row = rows[index];
        const cells = row.querySelectorAll("td");

        cells[1].innerHTML = `<strong>${document.getElementById("editItemName").value}</strong>`;
        cells[2].textContent = document.getElementById("editDescription").value;
        cells[3].textContent = document.getElementById("editCategory").value;
        cells[4].textContent = document.getElementById("editQuantity").value;
        cells[5].textContent = document.getElementById("editPrice").value;

        const quantity = parseInt(document.getElementById("editQuantity").value);
        const statusCell = cells[6].querySelector(".badge");
        if (quantity <= 0) {
            statusCell.className = "badge bg-danger";
            statusCell.textContent = "Out of Stock";
        } else {
            statusCell.className = "badge bg-success";
            statusCell.textContent = "In Stock";
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        if (modal) {
            modal.hide();
        }

        this.reset();
    });
});