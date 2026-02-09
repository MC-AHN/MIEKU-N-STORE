console.log('Script for index.html in root');
let cart = [];
let allProducts = [];

async function load() {
    const res = await fetch('/api/products');
    const json = await res.json();
    allProducts = json.data;

    // Render whitout class css
    document.getElementById('products').innerHTML = allProducts.map(p => {
    return `
    <div class="bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-[520px] w-full overflow-hidden">
        
        <div class="h-[65%] w-full overflow-hidden bg-slate-50">
            <img src="${p.imageUrl}" class="w-full h-full object-cover" alt="${p.name}">
        </div>
        
        <div class="p-5 flex flex-col h-[35%] bg-white">
            
            <h3 class="text-lg font-black text-slate-900 line-clamp-1 uppercase leading-tight mb-0.5">
                ${p.name}
            </h3>

            <p class="text-[11px] text-slate-400 italic line-clamp-2 leading-tight mb-3">
                ${p.desc || 'Premium Quality Product'}
            </p>

            <div class="mt-auto"> 
                <p class="text-xl font-black text-orange-600 mb-3">
                    Rp ${parseInt(p.price).toLocaleString()}
                </p>

                <button onclick="add(${p.id})" 
                    class="w-full bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-bold py-3.5 rounded-2xl transition-all uppercase tracking-widest active:scale-95">
                    Add to Cart
                </button>
            </div>

        </div>
    </div>
    `;
}).join('');
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
    if (m.style.display === 'none' || m.style.display === '') {
        // Alih-alih 'block', gunakan 'flex' agar aturan centering Tailwind bekerja
        m.style.display = 'flex'; 
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
            <div class="flex items-center gap-6 bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                <div class="w-24 h-24 flex-shrink-0">
                    <img src="${p.imageUrl}" class="w-full h-full object-cover rounded-2xl shadow-md" alt="${p.name}">
                </div>
                
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h3 class="font-black text-gray-800 text-xl leading-tight">${p.name}</h3>
                        <span class="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-black">x${c.quantity}</span>
                    </div>
                    <div class="flex justify-between items-end mt-4">
                        <p class="text-orange-600 font-black text-lg text-2xl">Rp ${p.price.toLocaleString()}</p>
                        <p class="text-xs text-gray-400 font-bold uppercase">Sub: Rp ${total.toLocaleString()}</p>
                    </div>
                </div>
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