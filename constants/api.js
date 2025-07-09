import axios from 'axios';
export const API_KEY = '46a85152de112307df0952e6a618d60e';
export const BASE_URL = 'https://api.themoviedb.org/3'; 


export const getRequestToken = async () => {
  const res = await fetch(`${BASE_URL}/authentication/token/new?api_key=${API_KEY}`);
  const json = await res.json();
  return json.request_token;
};

export const validateLoginWithToken = async (username, password, requestToken) => {
  const res = await fetch(`${BASE_URL}/authentication/token/validate_with_login?api_key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, request_token: requestToken }),
  });
  return res.json();
};

export const createSession = async (requestToken) => {
  const res = await fetch(`${BASE_URL}/authentication/session/new?api_key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_token: requestToken }),
  });
  return res.json();
};