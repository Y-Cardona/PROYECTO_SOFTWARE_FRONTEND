import config from "../../config";
const axios = require("axios");

const getParticipanteTest = async(id) => {
    return axios
        .get(`${config().SERVER_URL}/participante/test/${id}`)
        .then((response) => response.data);
};

export default getParticipanteTest;