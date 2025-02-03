import axios from "axios";

const CHECK_URL: string = "https://onlinewebadtuat.oic.or.th/oiciiqe3/Login/Login";
const DISCORD_WEBHOOK_URL: string = "https://discord.com/api/webhooks/1335873714054631485/FDLtjsfsMfBEOzoYfWZuk0HUEprMJ8jrNn6r-yl2tEnxFwmL8AkC1qfj8kO8ZBX9X0Tn";

const CHECK_INTERVAL = 60 * 1000;
const NOTIFY_INTERVAL = 30 * 60 * 1000;
const HEARTBEAT_INTERVAL = 60 * 60 * 1000;

let lastSuccessNotify: number = 0;
let lastStatus: boolean | null = null;

async function checkWebsite(): Promise<void> {
    const now = new Date();
    const formattedDate = now.toISOString().replace("T", " ").split(".")[0];

    try {
        const response = await axios.get(CHECK_URL);
        if (response.status === 200) {
            const now = Date.now();
            if (lastStatus !== true || now - lastSuccessNotify >= NOTIFY_INTERVAL) {
                await sendMessage(`${formattedDate} เว็บไซต์ ${CHECK_URL} ใช้งานได้ปกติ ✅`);
                lastSuccessNotify = now;
            }
            lastStatus = true;
        } else {
            await handleWebsiteDown(`${formattedDate} เว็บไซต์ ${CHECK_URL} ใช้งานไม่ได้ ⚠️`);
        }
    } catch (error: any) {
        await handleWebsiteDown(`${formattedDate} ไม่สามารถเข้าถึงเว็บไซต์ ${CHECK_URL} ❌`);
    }
}

async function handleWebsiteDown(errorMessage: string): Promise<void> {
    if (lastStatus !== false) {
        await sendMessage(errorMessage);
    }
    lastStatus = false;
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
    const now = new Date().toISOString().replace("T", " ").split(".")[0];
    sendMessage(`${now} แมวยังทำงานอยู่นะ 🐱`);
}

sendMessage("🐱แมวเริ่มทำงาน!");
setInterval(checkWebsite, CHECK_INTERVAL);
setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
