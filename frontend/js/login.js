window.onload = function () {

    const params = new URLSearchParams(window.location.search);
    const msg = params.get("msg");

    if (msg === "verificado") {
        mensaje("Usuario verificado, por favor inicie sesión");
    }

};

function usuarioRegistrado() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        document.getElementById("titulo").style.color = "red";
        document.getElementById("titulo").innerText ="Por favor, complete todos los campos";
        return;
    }else{
        fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
        })
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        })
        .then(data => {
            localStorage.setItem("token", data.token);
            console.log("TOKEN:", data.token);
            window.location.href = "../html/Dashboard.html";
        })
        .catch(error => {
                document.getElementById("titulo").innerText = error.message || "Error al iniciar sesión";
                document.getElementById("titulo").style.color = "red";
        });
    }
}

const mensajelogin = localStorage.getItem("mensajeLogin");
if (mensajelogin) {
    mensaje(mensajelogin);
}

function mensaje(mensaje){
        document.getElementById("titulo").style.color = "rgb(75, 0, 0)";
        document.getElementById("titulo").innerText = mensaje;

        localStorage.removeItem("mensajeLogin");
}
