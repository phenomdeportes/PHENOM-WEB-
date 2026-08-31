// --- ESTADO GLOBAL Y PERSISTENCIA EN LOCALSTORAGE ---
let defaultProducts = [
    {
        id: 1,
        category: 'protectores',
        title: 'Guantes de Boxeo Blanco / Dorado',
        sizes: ['12oz', '14oz', '16oz'],
        priceCrossed: '$2.500 UYU',
        priceCurrent: '$2.090 UYU',
        priceNum: 2090,
        mpLink: 'https://mpago.la/',
        media: [{ type: 'image', src: 'https://via.placeholder.com/300x300/111111/FFFFFF?text=Guantes+Blanco+Dorado' }],
        featured: true
    },
    {
        id: 2,
        category: 'protectores',
        title: 'Cabezal Sparring Pro Negro Mate',
        sizes: ['M', 'L'],
        priceCrossed: '',
        priceCurrent: '$2.350 UYU',
        priceNum: 2350,
        mpLink: '',
        media: [{ type: 'image', src: 'https://via.placeholder.com/300x300/222222/FFFFFF?text=Cabezal+Negro+Mate' }],
        featured: true
    },
    {
        id: 3,
        category: 'accesorios',
        title: 'Vendas Pro 5 Metros Phenom',
        sizes: [],
        priceCrossed: '$500 UYU',
        priceCurrent: '$450 UYU',
        priceNum: 450,
        mpLink: '',
        media: [{ type: 'image', src: 'https://via.placeholder.com/300x300/333333/FFFFFF?text=Vendas+5M' }],
        featured: true
    }
];

// Cargar desde localStorage o inicializar
let products = JSON.parse(localStorage.getItem('phenom_products')) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('phenom_cart')) || [];
let selectedSizes = {}; // Almacena el talle seleccionado por producto: { productId: '14oz' }

let isEditMode = false;
let logoClickCount = 0;
let logoClickTimer = null;

let styleState = {
    logo: { bold: true, italic: false, strike: false },
    title: { bold: true, italic: false, strike: false }
};

let tempMediaList = [];

window.onload = function() {
    renderAllGrids();
    loadScreenSettings();
    updateCartUI();
};

// --- GESTIÓN DE ACCESO AL EDITOR (5 CLICS EN LOGO) ---
function handleLogoClick() {
    logoClickCount++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1500);

    if (logoClickCount === 5) {
        toggleEditMode();
        logoClickCount = 0;
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    document.getElementById('editor-panel').style.display = isEditMode ? 'block' : 'none';
    document.body.classList.toggle('editor-active', isEditMode);

    document.querySelectorAll('.btn-add-product').forEach(b => b.style.display = isEditMode ? 'block' : 'none');
    document.querySelectorAll('.card-edit-controls').forEach(c => c.style.display = isEditMode ? 'flex' : 'none');
}

// --- RENDERIZADO DE PRODUCTOS Y SELECCIÓN DE TALLES ---
function renderAllGrids() {
    renderGrid('grid-inicio', products.filter(p => p.featured));
    renderGrid('grid-protectores', products.filter(p => p.category === 'protectores'));
    renderGrid('grid-accesorios', products.filter(p => p.category === 'accesorios'));
}

function selectSize(productId, size) {
    selectedSizes[productId] = size;
    // Actualizar la interfaz de botones de talles en la tarjeta especifica
    const card = document.getElementById(`prod-card-${productId}`);
    if(card) {
        card.querySelectorAll('.size-badge-btn').forEach(btn => {
            if(btn.innerText === size) {
                btn.style.background = 'var(--accent-color)';
                btn.style.color = '#000';
            } else {
                btn.style.background = '#eee';
                btn.style.color = '#333';
            }
        });
    }
}

