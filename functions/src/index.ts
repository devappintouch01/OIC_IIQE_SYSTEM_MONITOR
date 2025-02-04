import axios from "axios";

const CHECK_URL: string = "https://onlinewebadt2.oic.or.th/oiciiqe/Login/Login";
const DISCORD_WEBHOOK_URL: string = "https://discord.com/api/webhooks/1335873714054631485/FDLtjsfsMfBEOzoYfWZuk0HUEprMJ8jrNn6r-yl2tEnxFwmL8AkC1qfj8kO8ZBX9X0Tn";

const CHECK_INTERVAL = 60 * 1000;
const NOTIFY_INTERVAL = 30 * 60 * 1000;
const NOTIFY_ERROR_INTERVAL = 5 * 60 * 1000;
const HEARTBEAT_INTERVAL = 60 * 60 * 1000;

let lastSuccessNotify: number = 0;
let lastErrorNotify: number = 0;
let lastStatus: boolean | null = null;
let lastStatusError: boolean | null = null;

function getDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

async function checkWebsite(): Promise<void> {
    const formattedDate = getDate();

    try {
        const response = await axios.get(CHECK_URL);
        if (response.status === 200) {
            const now = Date.now();
            if (lastStatus !== true || now - lastSuccessNotify >= NOTIFY_INTERVAL) {
                await sendMessage(`${formattedDate}[INF]เว็บไซต์ ${CHECK_URL} ใช้งานได้ปกติ 🟢`);
                lastSuccessNotify = now;
            }
            lastStatus = true;
        } else {
            await handleWebsiteDown(`${formattedDate}[ERR]เว็บไซต์ ${CHECK_URL} ใช้งานไม่ได้ 🟡`);
        }
    } catch (error: any) {
        console.error("🚨 ตรวจสอบเว็บไซต์ล้มเหลว:", error.message);
        await handleWebsiteDown(`${formattedDate}[ERR]ไม่สามารถเข้าเว็บไซต์ ${CHECK_URL} 🔴`);
    }
}

async function handleWebsiteDown(errorMessage: string): Promise<void> {
    const now = Date.now();
    if (lastStatusError !== true || now - lastErrorNotify >= NOTIFY_ERROR_INTERVAL) {
        await sendMessage(errorMessage);
        lastErrorNotify = now;
    }
    lastStatusError = true;
}

async function sendMessage(message: string): Promise<void> {
    try {
        const response = await axios.post(DISCORD_WEBHOOK_URL, { content: message });
        if (response.status === 204) {
            console.log("✅ ส่งข้อความสำเร็จ:", message);
        } else {
            console.error("❌ ส่งข้อความไม่สำเร็จ:", response.statusText);
        }
    } catch (error: any) {
        console.error("❌ ส่งข้อความไม่สำเร็จ:", error.message);
    }
}


async function sendHeartbeat(): Promise<void> {
    const now = getDate();
    sendMessage(`${now}[INF]🐱 แมวยังทำงานอยู่นะ`);
}

sendMessage(`${getDate()}[INF]🐱 แมวเริ่มทำงาน !`);
setInterval(checkWebsite, CHECK_INTERVAL);
setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);