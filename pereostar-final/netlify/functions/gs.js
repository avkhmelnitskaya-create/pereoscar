// netlify/functions/gs.js
// Проксирует запросы к Google Apps Script, следует за редиректами

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLuI6N2gO6hUKD11WLpIjcBujKGYZCv8Hdrn-1oq1Cj3DnoVCNeJDudbxSovRsyUWG/exec';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  try {
    const params = event.queryStringParameters || {};
    const qs = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');

    const url = SCRIPT_URL + (qs ? '?' + qs : '');

    // Шаг 1: запрос к Google Apps Script (без автоследования редиректов)
    const res1 = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    let finalText;

    if (res1.status === 302 || res1.status === 301 || res1.status === 307) {
      // Шаг 2: следуем за редиректом
      const location = res1.headers.get('location');
      if (location) {
        const res2 = await fetch(location, {
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        finalText = await res2.text();
      } else {
        finalText = await res1.text();
      }
    } else {
      finalText = await res1.text();
    }

    // Проверить что это JSON а не HTML
    const trimmed = finalText.trim();
    if (trimmed.startsWith('<')) {
      // Получили HTML — попробуем ещё раз с полным следованием редиректов
      const res3 = await fetch(url, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        },
      });
      finalText = await res3.text();
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: finalText,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
