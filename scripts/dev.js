const { exec } = require("child_process");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ✅ 경로 세팅
const frontendEnvPath = path.join(__dirname, "..", "webfrontend", ".env.local");

// ✅ ngrok 실행
function startNgrok() {
  console.log("✅ Starting ngrok tunnel...");
  const ngrokProcess = exec("ngrok http 3000");

  ngrokProcess.stdout.on("data", (data) => console.log(`[ngrok] ${data}`));
  ngrokProcess.stderr.on("data", (data) => console.error(`[ngrok ERROR] ${data}`));

  setTimeout(fetchNgrokUrl, 4000);
}

// ✅ ngrok URL 추출
async function fetchNgrokUrl() {
  try {
    const res = await axios.get("http://localhost:4040/api/tunnels");
    const publicUrl = res.data.tunnels[0].public_url;

    console.log("✅ Public URL:", publicUrl);

    // 디렉토리 자동 생성
    const envDir = path.dirname(frontendEnvPath);
    if (!fs.existsSync(envDir)) {
      fs.mkdirSync(envDir, { recursive: true });
    }

    fs.writeFileSync(frontendEnvPath, `VITE_API_URL=${publicUrl}\n`);
    console.log(`✅ Updated frontend .env.local with ${publicUrl}`);

    console.log("✅ ✅ ✅ ✅ ✅ ngrok finished. Now you can manually start frontend:");
    console.log("👉 cd frontend-web && npm run dev");

  } catch (err) {
    console.error("❌ Failed to fetch ngrok URL:", err);
  }
}

// ✅ 메인 실행
startNgrok();