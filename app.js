const express = require('express');
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const app = express();
const PORT = 3000;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const NIFI_URL = 'https://localhost:8443/nifi-api';
const PROCESSOR_ID = '3eb9a91c-0193-1000-adf5-f7f56cabbc21';

const agent = new https.Agent({
    rejectUnauthorized: false // Allows self-signed certificates
});

const auth = {
    username: '7f4b52b0-29f2-49db-9b0d-ddf1fb5fa61e',
    password: 'wf7AGVRue2FL0Znc/mfxFby7XONMCc5h'
};

app.use(express.static('public'));

// Function to get CSRF token
async function getCsrfToken() {
    const formData = qs.stringify({
        username: auth.username,
        password: auth.password,
    });

    const response = await axios.post(`${NIFI_URL}/access/token`, formData, {
        httpsAgent: agent, // Add the agent here
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data; // The JWT token
}

// Get processor status route
app.get('/status', async (req, res) => {
    try {
        const csrfToken = await getCsrfToken();
        
        // Correct URL and headers usage
        const response = await axios.get(`${NIFI_URL}/flow/processors/${PROCESSOR_ID}/status`, {
            httpsAgent: agent, // Add the https agent here for self-signed cert
            headers: {
                'Accept' : '*/*',
                'Authorization': `Bearer ${csrfToken}` // Correct the typo
            }
        });
        res.send(`processor is ${response.data.processorStatus.runStatus}`); // Return the processor status response
    } catch (error) {
        console.error('Error fetching processor status:', error);
        res.status(500).send('Error fetching processor status');
    }
});

app.get('/statusv2', async (req, res) => {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${NIFI_URL}/processors/run-status-details/queries`, 
            {
                processorIds: [`${PROCESSOR_ID}`]
            },
            {
                httpsAgent: agent,
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${csrfToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(response.data.runStatusDetails[0]); // Log the response for debugging
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching processor status in /statusv2:', error.message);
        res.status(500).send('Error fetching processor status');
    }
});


app.get('/start', async (req, res) => {
    try {
        const csrfToken = await getCsrfToken();

        // Correct URL and headers usage
        const response = await axios.put(`${NIFI_URL}/processors/${PROCESSOR_ID}/run-status`, 
            {
                "revision": {
                    "clientId": "432ae949-0193-1000-eb9b-b8af1a446ad8",
                    "version": 2,
                    "lastModifier": "atikur"
                },
                "state": "RUNNING",
                "disconnectedNodeAcknowledged": true
            },
            {
                httpsAgent: agent, // Add the https agent here for self-signed cert
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${csrfToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.send(response.data); // Return the processor status response
    } catch (error) {
        console.error('Error fetching processor status:', error);
        res.status(500).send('Error fetching processor status');
    }
});

app.get('/stop', async (req, res) => {
    try {
        const csrfToken = await getCsrfToken();

        // Correct URL and headers usage
        const response = await axios.put(`${NIFI_URL}/processors/${PROCESSOR_ID}/run-status`, 
            {
                "revision": {
                    "clientId": "432ae949-0193-1000-eb9b-b8af1a446ad8",
                    "version": 8,
                    "lastModifier": "atikur"
                },
                "state": "STOPPED",
                "disconnectedNodeAcknowledged": true
            },
            {
                httpsAgent: agent, // Add the https agent here for self-signed cert
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${csrfToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.send(response.data); // Return the processor status response
    } catch (error) {
        console.error('Error fetching processor status:', error);
        res.status(500).send('Error fetching processor status');
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Add this export statement at the end
module.exports = app;