import axios from 'axios';

const asApi = axios.create({
    baseURL: '/api'
})

export default asApi;