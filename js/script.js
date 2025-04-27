// ---------------- Navigation ----------------
function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");
    navLinks.classList.toggle("active");
}

// ---------------- Image Slider ----------------
const images = [
    "images/2.jpg",
    "images/1.jpg"
];

let currentIndex = 0;
const imageElement = document.getElementById("product-image");

function updateImage() {
    if (imageElement) {
        setTimeout(() => {
            imageElement.src = images[currentIndex];
        }, 100);
    }
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
}

if (imageElement) {
    setInterval(nextImage, 5000);
}

// ---------------- Category Tabs ----------------
async function showCategory(category, clickedButton) {
    try {
        const productGrid = document.querySelector(".product-grid");
        productGrid.innerHTML = `<p class="loading">Loading products...</p>`;

        const response = await fetch(`https://fakestoreapi.com/products/category/${category}`);

        if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);

        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.querySelector(".product-grid").innerHTML = `<p class="error">⚠️ Failed to load products. Please try again later.</p>`;
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    if (clickedButton) clickedButton.classList.add('active');
}

function displayProducts(products) {
    const productGrid = document.querySelector(".product-grid");
    productGrid.innerHTML = "";

    products.forEach(product => {
        const productElement = document.createElement("div");
        productElement.classList.add("product");
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.price} $</p>
            <button class="add-to-cart" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
        `;
        productGrid.appendChild(productElement);
    });

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", addToCart);
    });
}

// ---------------- Search ----------------
document.getElementById("searchInput")?.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        const searchTerm = this.value.toLowerCase();
        const productTitles = document.querySelectorAll(".product h3");

        productTitles.forEach(title => {
            const productCard = title.closest(".product");
            productCard.style.display = title.textContent.toLowerCase().includes(searchTerm) ? "block" : "none";
        });
    }
});

// ---------------- Cart ----------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = totalQuantity;
}

function addToCart(event) {
    const button = event.target;
    const product = {
        id: button.dataset.id,
        title: button.dataset.title,
        price: parseFloat(button.dataset.price),
        image: button.dataset.image,
        quantity: 1
    };

    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    showToast("✅ Added to cart!");
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
}

function displayCart() {
    const cartGrid = document.getElementById("cart-grid");
    const totalItems = document.getElementById("total-items");
    const totalPrice = document.getElementById("total-price");
    const tax = document.getElementById("tax");
    const grandTotal = document.getElementById("grand-total");

    if (!cartGrid) return;
    cartGrid.innerHTML = "";

    let total = 0, itemCount = 0;

    if (cart.length === 0) {
        document.querySelector(".cart-title")?.style.setProperty("display", "none");
        document.querySelector(".cart-summary")?.style.setProperty("display", "none");
        document.querySelector(".cart-content").innerHTML = `<h2 class="empty-cart-message">Your Cart is Empty! 🛒</h2>`;
        return;
    }

    document.querySelector(".cart-title")?.style.setProperty("display", "block");
    document.querySelector(".cart-summary")?.style.setProperty("display", "block");

    cart.forEach((product, index) => {
        total += product.price * product.quantity;
        itemCount += product.quantity;

        const item = document.createElement("div");
        item.classList.add("cart-item");
        item.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="item-details">
                <h3>${product.title}</h3>
                <button class="delete-btn" onclick="removeFromCart(${index})">Remove</button>
            </div>
            <div class="item-actions">
                <span class="price">$${product.price}</span>
                <div class="quantity">
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <span>${product.quantity}</span>
                    <button onclick="increaseQuantity(${index})">+</button>
                </div>
            </div>`;
        cartGrid.appendChild(item);
    });

    totalItems.textContent = itemCount;
    totalPrice.textContent = total.toFixed(2);
    tax.textContent = (total * 0.1).toFixed(2);
    grandTotal.textContent = (total * 1.1).toFixed(2);
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    updateCart();
}

function increaseQuantity(index) {
    cart[index].quantity++;
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateCart() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
        updateCartCount();
    } catch (e) {
        console.error("Error saving cart:", e);
    }
}

function goToPayment() {
    window.location.href = "payment.html";
}

// ---------------- Payment ----------------
function handlePayment(event) {
    event.preventDefault();

    const name = document.getElementById("fullName").value;
    const address = document.getElementById("address").value;

    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 7));
    const formattedDate = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const message = `
        <strong>Thank you Mr./Ms. ${name}</strong>,<br>
        Your order has been successfully confirmed.<br>
        It will be delivered to: <strong>${address}</strong><br>
        within 7 days, on <strong>${formattedDate}</strong>.
    `;

    document.getElementById("popup-message").innerHTML = message;
    document.getElementById("confirmation-popup").style.display = "flex";

    document.getElementById("payment-form").reset();
}

function closePopup() {
    localStorage.removeItem("cart");
    document.getElementById("confirmation-popup").style.display = "none";
    window.location.href = "./index.html";
}

// ---------------- Init ----------------
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    displayCart();

    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", (event) => {
            let targetButton = event.target;
            if (targetButton.tagName === "IMG") {
                targetButton = targetButton.parentElement;
            }
            const category = targetButton.dataset.category;
            showCategory(category, targetButton);
        });
    });

    const firstActive = document.querySelector(".tab-button.active");
    if (firstActive) showCategory("electronics", firstActive);
});



// ---------------- Scroll Button ----------------
const scrollBtn = document.getElementById("scrollBtn");
if (scrollBtn) {
    window.addEventListener("scroll", () => {
        scrollBtn.classList.toggle("show", window.scrollY > 1000);
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollOnePageUp() {
    window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
}
