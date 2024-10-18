import { getGeneralInformation } from "./dashboard.js";
import { registrarUsuario, updateUsuario } from "./form.js"
import { profileActions, customersList } from "./worker.js";

window.onload = () => {
    if (document.getElementById("register")) registrarUsuario();
    if (document.getElementById("dashboard")) getGeneralInformation(); 
    if (document.getElementById("customers")) customersList();
    if (document.getElementById("worker")) profileActions();
    if (document.getElementById("updateWorker")) updateUsuario();
};