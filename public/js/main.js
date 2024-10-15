async function customers() {
    const accordion = document.getElementsByClassName("accordion");
    for (let index = 0; index < accordion.length; index++) {
        accordion[index].addEventListener("click", function() {
            this.classList.toggle("active");
            let panel = this.nextElementSibling;
            panel.style.maxHeight = panel.style.maxHeight ? null : (panel.scrollHeight + "px");
        });
    }
}

const Utils = ChartUtils.init();

const legendMargin = {
    id: "legendMargin",
    afterInit(chart, args, plugins) {
        const originalFit = chart.legend.fit;
        const margin = plugins.margin || 0;
        chart.legend.fit = function fit(){
            if (originalFit) 
                originalFit.call(this);
            return this.height += margin
        }
    }
}

async function getGeneralInformation(container) {
    const generalInformation = await axios.get("http://localhost:3000/storage/generalInformation");    
    alertify.notify("Cargando información...", "warning", 5);

    const complains = generalInformation.data.data["complain"][0];
    const creditCard = generalInformation.data.data["creditCard"][0];
    const notCreditCard = generalInformation.data.data["notCreditCard"][0];
    const total = generalInformation.data.data["total"][0];

    document.getElementById("total").textContent = total[0].Total;
    document.getElementById("complains").textContent = complains[0].Complain;
    document.getElementById("cards").textContent = creditCard[0].Card;
    document.getElementById("notCards").textContent = notCreditCard[0].notCard;

    if(total[0].total != 0){
        await getCardTypes(document.getElementById("doughnut"));
        await getCustomersByCountry(document.getElementById("bar"));
        alertify.notify("Dashboard cargado con éxito.", "success", 5);
    }
    else
        alertify.notify("No hay informacion disponible para mostrar", "success", 5);
}

async function getCustomersByCountry(container) {

    const customersByCountry = await axios.get("http://localhost:3000/storage/customersByCountry");
    const customersActive = customersByCountry.data.data.Activo[0];
    const customersInactive = customersByCountry.data.data.Inactivo[0];
    const cantidadescustomersActive = customersActive.map(customer => customer.Cantidad);
    const cantidadescustomersInactive = customersInactive.map(customer => customer.Cantidad);
    container.height = 400;

    new Chart(container, {
        type: "bar",
        data: {
            labels: customersActive.map(customer => customer.Geography),
            datasets: [{
                label: "Clientes activos",
                data: cantidadescustomersActive,
                borderColor: Utils.CHART_COLORS.blue,
                backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
                borderWidth: 1
            },
            {
                label: "Clientes inactivos",
                data: cantidadescustomersInactive,
                borderColor: Utils.CHART_COLORS.red,
                backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legendMargin: {
                    margin: 50
                },
                title: {
                    display: true,
                    text: "Clientes Activos e Inactivos por país",
                    color: "black",
                    font: {
                        size: 18,
                        family: "'Poppins', 'Roboto', sans-serif"
                    }
                },
                legend: {
                    labels: {
                        color: "black",
                        font: {
                            family: "'Poppins', 'Roboto', sans-serif", 
                            size: 14
                        }
                    }
                }
            }
        },
        plugins: [legendMargin] 
    });
}

async function getCardTypes(container) {

    const cardTypes = await axios.get("http://localhost:3000/storage/cardTypes");
    const cantidades = cardTypes.data.data.map(cardType => cardType["Cantidad"]);
    const tipos = cardTypes.data.data.map(cardType => cardType["Card Type"]);
    container.height = 400;
    
    new Chart(container, {
        type: "doughnut",
        data: {
            labels: tipos,
            datasets: [{
                data: cantidades,
                hoverOffset: 4,
                backgroundColor: Object.values(Utils.CHART_COLORS),
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legendMargin: {
                    margin: 50
                },
                title: {
                    display: true,
                    text: "Distribución de tipos de tarjetas de clientes",
                    color: "black",
                    font: {
                        size: 18,
                        family: "'Poppins', 'Roboto', sans-serif"
                    }
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        let percentage = (value * 100 / sum).toFixed(2) + "%";
                        return percentage;
                    },
                    color: "white",
                    font: {
                        size: 14,
                        family: "'Poppins', 'Roboto', sans-serif"
                    }
                },
                legend: {
                    labels: {
                        color: "black",
                        font: {
                            family: "'Poppins', 'Roboto', sans-serif", 
                            size: 14
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels, legendMargin] 
    });
}


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

async function dashboard() {
    try {
        await getGeneralInformation(document.getElementById("container-mini-cards"));
    } catch (error) {
        alertify.notify("Error al conectar con la base de datos del dashboard", "error", 5);
    }
}

window.onload = () => {
    if (document.getElementById("register")) registrarUsuario();
    if (document.getElementById("dashboard")) dashboard(); 
    if (document.getElementById("customers")) customers();
};