function renderGrid(containerId, productList) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';

    productList.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.id = `prod-card-${prod.id}`;

        const primaryMedia = prod.media && prod.media.length > 0 
            ? prod.media[0] 
            : { type: 'image', src: 'https://via.placeholder.com/300x300/111111/FFFFFF?text=Sin+Imagen' };

        let mediaHTML = primaryMedia.type === 'video'
            ? `<video src="${primaryMedia.src}" controls></video>`
            : `<img src="${primaryMedia.src}" alt="${prod.title}" onclick="openLightbox('${primaryMedia.src}')">`;

        let galleryHTML = '';
        if(prod.media && prod.media.length > 1) {
            galleryHTML = `<div class="gallery-thumbs">`;
            prod.media.forEach((m, idx) => {
                galleryHTML += m.type === 'video'
                    ? `<video src="${m.src}" onclick="changeCardMedia(${prod.id}, ${idx})"></video>`
                    : `<img src="${m.src}" onclick="changeCardMedia(${prod.id}, ${idx})">`;
            });
            galleryHTML += `</div>`;
        }

        let sizesHTML = '';
        if(prod.sizes && prod.sizes.length > 0) {
            sizesHTML = `<div class="product-sizes-badges" style="margin-bottom:10px;">`;
            prod.sizes.forEach(s => {
                const isSelected = selectedSizes[prod.id] === s;
                const bg = isSelected ? 'var(--accent-color)' : '#eee';
                const color = isSelected ? '#000' : '#333';
                sizesHTML += `<button class="size-badge-btn" onclick="selectSize(${prod.id}, '${s}')" style="background:${bg}; color:${color}; border:none; padding:4px 8px; border-radius:3px; font-weight:bold; cursor:pointer; font-size:0.75rem;">${s}</button>`;
            });
            sizesHTML += `</div>`;
        }

        let mpButtonHTML = prod.mpLink ? 
            `<a href="${prod.mpLink}" target="_blank" class="btn-mercadopago"><i class="fa-solid fa-credit-card"></i> Pagar con Mercado Pago</a>` : '';

        card.innerHTML = `
            <div>
                <div class="product-media-container" id="media-box-${prod.id}">
                    ${mediaHTML}
                </div>
                ${galleryHTML}
                <div style="font-weight:bold; margin-bottom:6px;">${prod.title}</div>
                ${sizesHTML}
            </div>
            <div>
                <div style="margin-bottom:8px;">
                    ${prod.priceCrossed ? `<span class="price-crossed">${prod.priceCrossed}</span>` : ''}
                    <span class="price-current">${prod.priceCurrent}</span>
                </div>
                <div class="btn-group-actions">
                    ${mpButtonHTML}
                    <button class="btn-action" onclick="addToCart(${prod.id})">Agregar al Carrito</button>
                </div>
                
                <div class="card-edit-controls" style="display: ${isEditMode ? 'flex' : 'none'}; gap:8px; margin-top:10px;">
                    <button style="flex:1; background:#007bff; color:white; border:none; padding:6px; border-radius:4px; cursor:pointer;" onclick="editProduct(${prod.id})">✏️ Editar</button>
                    <button style="flex:1; background:#dc3545; color:white; border:none; padding:6px; border-radius:4px; cursor:pointer;" onclick="deleteProduct(${prod.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- LÓGICA INTERACTIVA DEL CARRITO DE COMPRAS ---
function addToCart(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    // Verificar si el producto requiere talle y no se ha seleccionado
    if (prod.sizes && prod.sizes.length > 0 && !selectedSizes[productId]) {
        alert("Por favor, selecciona un talle/onza antes de agregar al carrito.");
        return;
    }

    const selectedSize = selectedSizes[productId] || 'Único';
    const existingIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: prod.id,
            title: prod.title,
            priceNum: prod.priceNum || 2090,
            size: selectedSize,
            quantity: 1,
            mediaSrc: prod.media && prod.media[0] ? prod.media[0].src : ''
        });
    }

    saveCart();
    updateCartUI();
    openCartModal();
}

function updateQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('phenom_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cart-count');
    if(cartCountElem) cartCountElem.innerText = totalItems;

    const cartListContainer = document.getElementById('cart-items-list');
    const cartTotalElem = document.getElementById('cart-total-price');

    if (cartListContainer) {
        cartListContainer.innerHTML = '';
        let totalSum = 0;

        if (cart.length === 0) {
            cartListContainer.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">El carrito está vacío.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.priceNum * item.quantity;
                totalSum += itemTotal;

                const row = document.createElement('div');
                row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #333; padding:10px 0;';
                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${item.mediaSrc}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                        <div>
                            <div style="font-weight:bold; font-size:0.85rem; color:#fff;">${item.title}</div>
                            <div style="font-size:0.75rem; color:#aaa;">Talle: ${item.size} | $${item.priceNum} UYU</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button onclick="updateQuantity(${index}, -1)" style="background:#444; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">-</button>
                        <span style="font-size:0.85rem; font-weight:bold; color:#fff;">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" style="background:#444; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer;">+</button>
                        <button onclick="removeFromCart(${index})" style="background:#dc3545; color:#fff; border:none; padding:2px 6px; border-radius:3px; cursor:pointer; margin-left:5px;">🗑️</button>
                    </div>
                `;
                cartListContainer.appendChild(row);
            });
        }

        if (cartTotalElem) cartTotalElem.innerText = `$${totalSum.toLocaleString()} UYU`;
    }
}

