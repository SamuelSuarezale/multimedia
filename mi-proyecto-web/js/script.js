// ================= TIPOS DE VARIABLE =================

// var -> Alcance global o de función
var ipEjemplo = "192.168.1.1"; // Tipo de string

// let -> Alcance de bloque, se puede reasignar
let primerOcteto = 192; // Tipo de number

// const -> Constante, no se puede reasignar
const VERSION = "1.0";   // Tipo de String (inmutable)


// ================= TIPOS DE DATOS =================
let texto = "Hola JS";               // string
let numero = 42;                     // number
let booleano = true;                 // boolean
let objeto = { red: "Clase C" };     // object
let arreglo = [192, 168, 1, 10];     // array
let indefinido;                      // undefined
let nulo = null;                     // null

// Mostrar en consola los tipos de datos
console.log("Tipos de datos en JS:");
console.log(
    typeof texto,
    typeof numero,
    typeof booleano,
    typeof objeto,
    typeof arreglo,
    typeof indefinido,
    typeof nulo
);


// ================= FUNCION calcularClase =================
function calcularClase(ip) {
    // Convertimos la IP en un arreglo de octetos
    let octetos = ip.split(".").map(Number);

    // Validamos cantidad de octetos
    if (octetos.length !== 4) {
        return { clase: "Inválida", mascara: "-", hosts: "-" };
    }

    // Ciclo for para validar valores de octetos
    for (let i = 0; i < octetos.length; i++) {
        if (isNaN(octetos[i]) || octetos[i] < 0 || octetos[i] > 255) {
            return { clase: "Inválida", mascara: "-", hosts: "-" };
        }
    }

    // Tomamos el primer octeto
    let primerOcteto = octetos[0];
    let clase = "";
    let mascara = "";
    let hosts = 0;

    // Condicionales para determinar clase
    if (primerOcteto >= 1 && primerOcteto <= 126) {
        clase = "Clase A";
        mascara = "255.0.0.0 (/8)";
        hosts = Math.pow(2, 24) - 2; // Fórmula de hosts
    } 
    else if (primerOcteto >= 128 && primerOcteto <= 191) {
        clase = "Clase B";
        mascara = "255.255.0.0 (/16)";
        hosts = Math.pow(2, 16) - 2;
    } 
    else if (primerOcteto >= 192 && primerOcteto <= 223) {
        clase = "Clase C";
        mascara = "255.255.255.0 (/24)";
        hosts = Math.pow(2, 8) - 2;
    } 
    else if (primerOcteto >= 224 && primerOcteto <= 239) {
        clase = "Clase D (Multicast)";
        mascara = "N/A";
        hosts = "N/A";
    } 
    else if (primerOcteto >= 240 && primerOcteto <= 254) {
        clase = "Clase E (Experimental)";
        mascara = "N/A";
        hosts = "N/A";
    } 
    else {
        clase = "Inválida";
        mascara = "-";
        hosts = "-";
    }

    return { clase, mascara, hosts };
}


// ================= INTERACTIVIDAD =================
// Cada vez que el usuario escribe en el input, se recalcula
document.getElementById("ip").addEventListener("input", function () {
    let ip = this.value.trim();

    // Llamamos a la función calcularClase()
    let resultado = calcularClase(ip);

    // Mostramos resultados en HTML
    document.getElementById("clase").textContent =
        "Clase: " + resultado.clase;
    document.getElementById("mascara").textContent =
        "Máscara por defecto: " + resultado.mascara;
    document.getElementById("host").textContent =
        "Hosts disponibles: " + resultado.hosts;
});
