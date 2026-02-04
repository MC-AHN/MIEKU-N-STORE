console.log('Script for index.html in root');
let cart = [];
let allProducts = [];

async function load() {
    const res = await fetch('/api/products');
    const json = await res.json();
    allProducts = json.data;

    // Render whitout class css
    document.getElementById('products').innerHTML = allProducts.map(p => `
                    <div style='border: 1px solid #ccc; padding: 10px; margin-bottom:10px;'>
                        <img src="${p.imageUrl}" width="150" alt="${p.name}"><br>
                        <h3>${p.name}</h3>
                        <p>Price: Rp ${parseInt(p.price).toLocaleString()}</p>
                        <button onclick="add(${p.id})">Add (+)</button>    
                    </div>
                `).join('');
}

function add(id) {
    const exist = cart.find(c => c.productId === id);
    if (exist) exist.quantity++;
    else cart.push({ productId: id, quantity: 1 });
    updateCount();
}

function updateCount() {
    document.getElementById('cartCount').innerText = cart.reduce((a, b) => a + b.quantity, 0);
}

function toggleCart() {
    const m = document.getElementById('cartModal');
    // logika a simple toggle
    if (m.style.display === 'none') {
        m.style.display = 'block';
        renderCart();
    } else {
        m.style.display = 'none';
    }
}

function renderCart() {
    let grandTotal = 0;

    document.getElementById('cartItems').innerHTML = cart.map(c => {
        const p = allProducts.find(x => x.id === c.productId);
        const total = p.price * c.quantity;
        grandTotal += total;
        return `
                        <div>
                            ${p.name} (x${c.quantity}) - Rp ${(p.price * c.quantity).toLocaleString()}    
                        </div>
                    `;
    }).join('');

    document.getElementById('totalItems').innerText = grandTotal.toLocaleString();
}

async function checkout() {
    const name = document.getElementById('cName').value;
    const addr = document.getElementById('cAddr').value;
    if (!name || !addr || cart.length === 0) return alert('Please fill all fields and add items to cart.');

    const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, address: addr, items: cart })
    });

    const data = await res.json();

    if (data.success) {
        const msg = `Hello Admin, Order ID #${data.orderId}. Total: Rp ${data.total.toLocaleString()}. Shipping to: ${addr}`;

        //redirect to whatsapp
        window.location.href = `https://wa.me/6282130208960?text=${encodeURIComponent(msg)}`;
    }
}

load();
window.toggleCart = toggleCart;
window.checkout = checkout;
window.add = add;