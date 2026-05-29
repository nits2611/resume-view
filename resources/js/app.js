function initNavbar(){const e=document.getElementById("mobileMenuBtn"),t=document.getElementById("mobileMenu"),n=document.getElementById("mobileProfileBtn"),o=document.getElementById("mobileProfileMenu"),i=document.getElementById("mobileProfileIcon");if(!e||!t)return;e.addEventListener("click",()=>{const n=t.classList.toggle("is-open");e.classList.toggle("is-open",n);e.setAttribute("aria-expanded",String(n))});n&&o&&n.addEventListener("click",()=>{const e=o.classList.toggle("is-open");i&&(i.textContent=e?"−":"+")});t.querySelectorAll("a").forEach(n=>{n.addEventListener("click",()=>{t.classList.remove("is-open");e.classList.remove("is-open");e.setAttribute("aria-expanded","false");o&&o.classList.remove("is-open");i&&(i.textContent="+")})})}
function initScrollTop(){const e=document.getElementById("scrollTopBtn");if(!e)return;window.addEventListener("scroll",()=>{window.scrollY>300?e.classList.add("show"):e.classList.remove("show")},{passive:true});e.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}))}
function initShare(){const e=document.getElementById("copyPortfolioBtn"),t=document.getElementById("sharePortfolioBtn");e&&e.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(location.href);const t=e.textContent;e.textContent="Copied!";setTimeout(()=>e.textContent=t,1600)}catch(e){console.error("Copy failed",e)}});t&&t.addEventListener("click",async()=>{if(navigator.share){try{await navigator.share({title:"Nitesh Harjilawala Portfolio",text:"Check out my developer portfolio",url:location.href})}catch(e){}}else alert("Sharing is not supported on this device. Please use Copy Link.")})}
function initReveal(){const e=document.querySelectorAll(".reveal");if(!("IntersectionObserver"in window)){e.forEach(e=>e.classList.add("is-visible"));return}const t=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add("is-visible"),t.unobserve(e.target))})},{threshold:.12});e.forEach(e=>t.observe(e))}
document.addEventListener("DOMContentLoaded",()=>{initNavbar();initScrollTop();initShare();initReveal()});

// pre-loader - start
function hidePreloader() {
  const preloader = document.getElementById("app-preloader");
  if (!preloader) return;

  preloader.classList.add("hide");

  setTimeout(() => {
    preloader.remove();
  }, 600);
}

window.addEventListener("load", () => {
  setTimeout(hidePreloader, 1800);
});

/* safety fallback */
setTimeout(hidePreloader, 4000);

/* PWA/back-forward cache */
window.addEventListener("pageshow", () => {
  setTimeout(hidePreloader, 1800);
});
// pre-loader - end