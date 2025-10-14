<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Result</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .container {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 90%;
        }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 1rem;
        }
        .btn:hover {
            background-color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 id="status-title">Processing Payment...</h1>
        <p id="status-message">Please wait while we verify your payment.</p>
        <a href="/" class="btn" id="action-btn" style="display: none;">Back to App</a>
    </div>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const message = urlParams.get('message');
        const txRef = urlParams.get('tx_ref');

        const statusTitle = document.getElementById('status-title');
        const statusMessage = document.getElementById('status-message');
        const actionBtn = document.getElementById('action-btn');

        if (status === 'success' || status === 'successful') {
            statusTitle.textContent = 'Payment Successful! 🎉';
            statusTitle.className = 'success';
            statusMessage.textContent = message || 'Your payment has been processed successfully.';
        } else if (status === 'failed') {
            statusTitle.textContent = 'Payment Failed ❌';
            statusTitle.className = 'error';
            statusMessage.textContent = message || 'We couldn\'t process your payment. Please try again.';
        } else if (status === 'cancelled') {
            statusTitle.textContent = 'Payment Cancelled ⚠️';
            statusTitle.className = 'warning';
            statusMessage.textContent = message || 'You cancelled this payment.';
        } else {
            statusTitle.textContent = 'Payment Status Unknown';
            statusTitle.className = 'warning';
            statusMessage.textContent = message || 'We couldn\'t determine the payment status.';
        }

        actionBtn.style.display = 'inline-block';

        // Send message to parent window if in iframe
        if (window.parent !== window) {
            const result = {
                status: status,
                message: message,
                tx_ref: txRef
            };
            window.parent.postMessage(result, '*');
        }
    </script>
</body>
</html>