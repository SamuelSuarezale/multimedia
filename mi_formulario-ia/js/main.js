//paso 1: Funciones auxiliares para marcar campos válidos o inválidos
function setValid(el){
    el.classList.add("is-valid");
    el.classList.remove("is-invalid");
}

function setInvalid(el, msg){
    el.classList.add("is-invalid");
    el.classList.remove("is-valid");
    const fb = el.nextElementSibling;
    if (fb && fb.classList.contains("invalid-feedback")) fb.textContent = msg;
}

//Paso 2: Validaciones por campo
function validateNombre(){
    const el=document.getElementById("nombre");
    return el.value.trim().length >=3 ? (setValid(el), true) : (setInvalid(el, "Minimo 3 caracteres"), false);
}

function validateCorreo(){
    const el = document.getElementById("correo");
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(el.value) ? (setValid(el), true) : (setInvalid(el, "Correo inválido"), false);
}

function validatePassword(){
    const el=document.getElementById("password");
    const re= /(?=.*\d)(?=.*[A-Za-z]).{8,}/; 
    return re.test(el.value) ? (setValid(el), true) : (setInvalid(el, "Debe tener 8 caracteres, letra y número"), false);
}

function validateDocument(){
    const el =document.getElementById("documento");
    return el.value > 0 ? (setValid(el), true) : (setInvalid(el, "Número inválido"), false);
}

function validateTelefono(){
    const el=document.getElementById("telefono");
    const re=/^\+?\d{7,15}$/;
    return re.test(el.value) ? (setValid(el), true) : (setInvalid(el, "Teléfono inválido"), false);
}

function validateFecha(){
    const el=document.getElementById("fecha");
    const f=new Date(el.value);
    const hoy=new Date();
    return f <= hoy ? (setValid(el), true) : (setInvalid(el, "No puede ser futura"), false);
}

function validatePrograma(){
    const el=document.getElementById("programa");
    return el.value ? (setValid(el), true) : (setInvalid(el, "Seleccione un programa"), false);
}

function validateFile(){
    const el=document.getElementById("cv_file");
    const file= el.files[0];
    if(!file) return (setInvalid(el, "Sube un PDF"), false);
    const isPDF = file.type === "application/pdf";
    const sizeOK = file.size <= 2*1024*1024;
    return isPDF && sizeOK ? (setValid(el), true) : (setInvalid(el, "Solo PDF < 2MB"), false);
}

function validateGenero(){
    const radios =document.getElementsByName("genero");
    let ok= false;
    for (let r of radios) if(r.checked) ok= true;
    document.getElementById("generoFeedback").style.display= ok ? "none" : "block";
    return ok;
}

function validateIntereses(){
    const checks=document.getElementsByName("intereses");
    let ok=false;
    for (let c of checks) if (c.checked) ok = true;
    document.getElementById("interesesFeedback").style.display = ok ? "none" : "block";
    return ok;
}

//Paso 3: Validación global del formulario
function validateForm(){
    return(
        validateNombre() &&
        validateCorreo() &&
        validatePassword() &&
        validateDocument() &&
        validateTelefono() &&
        validateFecha() &&
        validatePrograma() &&
        validateFile() &&
        validateGenero() &&
        validateIntereses()
    );
}

//Paso 4: Evento submit
document.getElementById("formIA").addEventListener("submit", function(e){
    e.preventDefault(); //Previene envío por defecto
    const resultado=document.getElementById("resultado");
    if(validateForm()){
        resultado.innerHTML='<div class="alert alert-success">Formulario validado correctamente.</div>';   
    }else{
        resultado.innerHTML='<div class="alert alert-danger">Existen errores en el formulario.</div>';
    }
});
