const name = 'A'.repeat(300);
const response = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name,
        email: 'testlongname@example.com',
        password: 'password123'
    })
});

console.log(`Status Code: ${response.status}`);
console.log(`Response: ${await response.text()}`);
