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

const API_URL = 'http://localhost:3000/socios';

async function obtenerSocios() {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
}

async function guardarSocios(socios) {
    for (const socio of socios) {
        await fetch(`${API_URL}/${socio.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(socio)
        });
    }
}

async function renderizarSocios() {
    const listaSocios = document.getElementById("listaSocios");
    listaSocios.innerHTML = ""; // Limpiar la lista antes de renderizar

    const listadoSocios = await obtenerSocios();

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

async function habilitarEdicion(index, botonEditar) {
    const fila = botonEditar.closest("tr");
    const celdas = fila.querySelectorAll("td[contenteditable]");
    celdas.forEach((celda) => {
        celda.contentEditable = "true";
        celda.classList.add("editable");
    });

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

    botonEditar.style.display = "none";
    const botonGuardar = fila.querySelector(".guardar");
    botonGuardar.style.display = "inline-block";
}

async function guardarEdicion(index, botonGuardar) {
    const fila = botonGuardar.closest("tr");
    const celdas = fila.querySelectorAll("td[contenteditable]");

    const disciplina = fila.children[4].querySelector("select").value;
    const genero = fila.children[5].querySelector("select").value;

    const listadoSocios = await obtenerSocios();
    listadoSocios[index] = {
        ...listadoSocios[index],
        nombre: celdas[0].textContent.trim(),
        apellido: celdas[1].textContent.trim(),
        edad: parseInt(celdas[2].textContent.trim()),
        numeroSocio: celdas[3].textContent.trim(),
        disciplina: disciplina,
        genero: genero,
    };

    await guardarSocios(listadoSocios);

    celdas.forEach((celda) => {
        celda.contentEditable = "false";
        celda.classList.remove("editable");
    });
    fila.children[4].innerText = disciplina;
    fila.children[5].innerText = genero;

    const botonEditar = fila.querySelector(".editar");
    botonEditar.style.display = "inline-block";
    botonGuardar.style.display = "none";

    Swal.fire({
        title: 'Cambios guardados',
        text: 'Los cambios se han guardado correctamente',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar',
        customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            content: 'swal-content',
            confirmButton: 'swal-confirm-button'
        }
    });
}

async function actualizarEstadisticas() {
    const listadoSocios = await obtenerSocios();
    const totalSocios = listadoSocios.length;
    const totalMasculino = listadoSocios.filter(socio => socio.genero === "Masculino").length;
    const totalFemenino = listadoSocios.filter(socio => socio.genero === "Femenino").length;
    const totalOtro = listadoSocios.filter(socio => socio.genero === "Otro").length;

    const porcentajeMasculino = ((totalMasculino / totalSocios) * 100).toFixed(2);
    const porcentajeFemenino = ((totalFemenino / totalSocios) * 100).toFixed(2);
    const porcentajeOtro = ((totalOtro / totalSocios) * 100).toFixed(2);

    const disciplinasPorGenero = listadoSocios.reduce((acc, socio) => {
        if (!acc[socio.genero]) {
            acc[socio.genero] = {};
        }
        if (!acc[socio.genero][socio.disciplina]) {
            acc[socio.genero][socio.disciplina] = 0;
        }
        acc[socio.genero][socio.disciplina]++;
        return acc;
    }, {});

    document.getElementById("totalSocios").textContent = totalSocios;
    document.getElementById("totalMasculino").textContent = totalMasculino;
    document.getElementById("totalFemenino").textContent = totalFemenino;
    document.getElementById("totalOtro").textContent = totalOtro;
    document.getElementById("porcentajeMasculino").textContent = `${porcentajeMasculino}%`;
    document.getElementById("porcentajeFemenino").textContent = `${porcentajeFemenino}%`;
    document.getElementById("porcentajeOtro").textContent = `${porcentajeOtro}%`;

    let disciplinaPorGeneroHTML = '';
    for (const genero in disciplinasPorGenero) {
        for (const disciplina in disciplinasPorGenero[genero]) {
            disciplinaPorGeneroHTML += `${genero} - ${disciplina}: ${disciplinasPorGenero[genero][disciplina]}<br>`;
        }
    }
    document.getElementById("disciplinaPorGenero").innerHTML = disciplinaPorGeneroHTML;
}

async function eliminarSocio(index) {
    const listadoSocios = await obtenerSocios();
    const socio = listadoSocios[index];

    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar al socio ${socio.nombre} ${socio.apellido}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            content: 'swal-content',
            confirmButton: 'swal-confirm-button',
            cancelButton: 'swal-cancel-button'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            await fetch(`${API_URL}/${socio.id}`, {
                method: 'DELETE'
            });
            await renderizarSocios();
            actualizarEstadisticas();
            Swal.fire({
                title: 'Eliminado',
                text: 'El socio ha sido eliminado exitosamente',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar',
                customClass: {
                    popup: 'swal-popup',
                    title: 'swal-title',
                    content: 'swal-content',
                    confirmButton: 'swal-confirm-button'
                }
            });
        }
    });
}

async function agregarSocio(nombre, apellido, edad, disciplina, genero) {
    const listadoSocios = await obtenerSocios();
    const nuevoNumeroSocio = listadoSocios.length > 0 ? Math.max(...listadoSocios.map(socio => parseInt(socio.numeroSocio))) + 1 : 1;
    const nuevoSocio = new Socio(nombre, apellido, edad, nuevoNumeroSocio.toString(), disciplina, genero);
    
    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoSocio)
    });
    Swal.fire({
        title: 'Socio agregado',
        text: 'El socio ha sido agregado exitosamente',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        window.location.href = 'index.html';
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const formAgregarSocio = document.getElementById("formAgregarSocio");
    if (formAgregarSocio) {
        formAgregarSocio.addEventListener("submit", async function (e) {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const apellido = document.getElementById("apellido").value;
            const edad = parseInt(document.getElementById("edad").value, 10);
            const disciplina = document.getElementById("disciplina").value;
            const genero = document.getElementById("genero").value;

            await agregarSocio(nombre, apellido, edad, disciplina, genero);

            document.getElementById("formAgregarSocio").reset();
        });
    }

    if (document.getElementById("listaSocios")) {
        renderizarSocios();
        actualizarEstadisticas();
    }
});