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

export async function getGeneralInformation() {
    try {
        const result = await axios.get("https://localhost:3000/storage/generalInformation");
        const generalInfo = result.data.data;
        alertify.warning("Cargando información...");

        const [total, complains, creditCard, notCreditCard] = ["total", "complain", "creditCard", "notCreditCard"].map(key => generalInfo[key][0]);
        document.getElementById("total").textContent = total[0].Total;
        document.getElementById("complains").textContent = complains[0].Complain;
        document.getElementById("cards").textContent = creditCard[0].Card;
        document.getElementById("notCards").textContent = notCreditCard[0].notCard;
    
        if (total[0].Total > 0) {
            await Promise.all([getCardTypes(document.getElementById("doughnut")), getCustomersByCountry(document.getElementById("bar"))]);
            alertify.success("Dashboard cargado con éxito.");
        }
        else
            alertify.error("No hay información disponible para mostrar.");
    } catch (error) {
        alertify.error("Error al cargar la información del dashboard.");
    }
}

async function getCustomersByCountry(container) {
    const result = await axios.get("https://localhost:3000/storage/customersByCountry");
    const customersData = result.data.data
    
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
    const result = await axios.get("https://localhost:3000/storage/cardTypes");
    const cardData = result.data.data;    
    const quantities = cardData.map(card => card.Cantidad);
    const types = cardData.map(card => card["cardType"]);
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