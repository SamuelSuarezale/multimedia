//Animacion de estadisticas
document.querySelectorAll('.stat-number').forEach(num => {
    const target = +num.dataset.target;
    let count = 0;
    const step = target / 100;
    const update = () => {
    count += step;
    if (count < target) {
        num.textContent = Math.ceil(count);
        requestAnimationFrame(update);
    } else {
        num.textContent = target;
    }
    };
    update();
});

//Mostrar un toast de ejemplo
const toastEl =document.getElementById('successToast');
if(toastEl){
    const toast=new bootstrap.Toast(toastEl);
    toast.show();
}