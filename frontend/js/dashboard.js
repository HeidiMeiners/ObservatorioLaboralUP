const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../html/Login.html";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "../html/Login.html";
    
}

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
    document.getElementById("nombre").innerText = data.usuario.nombre;
    document.getElementById("apellido").innerText = data.usuario.apellido;

    if (data.usuario.cuenta === "Admin") {
        document.getElementById("administracion").classList.remove("ocultar");
    }else{
        document.getElementById("administracion").classList.add("ocultar");
    }

})
.catch(error => {
    console.log("Error:", error.message);

    localStorage.removeItem("token");
    window.location.href = "../html/Login.html";
});