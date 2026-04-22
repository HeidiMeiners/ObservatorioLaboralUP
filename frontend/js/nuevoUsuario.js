function crearUsuario(){
    let nombre = document.getElementById("nombre").value;
    let apellido = document.getElementById("apellido").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if(password !== confirmPassword){
        mensaje("Las contraseñas no coinciden");
        return;
    }
    else if(nombre === "" || apellido === "" || email === "" || password === "" || confirmPassword === ""){
        mensaje("Por favor, complete todos los campos");
        return;
    }else if(!email.includes("@up.edu.mx")){
        mensaje("Correo inválido");
        return;
    }else{
        console.log(`${API_URL}/registro`);
        fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre: nombre,
            apellido: apellido,
            email: email,
            password: password
        })
        })
        .then(response => response.json())
        .then(data => {
            if(data.error){
                mensaje(data.error);
            } else {
                mensaje(resizeBy.message);
                localStorage.setItem("mensajeLogin", "Usuario registrado exitosamente, por favor verifique su correo");
                window.location.href = "../html/Login.html";
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }
}

function mensaje(mensaje){
    document.getElementById("mensaje").style.color = "red";
    document.getElementById("mensaje").innerText = mensaje;
}