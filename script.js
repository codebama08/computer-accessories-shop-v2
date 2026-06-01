/* =========================
   Data
   ========================= */

const products = [
  { id: 1,  name: "ماوس بی‌سیم RGB",        price: 420000,  img: "assets/mouse.jpg",    desc: "ارگونومیک، دقت بالا، مناسب کار و بازی" },
  { id: 2,  name: "کیبورد مکانیکی",        price: 1450000, img: "assets/keyboard.jpg", desc: "سوییچ مکانیکی، نورپردازی، مناسب تایپ سریع" },
  { id: 3,  name: "هدست گیمینگ",           price: 980000,  img: "assets/headset.jpg",  desc: "صدای استریو، میکروفون قوی، راحت" },
  { id: 4,  name: "فلش مموری 64GB USB3",  price: 390000,  img: "assets/flash.jpg",    desc: "سرعت بالا، مناسب انتقال فایل‌های حجیم" },
  { id: 5,  name: "پد ماوس بزرگ",          price: 190000,  img: "assets/mousepad.jpg", desc: "سطح نرم و ضدلغزش، مناسب گیمینگ" },
  { id: 6,  name: "وبکم Full HD",          price: 870000,  img: "assets/webcam.jpg",   desc: "کیفیت بالا برای کلاس و جلسه آنلاین" },
  { id: 7,  name: "SSD اکسترنال 512GB",    price: 2650000, img: "assets/ssd.jpg",      desc: "پرسرعت، سبک، مناسب بکاپ و ادیت" },
  { id: 8,  name: "هاب USB 4 پورت",        price: 520000,  img: "assets/hub.jpg",      desc: "افزایش پورت‌ها، مناسب لپ‌تاپ‌ها" },
  { id: 9,  name: "فن خنک‌کننده لپ‌تاپ",   price: 740000,  img: "assets/cooler.jpg",   desc: "کاهش دما، طراحی کم‌صدا، قابل حمل" },
  { id: 10, name: "اسپیکر رومیزی",         price: 690000,  img: "assets/speaker.jpg",  desc: "صدای شفاف، مناسب موسیقی و فیلم" },
];

const els = {
  productGrid: document.getElementById("productGrid"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),

  cartItems: document.getElementById("cartItems"),
  cartCount: document.getElementById("cartCount"),
  summaryTotal: document.getElementById("summaryTotal"),
  summaryCount: document.getElementById("summaryCount"),

  kpiItems: document.getElementById("kpiItems"),
  kpiTotal: document.getElementById("kpiTotal"),

  clearCartBtn: document.getElementById("clearCartBtn"),

  checkoutForm: document.getElementById("checkoutForm"),
  orderMessage: document.getElementById("orderMessage"),

  contactForm: document.getElementById("contactForm"),
  contactMsg: document.getElementById("contactMsg"),

  themeToggle: document.getElementById("themeToggle"),
  themeIcon: document.getElementById("themeIcon"),
  themeText: document.getElementById("themeText"),

  toast: document.getElementById("toast"),
};

/* =========================
   Helpers
   ========================= */

function toToman(n){
  return `${n.toLocaleString("fa-IR")} تومان`;
}
function toFaNum(n){
  return n.toLocaleString("fa-IR");
}

function showToast(text){
  els.toast.textContent = text;
  els.toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2200);
}

/* =========================
   Theme (Dark/Light)
   ========================= */

function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme_v1", theme);

  const isDark = theme === "dark";
  els.themeIcon.textContent = isDark ? "🌙" : "☀️";
  els.themeText.textContent = isDark ? "دارک" : "لایت";
}

function initTheme(){
  const saved = localStorage.getItem("theme_v1");
  if(saved === "dark" || saved === "light"){
    applyTheme(saved);
    return;
  }

  // default based on system
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

/* =========================
   Cart (localStorage)
   ========================= */

// cart: { [productId]: qty }
let cart = loadCart();

function loadCart(){
  try{
    const raw = localStorage.getItem("cart_v1");
    return raw ? JSON.parse(raw) : {};
  }catch{
    return {};
  }
}
function saveCart(){
  localStorage.setItem("cart_v1", JSON.stringify(cart));
}

function cartCountTotal(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function cartTotalPrice(){
  let total = 0;
  for(const [idStr, qty] of Object.entries(cart)){
    const p = products.find(x => x.id === Number(idStr));
    if(p) total += p.price * qty;
  }
  return total;
}

/* =========================
   Render Products
   ========================= */

function renderProducts(list){
  els.productGrid.innerHTML = "";

  if(list.length === 0){
    els.emptyState.hidden = false;
    return;
  }
  els.emptyState.hidden = true;

  list.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "card product-card reveal";
    card.style.transitionDelay = `${Math.min(idx * 40, 200)}ms`;

    card.innerHTML = `
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-body">
        <div class="product-title">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-meta">
          <div>
            <div class="price">${toToman(p.price)}</div>
            <div class="small">کد محصول: ${p.id}</div>
          </div>
          <button class="btn btn-primary" type="button" data-add="${p.id}">
            افزودن
          </button>
        </div>
      </div>
    `;

    els.productGrid.appendChild(card);
  });

  els.productGrid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      addToCart(id);
      showToast("به سبد خرید اضافه شد");
    });
  });

  // make new cards visible via observer
  observeRevealsIn(els.productGrid);
}

/* =========================
   Cart operations
   ========================= */

function addToCart(productId){
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart();
  renderCart();
  updateBadges();
}

