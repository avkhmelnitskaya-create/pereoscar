export async function onRequest(context) {
  const url = new URL(context.request.url);
  const params = url.searchParams.toString();
  const GS = 'https://script.google.com/macros/s/AKfycbxLuI6N2gO6hUKD11WLpIjcBujKGYZCv8Hdrn-1oq1Cj3DnoVCNeJDudbxSovRsyUWG/exec';
  
  const resp = await fetch(GS + (params ? '?' + params : ''), {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  const text = await resp.text();
  
  return new Response(text, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
