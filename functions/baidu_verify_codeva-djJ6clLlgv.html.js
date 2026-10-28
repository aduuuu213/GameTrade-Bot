export async function onRequest(context) {
  return new Response('6caf70e05035eb032967f38dca945157', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
