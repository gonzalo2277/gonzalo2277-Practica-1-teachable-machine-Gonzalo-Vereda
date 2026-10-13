// ==========================================
// CONFIGURACIÓN
// ==========================================

// Carpeta donde está nuestro modelo
const MODEL_URL = "./modelo/";

// Porcentaje mínimo para considerar
// que existe una coincidencia
const PORCENTAJE_MINIMO = 60;


// ==========================================
// VARIABLES
// ==========================================

let modelo = null;

let modeloCargado = false;

let clasificadorActivo = false;

let imagenSeleccionada = null;


// ==========================================
// ELEMENTOS HTML
// ==========================================

const btnIniciar =
    document.getElementById("btnIniciar");

const btnParar =
    document.getElementById("btnParar");

const inputImagen =
    document.getElementById("imagen");

const previewImagen =
    document.getElementById("previewImagen");

const estado =
    document.getElementById("estado");

const resultadoTexto =
    document.getElementById("resultadoTexto");

const porcentaje =
    document.getElementById("porcentaje");

const mensaje =
    document.getElementById("mensaje");

const historial =
    document.getElementById("historial");

const btnLimpiar =
    document.getElementById("btnLimpiar");


// ==========================================
// INICIAR CLASIFICADOR
// ==========================================

btnIniciar.addEventListener(
    "click",
    async function () {

        if (clasificadorActivo) {
            return;
        }


        estado.textContent =
            "Cargando modelo...";


        try {

            // Cargar el modelo de Teachable Machine
            modelo = await tmImage.load(
                MODEL_URL + "model.json",
                MODEL_URL + "metadata.json"
            );


            modeloCargado = true;

            clasificadorActivo = true;


            estado.textContent =
                "Modelo cargado correctamente.";


            btnIniciar.disabled = true;

            btnParar.disabled = false;


            mensaje.textContent =
                "El clasificador está activo. Selecciona una imagen.";


            // Si ya había una imagen seleccionada,
            // clasificarla automáticamente
            if (imagenSeleccionada) {

                clasificarImagen();

            }

        } catch (error) {

            console.error(
                "Error al cargar el modelo:",
                error
            );


            estado.textContent =
                "Error al cargar el modelo.";


            mensaje.textContent =
                "No se ha podido cargar el modelo. Comprueba la carpeta modelo.";


            modeloCargado = false;

            clasificadorActivo = false;


            btnIniciar.disabled = false;

            btnParar.disabled = true;

        }

    }
);


// ==========================================
// PARAR CLASIFICADOR
// ==========================================

btnParar.addEventListener(
    "click",
    function () {

        clasificadorActivo = false;


        btnIniciar.disabled = false;

        btnParar.disabled = true;


        estado.textContent =
            "El clasificador está detenido.";


        mensaje.textContent =
            "El clasificador está detenido. Pulsa Iniciar para volver a utilizarlo.";

    }
);


// ==========================================
// SELECCIONAR IMAGEN
// ==========================================

inputImagen.addEventListener(
    "change",
    function (event) {

        const archivo =
            event.target.files[0];


        if (!archivo) {
            return;
        }


        // Comprobar que sea una imagen
        if (!archivo.type.startsWith("image/")) {

            mensaje.textContent =
                "Selecciona un archivo de imagen válido.";

            return;
        }


        // Crear URL temporal
        const url =
            URL.createObjectURL(archivo);


        previewImagen.src = url;


        previewImagen.style.display =
            "block";


        // Esperar a que cargue
        previewImagen.onload =
            function () {

                imagenSeleccionada =
                    previewImagen;


                if (
                    clasificadorActivo &&
                    modeloCargado
                ) {

                    clasificarImagen();

                } else {

                    resultadoTexto.textContent =
                        "Imagen preparada.";


                    porcentaje.textContent =
                        "";


                    mensaje.textContent =
                        "Pulsa Iniciar para activar el clasificador.";

                }

            };

    }
);


// ==========================================
// CLASIFICAR IMAGEN
// ==========================================

