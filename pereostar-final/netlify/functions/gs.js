// netlify/functions/gs.js
// Проксирует все запросы к Google Apps Script
// Решает проблему CORS: браузер → Netlify → Google

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLuI6N2gO6hUKD11WLpIjcBujKGYZCv8Hdrn-1oq1Cj3DnoVCNeJDudbxSovRsyUWG/exec';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Пробрасываем все query-параметры к Google
    const params = event.queryStringParameters || {};
    const qs = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');

    const url = SCRIPT_URL + (qs ? '?' + qs : '');

    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Netlify-Proxy' },
    });

    const text = await response.text();

    return {
      statusCode: 200,
      headers,
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
