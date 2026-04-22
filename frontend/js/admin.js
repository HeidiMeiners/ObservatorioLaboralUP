const token = localStorage.getItem("token");
const usuario = localStorage.getItem("usuario");

if (!token || usuario == undefined) {
    window.location.href = "../html/Login.html";
}

/*if (usuario.cuenta !== "Admin") {
    window.location.href = "../html/Dashboard.html";
}*/

function logout() {
    localStorage.removeItem("token");
    window.location.href = "../html/Login.html";
}

//mostrar datos del usuario
fetch(`${API_URL}/perfil`, {
    headers: {
        "Authorization": token
    }
})
    .then(async res => {
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Error de autenticación");
        }

        return data;
    })
    .then(data => {
        document.getElementById("nombreUsuario").innerText = data.usuario.email;
        document.getElementById("cuenta").innerText = data.usuario.cuenta;
    })
    .catch(error => {
        console.log("Error:", error.message);

        localStorage.removeItem("token");
        window.location.href = "../login/Login.html";
    });

//mostrar usuarios
fetch(`${API_URL}/usuarios`, {
    headers: {
        "Authorization": localStorage.getItem("token")
    }
})
    .then(res => res.json())
    .then(data => {
        mostrarUsuarios(data.usuarios);
    });

function mostrarUsuarios(usuarios) {
    const contenedor = document.getElementById("listaUsuarios");

    contenedor.innerHTML = "";

    usuarios.forEach(usuario => {
        const div = document.createElement("div");

        div.id = `user-${usuario._id}`;

        div.innerHTML = `
            <div class="user-card">
                <div>
                    <div class="user-name">${usuario.nombre} ${usuario.apellido}</div>
                    <div class="user-email">${usuario.email}</div>
                    <div class="user-email">${usuario.cuenta}</div>
                </div>
                <div class="delete-edit" onclick="deleteUser('${usuario._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3 delete" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                    </svg>
                </div>
            </div>
        `;

        contenedor.appendChild(div);
    });
}

function deleteUser(id) {
    console.log("Eliminar usuario con ID:", id);

    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    })
    .then(res => {
        if (res.ok) {
            const card = document.getElementById(`user-${id}`);
            if (card) {
                card.remove();
            }
        } else {
            throw new Error("Error al eliminar el usuario");
        }
    })
    .catch(error => {
        console.error("Error:", error.message);
    });
}