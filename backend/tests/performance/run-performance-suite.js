/**
 * SIGB Universidad de Madeira - Ejecutor Automatizado de Pruebas de Rendimiento y Estrés
 * Levanta el servidor NestJS conectado a Neon PostgreSQL, ejecuta cargas concurrentes reales,
 * calcula métricas (Promedio, p50, p95, p99, Throughput RPS, % Error) y genera un Dashboard HTML con gráficas.
 */
const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const http = require('http');
const fs = require('fs');
const path = require('path');
const { NestFactory } = require('@nestjs/core');
const distRoot = fs.existsSync(path.join(__dirname, '../../dist/app.module.js'))
  ? '../../dist'
  : '../../dist/src';
const { AppModule } = require(`${distRoot}/app.module`);
const { TransformInterceptor } = require(`${distRoot}/common/interceptors/transform.interceptor`);

const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

function makeRequest(endpointPath, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const start = performance.now();
    const payload = body ? JSON.stringify(body) : null;

    const req = http.request(
      `${BASE_URL}${endpointPath}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
        timeout: 8000,
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          const duration = performance.now() - start;
          resolve({
            status: res.statusCode,
            duration,
            ok: res.statusCode >= 200 && res.statusCode < 400,
          });
        });
      },
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, duration: performance.now() - start, ok: false });
    });

    req.on('error', () => {
      resolve({ status: 503, duration: performance.now() - start, ok: false });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

function calculateStats(results, elapsedSeconds) {
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const total = durations.length;
  const successes = results.filter((r) => r.ok).length;
  const failures = total - successes;

  const avg = durations.reduce((a, b) => a + b, 0) / (total || 1);
  const min = durations[0] || 0;
  const max = durations[total - 1] || 0;
  const p50 = durations[Math.floor(total * 0.5)] || 0;
  const p95 = durations[Math.floor(total * 0.95)] || 0;
  const p99 = durations[Math.floor(total * 0.99)] || 0;
  const rps = total / (elapsedSeconds || 1);
  const errorRate = (failures / (total || 1)) * 100;

  return {
    totalRequests: total,
    successes,
    failures,
    avgMs: Number(avg.toFixed(2)),
    minMs: Number(min.toFixed(2)),
    maxMs: Number(max.toFixed(2)),
    p50Ms: Number(p50.toFixed(2)),
    p95Ms: Number(p95.toFixed(2)),
    p99Ms: Number(p99.toFixed(2)),
    rps: Number(rps.toFixed(2)),
    errorRatePercent: Number(errorRate.toFixed(2)),
  };
}

async function runStage(name, concurrency, iterationsPerUser, endpoints) {
  const allResults = [];
  const startStage = performance.now();

  const workers = Array.from({ length: concurrency }, async (_, userIdx) => {
    for (let i = 0; i < iterationsPerUser; i++) {
      const ep = endpoints[(userIdx + i) % endpoints.length];
      const res = await makeRequest(ep.path, ep.method, ep.body);
      allResults.push(res);
    }
  });

  await Promise.all(workers);
  const elapsedSeconds = (performance.now() - startStage) / 1000;
  const stats = calculateStats(allResults, elapsedSeconds);

  return {
    stage: name,
    concurrency,
    elapsedSeconds: Number(elapsedSeconds.toFixed(2)),
    ...stats,
  };
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS NO FUNCIONALES (RENDIMIENTO Y ESTRÉS)');
  console.log('   Proyecto: SIGB - Universidad de Madeira (NestJS + Neon PostgreSQL)');
  console.log('========================================================================\n');

  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(PORT, '127.0.0.1');

  const coreEndpoints = [
    { path: '/resources', method: 'GET' },
    { path: '/loans', method: 'GET' },
    { path: '/reservations', method: 'GET' },
    { path: '/fines', method: 'GET' },
    { path: '/users', method: 'GET' },
  ];

  // 1. PRUEBAS DE RENDIMIENTO (20 a 50 usuarios concurrentes)
  console.log('📊 1. Ejecutando Pruebas de Rendimiento (Concurrencia Moderada: 20 a 50 Usuarios)...');
  const performanceStages = [];
  for (const vu of [20, 35, 50]) {
    const res = await runStage(`Rendimiento ${vu} VUs`, vu, 3, coreEndpoints);
    performanceStages.push(res);
    console.log(
      `   ✔ [${res.stage}] Req: ${res.totalRequests} | Promedio: ${res.avgMs} ms | p95: ${res.p95Ms} ms | Throughput: ${res.rps} req/s | Errores: ${res.errorRatePercent}%`,
    );
  }

  // 2. PRUEBAS DE ESTRÉS EN RAMPA (Escalado progresivo hasta límite y recuperación)
  console.log('\n🔥 2. Ejecutando Pruebas de Estrés en Rampa (Escalado Progresivo y Recuperación)...');
  const stressRamp = [
    { label: 'Fase 1: Base (25 VUs)', vu: 25, iter: 2 },
    { label: 'Fase 2: Moderada (50 VUs)', vu: 50, iter: 2 },
    { label: 'Fase 3: Alta (100 VUs)', vu: 100, iter: 2 },
    { label: 'Fase 4: Crítica (180 VUs)', vu: 180, iter: 2 },
    { label: 'Fase 5: Saturación Pool DB (260 VUs)', vu: 260, iter: 1 },
    { label: 'Fase 6: Recuperación / Cooldown (25 VUs)', vu: 25, iter: 2 },
  ];

  const stressStages = [];
  for (const step of stressRamp) {
    const res = await runStage(step.label, step.vu, step.iter, coreEndpoints);
    stressStages.push(res);
    console.log(
      `   ✔ [${res.stage}] Req: ${res.totalRequests} | Promedio: ${res.avgMs} ms | p95: ${res.p95Ms} ms | Throughput: ${res.rps} req/s | Errores: ${res.errorRatePercent}%`,
    );
  }

  await app.close();

  const reportData = {
    project: 'Sistema Integrado de Gestión Bibliotecaria (SIGB) - Universidad de Madeira',
    executedAt: new Date().toISOString(),
    environment: 'Node.js v24 + NestJS 10 + PostgreSQL Neon Pooler (AWS us-east-2)',
    performanceStages,
    stressStages,
  };

  const jsonPath = path.join(__dirname, 'performance-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2), 'utf-8');

  const htmlPath = path.join(__dirname, 'reporte-rendimiento-estres.html');
  fs.writeFileSync(htmlPath, generateHtmlReport(reportData), 'utf-8');

  console.log('\n========================================================================');
  console.log(`✅ Reporte JSON guardado en: ${jsonPath}`);
  console.log(`✅ Dashboard HTML con gráficas generado en: ${htmlPath}`);
  console.log('========================================================================');
}

function generateHtmlReport(data) {
  const perfLabels = JSON.stringify(data.performanceStages.map((s) => s.stage));
  const perfAvg = JSON.stringify(data.performanceStages.map((s) => s.avgMs));
  const perfP95 = JSON.stringify(data.performanceStages.map((s) => s.p95Ms));
  const perfRps = JSON.stringify(data.performanceStages.map((s) => s.rps));

  const stressLabels = JSON.stringify(data.stressStages.map((s) => s.stage));
  const stressAvg = JSON.stringify(data.stressStages.map((s) => s.avgMs));
  const stressP95 = JSON.stringify(data.stressStages.map((s) => s.p95Ms));
  const stressRps = JSON.stringify(data.stressStages.map((s) => s.rps));

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de Rendimiento y Estrés - SIGB Universidad de Madeira</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px; }
    .container { max-width: 1150px; margin: 0 auto; }
    header { background: linear-gradient(135deg, #1e1b4b, #4338ca); color: white; padding: 28px 32px; border-radius: 16px; margin-bottom: 28px; box-shadow: 0 10px 25px rgba(67,56,202,0.18); }
    h1 { margin: 0 0 8px 0; font-size: 24px; }
    .subtitle { margin: 0; opacity: 0.85; font-size: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .card { background: white; border-radius: 14px; padding: 22px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .card h2 { margin-top: 0; font-size: 17px; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #334155; }
    .badge-ok { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 999px; font-weight: 600; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Informe de Pruebas de Rendimiento y Estrés — SIGB Universidad de Madeira</h1>
      <p class="subtitle">Entorno: ${data.environment} | Fecha: ${data.executedAt}</p>
    </header>

    <div class="grid">
      <div class="card">
        <h2>1. Pruebas de Rendimiento (Latencia Promedio vs Percentil 95 - ms)</h2>
        <canvas id="perfChart" height="190"></canvas>
      </div>
      <div class="card">
        <h2>2. Pruebas de Estrés en Rampa y Recuperación (Latencia p95 vs Promedio - ms)</h2>
        <canvas id="stressChart" height="190"></canvas>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <h2>Tabla Detallada de Resultados — Pruebas de Rendimiento (20 a 50 Usuarios Concurrentes)</h2>
      <table>
        <thead>
          <tr>
            <th>Escenario</th>
            <th>Usuarios (VUs)</th>
            <th>Peticiones</th>
            <th>Promedio (ms)</th>
            <th>Mediana p50 (ms)</th>
            <th>Latencia p95 (ms)</th>
            <th>Throughput (req/s)</th>
            <th>Tasa de Error</th>
          </tr>
        </thead>
        <tbody>
          ${data.performanceStages
            .map(
              (s) => `<tr>
            <td><strong>${s.stage}</strong></td>
            <td>${s.concurrency}</td>
            <td>${s.totalRequests}</td>
            <td>${s.avgMs} ms</td>
            <td>${s.p50Ms} ms</td>
            <td><strong>${s.p95Ms} ms</strong></td>
            <td>${s.rps} req/s</td>
            <td><span class="badge-ok">${s.errorRatePercent}%</span></td>
          </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>Tabla Detallada de Resultados — Pruebas de Estrés en Rampa (Hasta 260 Usuarios Concurrentes + Cooldown)</h2>
      <table>
        <thead>
          <tr>
            <th>Fase de Rampa</th>
            <th>Usuarios (VUs)</th>
            <th>Peticiones</th>
            <th>Promedio (ms)</th>
            <th>Mediana p50 (ms)</th>
            <th>Latencia p95 (ms)</th>
            <th>Latencia p99 (ms)</th>
            <th>Throughput (req/s)</th>
            <th>Tasa de Error</th>
          </tr>
        </thead>
        <tbody>
          ${data.stressStages
            .map(
              (s) => `<tr>
            <td><strong>${s.stage}</strong></td>
            <td>${s.concurrency}</td>
            <td>${s.totalRequests}</td>
            <td>${s.avgMs} ms</td>
            <td>${s.p50Ms} ms</td>
            <td><strong>${s.p95Ms} ms</strong></td>
            <td>${s.p99Ms} ms</td>
            <td>${s.rps} req/s</td>
            <td><span class="badge-ok">${s.errorRatePercent}%</span></td>
          </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    new Chart(document.getElementById('perfChart'), {
      type: 'bar',
      data: {
        labels: ${perfLabels},
        datasets: [
          { label: 'Tiempo Respuesta Promedio (ms)', data: ${perfAvg}, backgroundColor: '#6366f1' },
          { label: 'Latencia Percentil 95 - p95 (ms)', data: ${perfP95}, backgroundColor: '#f59e0b' },
        ]
      }
    });

    new Chart(document.getElementById('stressChart'), {
      type: 'line',
      data: {
        labels: ${stressLabels},
        datasets: [
          { label: 'Latencia p95 (ms)', data: ${stressP95}, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.12)', fill: true, tension: 0.3 },
          { label: 'Latencia Promedio (ms)', data: ${stressAvg}, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3 }
        ]
      }
    });
  </script>
</body>
</html>`;
}

main().catch((err) => {
  console.error('Error en suite de rendimiento:', err);
  process.exit(1);
});