async function clasificarImagen() {

    if (!modeloCargado || !modelo) {

        mensaje.textContent =
            "Primero debes iniciar el clasificador.";

        return;
    }


    if (!clasificadorActivo) {

        mensaje.textContent =
            "El clasificador está detenido.";

        return;
    }


    if (!imagenSeleccionada) {

        mensaje.textContent =
            "Selecciona una imagen.";

        return;
    }


    estado.textContent =
        "Analizando imagen...";


    try {

        // Realizar predicción
        const predicciones =
            await modelo.predict(
                imagenSeleccionada
            );


        // Obtener la predicción con mayor probabilidad
        let mejorPrediccion =
            predicciones[0];


        for (
            let i = 1;
            i < predicciones.length;
            i++
        ) {

            if (
                predicciones[i].probability >
                mejorPrediccion.probability
            ) {

                mejorPrediccion =
                    predicciones[i];

            }

        }


        // Nombre de la categoría
        const nombreClase =
            mejorPrediccion.className;


        // Porcentaje
        const confianza =
            mejorPrediccion.probability * 100;


        // Mostrar resultado
        mostrarResultado(
            nombreClase,
            confianza
        );


    } catch (error) {

        console.error(
            "Error durante la clasificación:",
            error
        );


        estado.textContent =
            "Error durante la clasificación.";


        mensaje.textContent =
            "Ha ocurrido un error al analizar la imagen.";

    }

}


// ==========================================
// MOSTRAR RESULTADO
// ==========================================

function mostrarResultado(
    nombreClase,
    confianza
) {

    const porcentajeRedondeado =
        confianza.toFixed(2);


    estado.textContent =
        "Clasificación completada.";


    porcentaje.textContent =
        "Coincidencia: " +
        porcentajeRedondeado +
        "%";


    // Convertimos a minúsculas para
    // comparar las categorías
    const claseNormalizada =
        nombreClase
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");


    // ======================================
    // MÓVIL
    // ======================================

    if (claseNormalizada === "movil") {

        resultadoTexto.textContent =
            "📱 Móvil";


        if (confianza >= PORCENTAJE_MINIMO) {

            mensaje.textContent =
                "¡La imagen parece ser un móvil!";

        } else {

            mensaje.textContent =
                "La imagen tiene una coincidencia baja con la categoría móvil.";

        }

    }


    // ======================================
    // RELOJ
    // ======================================

    else if (claseNormalizada === "reloj") {

        resultadoTexto.textContent =
            "⌚ Reloj";


        if (confianza >= PORCENTAJE_MINIMO) {

            mensaje.textContent =
                "¡La imagen parece ser un reloj!";

        } else {

            mensaje.textContent =
                "La imagen tiene una coincidencia baja con la categoría reloj.";

        }

    }


    // ======================================
    // OTRA CATEGORÍA
    // ======================================

    else {

        resultadoTexto.textContent =
            nombreClase;


        mensaje.textContent =
            "Se ha detectado la categoría " +
            nombreClase +
            ".";

    }


    // Guardar en historial
    guardarResultado(
        nombreClase,
        confianza
    );

}


// ==========================================
// GUARDAR RESULTADO
// ==========================================

function guardarResultado(
    nombreClase,
    confianza
) {

    const historialGuardado =
        JSON.parse(
            localStorage.getItem(
                "historialClasificador"
            )
        ) || [];


    const nuevoResultado = {

        clase: nombreClase,

        confianza:
            confianza.toFixed(2),

        fecha:
            new Date().toLocaleString("es-ES")

    };


    // Añadir al principio
    historialGuardado.unshift(
        nuevoResultado
    );


    // Máximo 20 resultados
    if (historialGuardado.length > 20) {

        historialGuardado.pop();

    }


    // Guardar
    localStorage.setItem(
        "historialClasificador",
        JSON.stringify(
            historialGuardado
        )
    );


    mostrarHistorial();

}


// ==========================================
// MOSTRAR HISTORIAL
// ==========================================

function mostrarHistorial() {

    const historialGuardado =
        JSON.parse(
            localStorage.getItem(
                "historialClasificador"
            )
        ) || [];


    // No hay resultados
    if (historialGuardado.length === 0) {

        historial.innerHTML =
            "<p>No hay resultados todavía.</p>";

        return;

    }


    historial.innerHTML = "";


    historialGuardado.forEach(
        function (resultado) {

            const elemento =
                document.createElement("div");


            elemento.classList.add(
                "historial-item"
            );


            elemento.innerHTML = `

                <div>

                    <div class="nombre">
                        ${resultado.clase}
                    </div>

                    <div class="fecha">
                        ${resultado.fecha}
                    </div>

                </div>

                <div class="confianza">
                    ${resultado.confianza}%
                </div>

            `;


            historial.appendChild(
                elemento
            );

        }
    );

}


// ==========================================
// LIMPIAR HISTORIAL
// ==========================================

btnLimpiar.addEventListener(
    "click",
    function () {

        const confirmar =
            confirm(
                "¿Quieres borrar todo el historial?"
            );


        if (!confirmar) {
            return;
        }


        localStorage.removeItem(
            "historialClasificador"
        );


        mostrarHistorial();

    }
);


// ==========================================
// CARGAR HISTORIAL AL ABRIR
// ==========================================

mostrarHistorial();