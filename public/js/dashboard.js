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
            await Promise.all([
                getCardTypes(document.getElementById("cardType")), 
                getCustomersByCountry(document.getElementById("country")),
                getAgeCustomersExited(document.getElementById("age"))
            ]);
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
                { label: "Clientes activos", data: dataActive, borderColor: Utils.CHART_COLORS.blue, backgroundColor: Utils.CHART_COLORS.blue },
                { label: "Clientes inactivos", data: dataInactive, borderColor: Utils.CHART_COLORS.red, backgroundColor: Utils.CHART_COLORS.red }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legendMargin: { margin: 30 },
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
                backgroundColor: Object.values(Utils.CHART_COLORS)
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legendMargin: { margin: 30 },
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

async function getAgeCustomersExited(container) {
    const result = await axios.get("https://localhost:3000/storage/ageCustomersExited");
    const ageData = result.data.data.map(item => item.age);
    container.height = 400;

    const rangos = [
        { label: "18-25", min: 18, max: 25 },
        { label: "26-35", min: 26, max: 35 },
        { label: "36-45", min: 36, max: 45 },
        { label: "46-60", min: 46, max: 60 },
        { label: "61-75", min: 61, max: 75 },
        { label: "76+", min: 76, max: Infinity }
    ];

    const conteoRangos = Object.fromEntries(rangos.map(rango => [rango.label, 0]));

    ageData.forEach(edad => {
        const rango = rangos.find(rango => edad >= rango.min && edad <= rango.max);
        conteoRangos[rango.label]++;
    });

    const datasets = [{
        label: "Clientes retirados",
        data: Object.values(conteoRangos),
        backgroundColor: [
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(255, 206, 86)",
            "rgb(153, 102, 255)",
            "rgb(255, 159, 64)",
            "rgb(255, 99, 132)"
        ]
    }];

    new Chart(container, {
        type: "bar",
        data: {
            labels: rangos.map(rango => rango.label),
            datasets: datasets
        },
        options: {
            scales: { y: { beginAtZero: true, grace: "5%" } },
            responsive: false,
            plugins: {
                legendMargin: { margin: 30 },
                title: { display: true, text: "Clientes Retirados por Rango de Edad", color: "black", font: { size: 18, family: "'Poppins', 'Roboto', sans-serif" } },
                legend: { labels: { color: "black", font: { family: "'Poppins', 'Roboto', sans-serif", size: 14 } } }
            }
        },
        plugins: [legendMargin]
    });
}
