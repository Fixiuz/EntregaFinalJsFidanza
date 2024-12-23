class Socio {
    constructor(nombre, apellido, edad, numeroSocio, disciplina, genero) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.numeroSocio = numeroSocio;
        this.disciplina = disciplina;
        this.genero = genero;
    }
}

let listadoSocios = JSON.parse(localStorage.getItem("socios")) || [];
function guardarSociosEnLocalStorage() {
    localStorage.setItem("socios", JSON.stringify(listadoSocios));
}

function renderizarSocios() {
    const listaSocios = document.getElementById("listaSocios");
    listaSocios.innerHTML = "";

    listadoSocios.forEach((socio, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td contenteditable="false">${socio.nombre}</td>
            <td contenteditable="false">${socio.apellido}</td>
            <td contenteditable="false">${socio.edad}</td>
            <td contenteditable="false">${socio.numeroSocio}</td>
            <td contenteditable="false">${socio.disciplina}</td>
            <td contenteditable="false">${socio.genero}</td>
            <td>
                <button class="editar" onclick="habilitarEdicion(${index}, this)">Editar</button>
                <button class="guardar" style="display: none;" onclick="guardarEdicion(${index}, this)">Guardar</button>
                <button class="eliminar" onclick="eliminarSocio(${index})">Eliminar</button>
            </td>
        `;

        listaSocios.appendChild(fila);
    });
}


function habilitarEdicion(index, botonEditar) {
    const fila = botonEditar.closest("tr");
    const celdas = fila.querySelectorAll("td[contenteditable]");
    celdas.forEach((celda) => {
        celda.contentEditable = "true";
        celda.classList.add("editable"); // Añadir clase editable
    });

    // Reemplazar las celdas de Disciplina y Género con un select
    const disciplinas = ["Fútbol", "Natación", "Tenis", "Atletismo"];
    const generos = ["Masculino", "Femenino", "Otro"];

    const celdaDisciplina = fila.children[4];
    const celdaGenero = fila.children[5];

    celdaDisciplina.innerHTML = `
        <select>
            ${disciplinas
                .map(
                    (disciplina) =>
                        `<option value="${disciplina}" ${
                            celdaDisciplina.textContent === disciplina ? "selected" : ""
                        }>${disciplina}</option>`
                )
                .join("")}
        </select>
    `;

    celdaGenero.innerHTML = `
        <select>
            ${generos
                .map(
                    (genero) =>
                        `<option value="${genero}" ${
                            celdaGenero.textContent === genero ? "selected" : ""
                        }>${genero}</option>`
                )
                .join("")}
        </select>
    `;

    // Mostrar el botón Guardar y ocultar el botón Editar
    botonEditar.style.display = "none";
    const botonGuardar = fila.querySelector(".guardar");
    botonGuardar.style.display = "inline-block";
}

function guardarEdicion(index, botonGuardar) {
    const fila = botonGuardar.closest("tr");
    const celdas = fila.querySelectorAll("td[contenteditable]");

    // Obtener valores actualizados de las celdas
    const disciplina = fila.children[4].querySelector("select").value;
    const genero = fila.children[5].querySelector("select").value;

    listadoSocios[index] = {
        nombre: celdas[0].textContent.trim(),
        apellido: celdas[1].textContent.trim(),
        edad: parseInt(celdas[2].textContent.trim()),
        numeroSocio: celdas[3].textContent.trim(),
        disciplina: disciplina,
        genero: genero,
    };

    // Guardar cambios en localStorage o en el servidor (si estás usando JSON Server)
    guardarSociosEnLocalStorage();

    // Deshabilitar edición en las celdas
    celdas.forEach((celda) => {
        celda.contentEditable = "false";
        celda.classList.remove("editable"); // Quitar clase editable
    });
    // Revertir select a texto
    fila.children[4].innerText = disciplina;
    fila.children[5].innerText = genero;

    // Mostrar el botón Editar y ocultar el botón Guardar
    const botonEditar = fila.querySelector(".editar");
    botonEditar.style.display = "inline-block";
    botonGuardar.style.display = "none";

    alert("Los cambios se han guardado correctamente.");
}
function eliminarSocio(index) {
    listadoSocios.splice(index, 1);
    guardarSociosEnLocalStorage();
    renderizarSocios();
    actualizarEstadisticas();
}

function agregarSocio(nombre, apellido, edad, numeroSocio, disciplina, genero) {
    if (edad < 4 || edad > 18) {
        alert("La edad debe estar entre 4 y 18 años.");
        return;
    }

    const nuevoSocio = new Socio(nombre, apellido, edad, numeroSocio, disciplina, genero);
    listadoSocios.push(nuevoSocio);
    guardarSociosEnLocalStorage();
    renderizarSocios();
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const totalSocios = listadoSocios.length;
    document.getElementById("totalSocios").textContent = totalSocios;

    // Cantidad por género
    const generos = listadoSocios.reduce((acc, socio) => {
        acc[socio.genero] = (acc[socio.genero] || 0) + 1;
        return acc;
    }, {});

    // Mostrar cantidad por género
    const sociosPorGenero = document.getElementById("sociosPorGenero");
    sociosPorGenero.innerHTML = "";
    for (const [genero, cantidad] of Object.entries(generos)) {
        const li = document.createElement("li");
        li.textContent = `${genero}: ${cantidad}`;
        sociosPorGenero.appendChild(li);
    }

    // Cantidad por disciplina, desglosada por género
    const disciplinasPorGenero = listadoSocios.reduce((acc, socio) => {
        if (!acc[socio.disciplina]) {
            acc[socio.disciplina] = { Masculino: 0, Femenino: 0, Otro: 0 };
        }
        acc[socio.disciplina][socio.genero]++;
        return acc;
    }, {});

    // Mostrar cantidad por disciplina y género
    const sociosPorDisciplina = document.getElementById("sociosPorDisciplina");
    sociosPorDisciplina.innerHTML = "";
    for (const [disciplina, generoData] of Object.entries(disciplinasPorGenero)) {
        const li = document.createElement("li");
        li.textContent = `${disciplina}: Masculino: ${generoData.Masculino}, Femenino: ${generoData.Femenino}, Otro: ${generoData.Otro}`;
        sociosPorDisciplina.appendChild(li);
    }

    // Porcentaje por género
    const porcentajeGeneros = {
        Masculino: ((generos.Masculino || 0) / totalSocios * 100).toFixed(2),
        Femenino: ((generos.Femenino || 0) / totalSocios * 100).toFixed(2),
        Otro: ((generos.Otro || 0) / totalSocios * 100).toFixed(2),
    };

    // Mostrar porcentaje por género
    const porcentajeGeneroElement = document.getElementById("porcentajeGenero");
    porcentajeGeneroElement.innerHTML = "";
    for (const [genero, porcentaje] of Object.entries(porcentajeGeneros)) {
        const li = document.createElement("li");
        li.textContent = `${genero}: ${porcentaje}%`;
        porcentajeGeneroElement.appendChild(li);
    }

    // Porcentaje por disciplina
    const disciplinas = listadoSocios.reduce((acc, socio) => {
        acc[socio.disciplina] = (acc[socio.disciplina] || 0) + 1;
        return acc;
    }, {});

    const porcentajeDisciplina = {};
    for (const [disciplina, cantidad] of Object.entries(disciplinas)) {
        porcentajeDisciplina[disciplina] = ((cantidad / totalSocios) * 100).toFixed(2);
    }

    // Mostrar porcentaje por disciplina
    const porcentajeDisciplinaElement = document.getElementById("porcentajeDisciplina");
    porcentajeDisciplinaElement.innerHTML = "";
    for (const [disciplina, porcentaje] of Object.entries(porcentajeDisciplina)) {
        const li = document.createElement("li");
        li.textContent = `${disciplina}: ${porcentaje}%`;
        porcentajeDisciplinaElement.appendChild(li);
    }
}

document.getElementById("formAgregarSocio").addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const edad = parseInt(document.getElementById("edad").value, 10);
    const numeroSocio = document.getElementById("numeroSocio").value;
    const disciplina = document.getElementById("disciplina").value;
    const genero = document.getElementById("genero").value;

    // Llamar a la función para agregar el socio
    agregarSocio(nombre, apellido, edad, numeroSocio, disciplina, genero);

    // Limpiar el formulario
    document.getElementById("formAgregarSocio").reset();
    renderizarSocios();
    actualizarEstadisticas();

});

renderizarSocios();
actualizarEstadisticas();