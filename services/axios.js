import axios from 'axios';

const api = axios.create({
  baseURL: 'https://us-central1-anonibus-89f12.cloudfunctions.net',
});

export default api;
