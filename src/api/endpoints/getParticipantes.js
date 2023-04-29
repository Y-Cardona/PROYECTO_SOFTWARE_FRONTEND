import config from "../../config";
const axios = require("axios");

const getParticipantes = async(testId) => {
    return axios
        .get(`${config().SERVER_URL}/participante/listar`)
        .then((response) => response.data);
};

export default getParticipantes;