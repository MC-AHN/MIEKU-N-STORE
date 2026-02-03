const token = localStorage.getItem('token');
if (!token) {
    alert('You are not logged in!');
    window.location.href = '../login';
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('product').value;
    const description = document.getElementById('desc').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    const categoryId = document.getElementById('category').value;
    const imageFile = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('categoryId', categoryId);
    formData.append('image', imageFile);

    const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        alert('Product added successfully!');
        document.getElementById('productForm').reset();
    } else {
        alert('Failed to add product: ' + result.message);
    }
});
