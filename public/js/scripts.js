const hamburger = document.getElementById('hamburger')
const navUL = document.getElementById('nav-ul')
console.log(navUL)
hamburger.addEventListener('click',()=>{
    navUL.classList.toggle('show');
})
