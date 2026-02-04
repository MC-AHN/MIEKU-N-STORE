console.log('Script for index.html in root');
let cart = [];
let allProducts = [];

async function load() {
    const res = await fetch('/api/products');
    const json = await res.json();
    allProducts = json.data;

    // Render whitout class css
    document.getElementById('products').innerHTML = allProducts.map(p => `
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <div class="aspect-square w-full bg-gray-100">
            <img src="${p.imageUrl}" class="w-full h-full object-cover" alt="${p.name}">
        </div>
        
        <div class="p-5 flex flex-col flex-1">
            <h3 class="font-bold text-gray-800 text-lg mb-1">${p.name}</h3>
            <p class="text-blue-600 font-bold mb-4">Rp ${parseInt(p.price).toLocaleString()}</p>
            
            <button onclick="add(${p.id})" class="mt-auto w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                Add (+)
            </button>
        </div>
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