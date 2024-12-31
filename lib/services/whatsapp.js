let whatsappClient = null;
let qrCodeData = null;

export async function initializeWhatsApp(onQrCode, onStatusChange) {
    if (whatsappClient) {
        return whatsappClient;
    }

    try {
        // Dynamic import venom-bot only on the server side
        const venom = (await import('venom-bot')).default;

        const client = await venom.create(
            'ottomessage-session',
            (base64Qr, asciiQR, attempts) => {
                console.log('New QR code generated. Attempts:', attempts);
                qrCodeData = base64Qr;
                onQrCode?.(base64Qr);
            },
            (statusSession) => {
                console.log('Status Session:', statusSession);
                if (statusSession === 'successChat') {
                    qrCodeData = null;
                }
                onStatusChange?.(statusSession);
            },
            {
                headless: 'new',
                disableWelcome: true,
                disableSpins: true,
                logQR: false,
                updatesLog: true,
                autoClose: 0,
                createPathFileToken: true,
                puppeteerOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                }
            }
        );

        whatsappClient = client;
        return client;
    } catch (error) {
        console.error('Error initializing WhatsApp:', error);
        throw error;
    }
}

export async function closeWhatsApp() {
    if (whatsappClient) {
        try {
            await whatsappClient.logout();
            await whatsappClient.close();
            whatsappClient = null;
            qrCodeData = null;
        } catch (error) {
            console.error('Error closing WhatsApp:', error);
            throw error;
        }
    }
}

export function getQrCode() {
    return qrCodeData;
}

export function isConnected() {
    return whatsappClient !== null;
} 