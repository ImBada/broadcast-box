import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getPublicIP() {
  try {
    // Try multiple services for reliability
    const services = [
      'https://api.ipify.org',
      'https://ifconfig.me/ip',
      'https://icanhazip.com'
    ];
    
    for (const service of services) {
      try {
        const response = await fetch(service);
        const ip = (await response.text()).trim();
        if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
          return ip;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Fallback to local network IP
    const networkIP = execSync("ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $2}'", 
      { encoding: 'utf8' }).trim();
    return networkIP || 'localhost';
  } catch (error) {
    console.warn('Could not detect IP, using fallback');
    return 'localhost';
  }
}

async function updateEnvFile() {
  const publicIP = await getPublicIP();
  const envPath = join(__dirname, '../../.env.development');
  
  try {
    let envContent = readFileSync(envPath, 'utf8');
    const newAPIPath = `VITE_API_PATH="http://${publicIP}:8080/api"`;
    
    envContent = envContent.replace(
      /VITE_API_PATH="http:\/\/[^"]+"/,
      newAPIPath
    );
    
    writeFileSync(envPath, envContent);
    console.log(`✓ Updated VITE_API_PATH to use IP: ${publicIP}`);
  } catch (error) {
    console.error('Failed to update .env file:', error.message);
  }
}

updateEnvFile();