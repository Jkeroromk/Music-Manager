// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client secret
// a46a3ac979964d9d8f3cb3152e3a1cbe client id 

const clientId = 'a46a3ac979964d9d8f3cb3152e3a1cbe';
const clientSecret = '961849266f2f41bd94c05f31fc67c01c';

async function getAccessToken() {
    const authString = `${clientId}:${clientSecret}`;
    const encodedAuth = btoa(authString);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encodedAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}
