document.addEventListener('DOMContentLoaded', () => {
    const landItems = [
        { id: 1, location: 'Location A', price: '$1000', size: '1000 sqft', description: 'Beautiful land with scenic views.' },
        { id: 2, location: 'Location B', price: '$2000', size: '2000 sqft', description: 'Spacious land perfect for building.' },
        // Add more land items as needed
    ];

    const agents = [
        { id: 1, name: 'Agent A', email: 'agentA@example.com', telegram: '@agentA' },
        { id: 2, name: 'Agent B', email: 'agentB@example.com', telegram: '@agentB' },
        // Add more agents as needed
    ];

    const landList = document.getElementById('land-items');
    const landDetailsSection = document.getElementById('land-details');
    const detailsContent = document.getElementById('details-content');
    const connectAgentBtn = document.getElementById('connect-agent-btn');
    const paymentSection = document.getElementById('payment-section');
    const paySolBtn = document.getElementById('pay-sol-btn');
    // const payFlutterwaveBtn = document.getElementById('pay-flutterwave-btn');
    const paymentStatus = document.getElementById('payment-status');
    const agentSelection = document.getElementById('agent-selection');
    const agentList = document.getElementById('agent-list');
    const agentContact = document.getElementById('agent-contact');
    const agentEmail = document.getElementById('agent-email');
    const agentTelegram = document.getElementById('agent-telegram');
    const finalMessage = document.getElementById('final-message');
    const finalPaymentSection = document.createElement('section');
    finalPaymentSection.id = 'final-payment-section';
    finalPaymentSection.style.display = 'none';
    finalPaymentSection.innerHTML = `
        <h2>Final Payment</h2>
        <p>Please pay the final amount for the land.</p>
        <button id="final-pay-sol-btn">Pay with Solana/USDT</button>
        <button id="final-pay-flutterwave-btn">Pay with Flutterwave</button>
        <div id="final-payment-status" style="display: none;"></div>
    `;
    document.body.appendChild(finalPaymentSection);

    let selectedLand = null;
    let keypair = null;
    let general_sol_bal = 0;

    // Initialize Solana connection
    window.connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

    console.log("Current Blockchain Network:", window.connection);

    // Populate land items
    landItems.forEach(land => {
        const li = document.createElement('li');
        const svg = `
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v7c0 5.523 4.477 10 10 10s10-4.477 10-10V7l-10-5z" fill="#007BFF"/>
                <path d="M12 22c-5.523 0-10-4.477-10-10V7l10-5 10 5v5c0 5.523-4.477 10-10 10z" stroke="#fff" stroke-width="2"/>
            </svg>
        `;
        li.innerHTML = `${svg} <div class="details"><span>${land.location}</span> - <span class="price">${land.price}</span> - <span>${land.size}</span></div>`;
        li.addEventListener('click', () => showLandDetails(land));
        landList.appendChild(li);
    });

    function showLandDetails(land) {
        selectedLand = land;
        detailsContent.innerHTML = `
            <div class="content">
                <button class="close-btn" onclick="closeLandDetails()">Close</button>
                <p>Location: ${land.location}</p>
                <p>Price: ${land.price}</p>
                <p>Size: ${land.size}</p>
                <p>Description: ${land.description}</p>
                <button id="connect-agent-btn">Connect with Legal Agent</button>
            </div>
        `;
        landDetailsSection.style.display = 'flex';
        document.getElementById('connect-agent-btn').addEventListener('click', () => {
            landDetailsSection.style.display = 'none';
            paymentSection.style.display = 'block';
            saveProgress('paymentSection');
        });
    }

    window.closeLandDetails = function() {
        landDetailsSection.style.display = 'none';
    };

    paySolBtn.addEventListener('click', async () => {
        const amount = 10; // $10
        const solAmount = await getSolEquivalent(amount);
        const usdtAmount = await getUsdtEquivalent(amount);

        if (solAmount) {
            await makeSolanaPayment(solAmount);
        } else if (usdtAmount) {
            await makeUsdtPayment(usdtAmount);
        } else {
            paymentStatus.style.display = 'block';
            paymentStatus.textContent = 'Insufficient funds. Please try again.';
        }
    });

    /* payFlutterwaveBtn.addEventListener('click', () => {
        FlutterwaveCheckout({
            public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY",
            tx_ref: "hooli-tx-1920bbtyt",
            amount: 10,
            currency: "USD",
            payment_options: "card, mobilemoneyghana, ussd",
            redirect_url: "https://your-redirect-url.com",
            meta: {
                consumer_id: 23,
                consumer_mac: "92a3-912ba-1192a",
            },
            customer: {
                email: "user@example.com",
                phone_number: "08102909304",
                name: "Yemi Desola",
            },
            customizations: {
                title: "Land Inquiry Fee",
                description: "Payment for land inquiry",
                logo: "https://your-logo-url.com",
            },
            callback: function (data) {
                if (data.status === "successful") {
                    paymentSection.style.display = 'none';
                    showAgentSelection();
                } else {
                    paymentStatus.style.display = 'block';
                    paymentStatus.textContent = 'Payment failed. Please try again.';
                }
            },
            onclose: function() {
                // Handle payment modal close
            },
        });
    }); */

    async function getSolEquivalent(amount) {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        const solPrice = data.solana.usd;
        return amount / solPrice;
    }

    async function getUsdtEquivalent(amount) {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
        const data = await response.json();
        const usdtPrice = data.tether.usd;
        return amount / usdtPrice;
    }

    async function makeSolanaPayment(amount) {
        console.log("the sol price: " + general_sol_bal);
        try {
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: new solanaWeb3.PublicKey('3Wj9BHs2N75vgEKNGM62QGEPToRQcopK1giZCG2iMCX3'), // Default recipient address
                    lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
                })
            );
            const signature = await solanaWeb3.sendAndConfirmTransaction(window.connection, transaction, [keypair]);
            console.log('Transaction successful with signature:', signature);
            paymentSection.style.display = 'none';
            showAgentSelection();
        } catch (error) {
            console.error('Transaction failed:', error);
            paymentStatus.style.display = 'block';
            paymentStatus.textContent = 'Payment failed. Please try again.';
        }
    }

    async function makeUsdtPayment(amount) {
        // Implement USDT payment logic here
    }

    // Wallet management functions
    document.getElementById('create-wallet-btn').addEventListener('click', createWallet);
    document.getElementById('download-key-btn').addEventListener('click', downloadPrivateKey);
    document.getElementById('upload-key-btn').addEventListener('click', () => document.getElementById('upload-key-file').click());
    document.getElementById('upload-key-file').addEventListener('change', loadPrivateKeyFile);
    document.getElementById('send-sol-btn').addEventListener('click', sendSol);

    async function createWallet() {
        keypair = solanaWeb3.Keypair.generate();
        localStorage.setItem('solana_private_key', JSON.stringify(Array.from(keypair.secretKey)));
        displayWalletInfo();
        alert('New wallet created successfully!');
        location.reload();
    }

    function displayWalletInfo() {
        document.getElementById('publicKey').textContent = 'Public Key: ' + keypair.publicKey.toBase58();
        getBalance();
    }

    function loadStoredWallet() {
        const privateKey = localStorage.getItem('solana_private_key');
        if (privateKey) {
            keypair = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
            displayWalletInfo();
        } else {
            alert('No wallet found. Please create a new wallet.');
        }
    }

    function downloadPrivateKey() {
        if (!keypair) {
            alert('No wallet found. Create or load a wallet first.');
            return;
        }
        const privateKey = JSON.stringify(Array.from(keypair.secretKey));
        const blob = new Blob([privateKey], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'solana_private_key.json';
        link.click();
    }

    function loadPrivateKeyFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const privateKeyArray = JSON.parse(e.target.result);
            keypair = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
            localStorage.setItem('solana_private_key', JSON.stringify(Array.from(keypair.secretKey)));
            displayWalletInfo();
            alert('Wallet loaded successfully!');
            location.reload();
        };
        reader.readAsText(file);
    }

    async function getBalance() {
        if (!keypair) {
            alert('No wallet found. Create or load a wallet first.');
            return;
        }
        const balance = await window.connection.getBalance(keypair.publicKey);
        document.getElementById('balance').textContent = 'Balance: ' + (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(2) + ' SOL';
        general_sol_bal = (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(2);
    }


    loadStoredWallet();

    async function sendSol() {
        if (!keypair) {
            alert('No wallet found. Create or load a wallet first.');
            return;
        }

        const recipientAddress = document.getElementById('recipient').value;
        const amount = parseFloat(document.getElementById('amount').value);

        if (!recipientAddress || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid recipient address and amount.');
            return;
        }

        const recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: recipientPublicKey,
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
            })
        );

        try {
            const signature = await solanaWeb3.sendAndConfirmTransaction(window.connection, transaction, [keypair]);
            document.getElementById('transactionStatus').textContent = 'Transaction successful! Signature: ' + signature;
        } catch (error) {
            document.getElementById('transactionStatus').textContent = 'Transaction failed: ' + error.message;
        }
    }

    function showAgentSelection() {
        agentSelection.style.display = 'block';
        agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.id;
            option.textContent = agent.name;
            agentList.appendChild(option);
        });
        agentList.addEventListener('change', showAgentContact);
        showAgentContact();
    }

    function showAgentContact() {
        const selectedAgent = agents.find(agent => agent.id == agentList.value);
        agentEmail.textContent = selectedAgent.email;
        agentTelegram.textContent = selectedAgent.telegram;
        agentContact.style.display = 'block';
        setTimeout(() => {
            agentSelection.style.display = 'none';
            finalPaymentSection.style.display = 'block';
        }, 10000); // Simulate agent approval process
    }

    document.getElementById('final-pay-sol-btn').addEventListener('click', async () => {
        const amount = parseFloat(selectedLand.price.replace('$', ''));
        const solAmount = await getSolEquivalent(amount);
        const usdtAmount = await getUsdtEquivalent(amount);

        if (solAmount) {
            await makeSolanaPayment(solAmount);
        } else if (usdtAmount) {
            await makeUsdtPayment(usdtAmount);
        } else {
            const finalPaymentStatus = document.getElementById('final-payment-status');
            finalPaymentStatus.style.display = 'block';
            finalPaymentStatus.textContent = 'Insufficient funds. Please try again.';
        }
    });

    /* document.getElementById('final-pay-flutterwave-btn').addEventListener('click', () => {
        FlutterwaveCheckout({
            public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY",
            tx_ref: "hooli-tx-1920bbtyt",
            amount: parseFloat(selectedLand.price.replace('$', '')),
            currency: "USD",
            payment_options: "card, mobilemoneyghana, ussd",
            redirect_url: "https://your-redirect-url.com",
            meta: {
                consumer_id: 23,
                consumer_mac: "92a3-912ba-1192a",
            },
            customer: {
                email: "user@example.com",
                phone_number: "08102909304",
                name: "Yemi Desola",
            },
            customizations: {
                title: "Final Land Payment",
                description: "Payment for land purchase",
                logo: "https://your-logo-url.com",
            },
            callback: function (data) {
                const finalPaymentStatus = document.getElementById('final-payment-status');
                if (data.status === "successful") {
                    finalPaymentStatus.style.display = 'block';
                    finalPaymentStatus.textContent = 'Final payment successful!';
                    finalPaymentSection.style.display = 'none';
                    finalMessage.style.display = 'block';
                } else {
                    finalPaymentStatus.style.display = 'block';
                    finalPaymentStatus.textContent = 'Final payment failed. Please try again.';
                }
            },
            onclose: function() {
                // Handle payment modal close
            },
        });
    }); */


});