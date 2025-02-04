import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const CHECK_URL = "https://onlinewebadtuat.oic.or.th/oiciiqe3/Login/Login";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1335873714054631485/FDLtjsfsMfBEOzoYfWZuk0HUEprMJ8jrNn6r-yl2tEnxFwmL8AkC1qfj8kO8ZBX9X0Tn";

async function checkWebsite(): Promise<string> {
    const now = new Date().toISOString().replace("T", " ").split(".")[0];
    try {
        const response = await axios.get(CHECK_URL);
        if (response.status === 200) {
            await sendMessage(`${now}, เว็บไซต์ ${CHECK_URL} ใช้งานได้ปกติ ✅`);
            return "✅ เว็บไซต์ใช้งานได้ปกติ";
        } else {
            await sendMessage(`${now}, เว็บไซต์ ${CHECK_URL} ใช้งานไม่ได้ ⚠️`);
            return "⚠️ เว็บไซต์มีปัญหา";
        }
    } catch (error: any) {
        await sendMessage(`${now}, ไม่สามารถเข้าถึงเว็บไซต์ ${CHECK_URL} ❌`);
        return "❌ ไม่สามารถเข้าถึงเว็บไซต์";
    }
}

async function sendMessage(message: string): Promise<void> {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, { content: message });
        console.log("✅ ส่งข้อความสำเร็จ:", message);
    } catch (error: any) {
        console.error("❌ ส่งข้อความไม่สำเร็จ:", error.message);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const result = await checkWebsite();
    res.status(200).send(result);
}