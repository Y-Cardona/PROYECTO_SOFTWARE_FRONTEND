import config from "../../config";
const axios = require("axios");

const getCoordinates = async(testId) => {
    return axios
        .get(`${config().SERVER_URL}/puntos/obtener/${testId}`)
        .then((response) => response.data);
};

export default getCoordinates;