function openCartModal() {
    updateCartUI();
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-modal-overlay');
    if (modal && overlay) {
        modal.style.display = 'block';
        overlay.style.display = 'block';
    }
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-modal-overlay');
    if (modal && overlay) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }
}

function checkoutWhatsApp() {
    if (cart.length === 0) { alert("El carrito está vacío."); return; }
    let phone = "59895749605";
    let message = "Hola Phenom! Quiero finalizar la compra de los siguientes artículos:%0A%0A";
    let totalSum = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.priceNum * item.quantity;
        totalSum += itemTotal;
        message += `${index + 1}. ${item.title} (Talle: ${item.size}) - Cant: ${item.quantity} - Subtotal: $${itemTotal} UYU%0A`;
    });

    message += `%0A*Monto Total Estimated:* $${totalSum.toLocaleString()} UYU%0A%0AQuedo a la espera para coordinar el envío rápido.`;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// --- GUARDADO DE PRODUCTOS EDITADOS ---
function saveProduct() {
    const id = document.getElementById('prod-id').value;
    const category = document.getElementById('prod-category').value;
    const title = document.getElementById('prod-title').value;
    const priceCrossed = document.getElementById('prod-price-crossed').value;
    const priceCurrent = document.getElementById('prod-price-current').value;
    const mpLink = document.getElementById('prod-mp-link').value;

    // Extraer valor numérico del precio para el carrito
    const priceNum = parseInt(priceCurrent.replace(/[^0-9]/g, '')) || 0;

    const sizes = [];
    document.querySelectorAll('.size-checkbox:checked').forEach(cb => sizes.push(cb.value));

    if(!title || !priceCurrent) { alert("Título y Precio Actual son obligatorios."); return; }
    if(tempMediaList.length === 0) { tempMediaList.push({ type: 'image', src: 'https://via.placeholder.com/300x300/111111/FFFFFF?text=PHENOM' }); }

    if(id) {
        const prod = products.find(p => p.id === parseInt(id));
        if(prod) {
            prod.title = title;
            prod.sizes = sizes;
            prod.priceCrossed = priceCrossed;
            prod.priceCurrent = priceCurrent;
            prod.priceNum = priceNum;
            prod.mpLink = mpLink;
            prod.media = tempMediaList;
        }
    } else {
        products.push({
            id: Date.now(),
            category,
            title,
            sizes,
            priceCrossed,
            priceCurrent,
            priceNum,
            mpLink,
            media: tempMediaList,
            featured: false
        });
    }

    localStorage.setItem('phenom_products', JSON.stringify(products));
    renderAllGrids();
    closeProductModal();
}

function deleteProduct(productId) {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('phenom_products', JSON.stringify(products));
        renderAllGrids();
    }
}