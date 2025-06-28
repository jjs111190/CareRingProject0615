import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import localtunnel, { Tunnel } from 'localtunnel';
import { execSync, spawn, ChildProcess } from 'child_process';

// ✅ 환경 변수 로드
dotenv.config();

// ✅ 기본 설정값
const MYSQL_PASSWORD: string = process.env.MYSQL_ROOT_PASSWORD || 'root';
const TUNNEL_PORT: number = Number(process.env.TUNNEL_PORT) || 51235;
const SUBDOMAIN: string = process.env.TUNNEL_SUBDOMAIN || 'mycarering';
const PYTHON_PATH: string = path.resolve(__dirname, '../venv/bin/python3');
const URL_FILE = path.resolve(__dirname, '../current_tunnel_url.txt');

// ✅ 전역 상태
let tunnel: Tunnel | null = null;
let fastapi: ChildProcess | null = null;

// ✅ MySQL 컨테이너가 준비될 때까지 대기
async function waitForMysqlContainer(): Promise<void> {
  console.log('⏳ Waiting for MySQL to be ready...');
  const maxRetries = 1000;
  const interval = 3000;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      execSync(`docker exec carering-mysql mysqladmin ping -h127.0.0.1 -uroot -p${MYSQL_PASSWORD}`, { stdio: 'ignore' });
      console.log('✅ MySQL is ready!');
      return;
    } catch {
      if (i % 10 === 0) {
        console.log(`🔄 MySQL not ready yet... [attempt ${i}]`);
      }
      await new Promise((r) => setTimeout(r, interval));
    }
  }
  throw new Error('❌ MySQL failed to become ready after long wait.');
}

// ✅ LocalTunnel 생성
async function createTunnel(): Promise<Tunnel> {
  console.log(`🌐 Attempting to create tunnel with subdomain: ${SUBDOMAIN}`);
  const mainTunnel = await localtunnel({ port: TUNNEL_PORT, subdomain: SUBDOMAIN });
  console.log(`✅ Tunnel established at: ${mainTunnel.url}`);
  fs.writeFileSync(URL_FILE, mainTunnel.url);
  return mainTunnel;
}

// ✅ Tunnel 지속적 유지
async function manageTunnel(): Promise<void> {
  while (true) {
    try {
      tunnel = await createTunnel();

      tunnel.on('close', async () => {
        console.warn('⚠️ Tunnel closed unexpectedly. Reconnecting...');
      });

      tunnel.on('error', async (err: Error) => {
        console.error('❌ Tunnel error:', err);
      });

      await new Promise((resolve) => tunnel?.on('close', resolve));
    } catch (err) {
      console.error('❌ Tunnel creation failed:', err);
    }

    console.log('⏳ Retrying tunnel connection after 3 seconds...');
    await new Promise((r) => setTimeout(r, 3000));
  }
}

// ✅ 전체 시작 프로세스
async function startEverything(): Promise<void> {
  try {
    console.log('🚀 Starting Docker MySQL container...');
    execSync('docker start carering-mysql', { stdio: 'inherit' });

    await waitForMysqlContainer();

    if (!fs.existsSync(PYTHON_PATH)) {
      throw new Error(`❌ Python 실행 파일을 찾을 수 없습니다: ${PYTHON_PATH}`);
    }

    console.log('⚙️ Starting FastAPI server...');
    fastapi = spawn(
      PYTHON_PATH,
      ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', `${TUNNEL_PORT}`],
      {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
      }
    );

    fastapi.on('close', (code: number | null) => {
      console.error(`❌ FastAPI exited with code: ${code}`);
      process.exit(1);
    });

    await manageTunnel();

  } catch (err) {
    console.error('❌ Fatal error during startup:', err);
    process.exit(1);
  }
}

// ✅ 프로세스 종료 시 안전하게 정리
process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Cleaning up...');
  try {
    await tunnel?.close?.();
  } catch (e) {}
  if (fastapi) fastapi.kill('SIGINT');
  process.exit();
});

// ✅ 전체 실행 시작
startEverything(); 