function decQty(productId){
  if(!cart[productId]) return;
  cart[productId] -= 1;
  if(cart[productId] <= 0) delete cart[productId];
  saveCart();
  renderCart();
  updateBadges();
}

function removeItem(productId){
  delete cart[productId];
  saveCart();
  renderCart();
  updateBadges();
  showToast("آیتم حذف شد");
}

function clearCart(){
  cart = {};
  saveCart();
  renderCart();
  updateBadges();
  showToast("سبد خرید خالی شد");
}

function renderCart(){
  els.cartItems.innerHTML = "";

  const ids = Object.keys(cart);
  if(ids.length === 0){
    const empty = document.createElement("div");
    empty.className = "card cart-item reveal";
    empty.innerHTML = `
      <div class="cart-info">
        <h4>سبد خرید خالی است</h4>
        <div class="muted">از بخش محصولات، آیتم اضافه کنید.</div>
      </div>
    `;
    els.cartItems.appendChild(empty);

    els.summaryTotal.textContent = toToman(0);
    els.summaryCount.textContent = toFaNum(0);

    observeRevealsIn(els.cartItems);
    return;
  }

  ids.forEach((idStr, idx) => {
    const id = Number(idStr);
    const qty = cart[id];
    const p = products.find(x => x.id === id);
    if(!p) return;

    const item = document.createElement("div");
    item.className = "card cart-item reveal";
    item.style.transitionDelay = `${Math.min(idx * 35, 160)}ms`;

    item.innerHTML = `
      <div class="cart-thumb">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="cart-info">
        <h4>${p.name}</h4>
        <div class="muted">قیمت واحد: ${toToman(p.price)}</div>

        <div class="qty">
          <button class="btn btn-ghost" type="button" data-dec="${p.id}">-</button>
          <span class="num">${toFaNum(qty)}</span>
          <button class="btn btn-ghost" type="button" data-inc="${p.id}">+</button>
          <button class="btn btn-danger" type="button" data-remove="${p.id}">حذف</button>
          <span class="muted">جمع: ${toToman(p.price * qty)}</span>
        </div>
      </div>
    `;

    els.cartItems.appendChild(item);
  });

  els.cartItems.querySelectorAll("[data-inc]").forEach(b=>{
    b.addEventListener("click", ()=>{
      addToCart(Number(b.getAttribute("data-inc")));
      showToast("تعداد افزایش یافت");
    });
  });
  els.cartItems.querySelectorAll("[data-dec]").forEach(b=>{
    b.addEventListener("click", ()=>{
      decQty(Number(b.getAttribute("data-dec")));
      showToast("تعداد کاهش یافت");
    });
  });
  els.cartItems.querySelectorAll("[data-remove]").forEach(b=>{
    b.addEventListener("click", ()=> removeItem(Number(b.getAttribute("data-remove"))));
  });

  els.summaryTotal.textContent = toToman(cartTotalPrice());
  els.summaryCount.textContent = toFaNum(cartCountTotal());

  observeRevealsIn(els.cartItems);
}

function updateBadges(){
  const count = cartCountTotal();
  const total = cartTotalPrice();

  els.cartCount.textContent = String(count);
  els.kpiItems.textContent = toFaNum(count);
  els.kpiTotal.textContent = total.toLocaleString("fa-IR");
}

/* =========================
   Search
   ========================= */

function wireSearch(){
  els.searchInput.addEventListener("input", () => {
    const q = els.searchInput.value.trim().toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(q));
    renderProducts(filtered);
  });

  els.clearSearchBtn.addEventListener("click", () => {
    els.searchInput.value = "";
    renderProducts(products);
    els.searchInput.focus();
    showToast("جستجو پاک شد");
  });
}

/* =========================
   Forms
   ========================= */

function wireCheckout(){
  els.checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if(cartCountTotal() === 0){
      els.orderMessage.style.color = "#ef4444";
      els.orderMessage.textContent = "سبد خرید خالی است. لطفاً ابتدا محصول اضافه کنید.";
      showToast("سبد خرید خالی است");
      return;
    }

    els.orderMessage.style.color = "#16a34a";
    els.orderMessage.textContent = "سفارش شما با موفقیت ثبت شد. (آزمایشی)";
    showToast("سفارش ثبت شد (آزمایشی)");

    clearCart();
    els.checkoutForm.reset();
  });
}

function wireContact(){
  els.contactForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    els.contactMsg.style.color = "#16a34a";
    els.contactMsg.textContent = "پیام شما ارسال شد. (آزمایشی)";
    showToast("پیام ارسال شد (آزمایشی)");
    els.contactForm.reset();
    setTimeout(()=> els.contactMsg.textContent = "", 2500);
  });

  // social demo buttons
  document.querySelectorAll("[data-toast]").forEach(btn=>{
    btn.addEventListener("click", ()=> showToast(btn.getAttribute("data-toast")));
  });
}

/* =========================
   Reveal on scroll (IntersectionObserver)
   ========================= */

let revealObserver;

function initRevealObserver(){
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
}

function observeRevealsIn(root = document){
  const nodes = root.querySelectorAll(".reveal:not(.is-visible)");
  nodes.forEach(n => revealObserver.observe(n));
}

/* =========================
   Init
   ========================= */

initTheme();
initRevealObserver();
observeRevealsIn(document);

els.themeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "dark" ? "light" : "dark";
  applyTheme(next);
  showToast(next === "dark" ? "دارک مود فعال شد" : "لایت مود فعال شد");
});

els.clearCartBtn.addEventListener("click", clearCart);

renderProducts(products);
renderCart();
updateBadges();
wireSearch();
wireCheckout();
wireContact();
