const legendMargin = {
    id: "legendMargin",
    afterInit(chart, args, plugins) {
        const originalFit = chart.legend.fit;
        chart.legend.fit = function fit() {
            originalFit && originalFit.call(this);
            this.height += plugins.margin || 0;
        };
    }
};

const Utils = ChartUtils.init();

async function customers() {
    const accordion = document.getElementsByClassName("container-card-accordion");
    Array.from(accordion).forEach(card => {
        card.addEventListener("click", function() {
            this.classList.toggle("container-card-accordion-active");
            const panel = this.nextElementSibling;
            panel.style.maxHeight = panel.style.maxHeight ? null : panel.scrollHeight + "px";
        });
    });
}

async function fetchData(url) {
    const response = await axios.get(url);
    return response.data.data;
}

async function getGeneralInformation() {
    const generalInfo = await fetchData("http://localhost:3000/storage/generalInformation");
    alertify.notify("Cargando información...", "warning", 5);

    const [total, complains, creditCard, notCreditCard] = ["total", "complain", "creditCard", "notCreditCard"].map(key => generalInfo[key][0]);
    document.getElementById("total").textContent = total[0].Total;
    document.getElementById("complains").textContent = complains[0].Complain;
    document.getElementById("cards").textContent = creditCard[0].Card;
    document.getElementById("notCards").textContent = notCreditCard[0].notCard;
    
    if (total[0].Total > 0) {
        await Promise.all([getCardTypes(document.getElementById("doughnut")), getCustomersByCountry(document.getElementById("bar"))]);
        alertify.notify("Dashboard cargado con éxito.", "success", 5);
    }
    else
        alertify.notify("No hay información disponible para mostrar", "warning", 5);
}

async function getCustomersByCountry(container) {
    const customersData = await fetchData("http://localhost:3000/storage/customersByCountry");
    
    const [active, inactive] = [customersData.Activo[0], customersData.Inactivo[0]];
    const dataActive = active.map(customer => customer.Cantidad);
    const dataInactive = inactive.map(customer => customer.Cantidad);
    container.height = 400;
    
    new Chart(container, {
        type: "bar",
        data: {
            labels: active.map(customer => customer.Geography),
            datasets: [
                { label: "Clientes activos", data: dataActive, borderColor: Utils.CHART_COLORS.blue, backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5) },
                { label: "Clientes inactivos", data: dataInactive, borderColor: Utils.CHART_COLORS.red, backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5) }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legendMargin: { margin: 50 },
                title: { display: true, text: "Clientes Activos e Inactivos por país", color: "black", font: { size: 18, family: "'Poppins', 'Roboto', sans-serif" } },
                legend: { labels: { color: "black", font: { family: "'Poppins', 'Roboto', sans-serif", size: 14 } } }
            }
        },
        plugins: [legendMargin]
    });
}

async function getCardTypes(container) {
    const cardData = await fetchData("http://localhost:3000/storage/cardTypes");    
    const quantities = cardData.map(card => card.Cantidad);
    const types = cardData.map(card => card["Card Type"]);
    container.height = 400;

    new Chart(container, {
        type: "doughnut",
        data: {
            labels: types,
            datasets: [{
                data: quantities,
                hoverOffset: 4,
                backgroundColor: Object.values(Utils.CHART_COLORS),
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legendMargin: { margin: 50 },
                title: { display: true, text: "Distribución de tipos de tarjetas de clientes", color: "black", font: { size: 18, family: "'Poppins', 'Roboto', sans-serif" } },
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        return (value * 100 / sum).toFixed(2) + "%";
                    },
                    color: "white",
                    font: { size: 14, family: "'Poppins', 'Roboto', sans-serif" }
                },
                legend: { labels: { color: "black", font: { family: "'Poppins', 'Roboto', sans-serif", size: 14 } } }
            }
        },
        plugins: [ChartDataLabels, legendMargin]
    });
}

function registrarUsuario() {
    document.getElementById("register").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target).entries());

        try {
            const response = await fetch(e.target.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.status === 201) {
                alertify.notify("Usuario registrado correctamente", "success", 5);
                return;
            }

            const messages = result.data ? Object.values(result.data).map(error => error.message) : [result.message];
            messages.forEach(msg => alertify.notify(msg, "error", 5));

        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alertify.notify("Hubo un error al intentar registrar al usuario. Intente más tarde.", "error", 5);
        }
    });
}

async function dashboard() {
    try {
        await getGeneralInformation();
    } catch (error) {
        console.log("Failed to get general information", error);
        alertify.notify("Error al conectar con la base de datos del dashboard", "error", 5);
    }
}

window.onload = () => {
    if (document.getElementById("register")) registrarUsuario();
    if (document.getElementById("dashboard")) dashboard(); 
    if (document.getElementById("customers")) customers();
};