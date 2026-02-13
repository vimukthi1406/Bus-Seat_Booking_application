
async function testRegister() {
    try {
        console.log("Attempting to register testuser3...");
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser3',
                password: 'password123'
            })
        });

        const data = await res.json();

        if (res.ok) {
            console.log("Registration Success:", data);
        } else {
            console.error("Registration Failed:", data);
        }
    } catch (err) {
        console.error("Network Error:", err.message);
    }
}

testRegister();
