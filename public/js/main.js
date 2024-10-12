function registrarUsuario() {
    const formulario = document.getElementById("register");

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(e.target.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formObject)
            });

            const result = await response.json();

            if (result.status === 201) {
                alertify.notify("Usuario registrado correctamente", "success", 5);
                return;
            }

            const messages = result.data 
                ? Object.values(result.data).map(error => error.message)
                : [result.message];

            messages.forEach(msg => alertify.notify(msg, "error", 5));

        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alertify.notify("Hubo un error al intentar registrar al usuario. Intente más tarde.", "error", 5);
        }
    });
}

window.onload = () => {
    if (document.getElementById("register")) registrarUsuario();
};