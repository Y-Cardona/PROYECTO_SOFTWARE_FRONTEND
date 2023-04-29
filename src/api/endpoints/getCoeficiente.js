import config from "../../config";
const axios = require("axios");

const getCoeficiente = async(idItem, idPregunta) => {
    return axios
        .get(`${config().SERVER_URL}/coeficiente/obtener?idItem=${idItem
            }&idPregunta=${idPregunta}`)
        .then((response) => response.data);
};

export default getCoeficiente;