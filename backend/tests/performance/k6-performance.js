/**
 * SIGB Universidad de Madeira - Prueba de Rendimiento (Grafana k6)
 * Escenario: Carga moderada y realista (20 a 50 usuarios concurrentes durante 3 minutos)
 * Ejecución: k6 run tests/performance/k6-performance.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Subida progresiva a 20 usuarios concurrentes
    { duration: '1m30s', target: 50 }, // Carga sostenida de 50 usuarios simultáneos
    { duration: '30s', target: 20 }, // Descenso moderado
    { duration: '30s', target: 0 },  // Enfriamiento (cooldown)
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'], // El 95% de las solicitudes deben responder en < 600ms
    http_req_failed: ['rate<0.02'],   // Tasa de error inferior al 2%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';

export default function () {
  // 1. Consulta del Catálogo Bibliográfico y Colecciones
  const resCatalog = http.get(`${BASE_URL}/resources`);
  check(resCatalog, {
    'Catálogo status 200': (r) => r.status === 200,
    'Catálogo retorna array': (r) => r.json('success') === true,
  });

  // 2. Consulta de Circulación / Préstamos activos
  const resLoans = http.get(`${BASE_URL}/loans`);
  check(resLoans, {
    'Préstamos status 200': (r) => r.status === 200,
  });

  // 3. Consulta de Cola de Reservas
  const resReservations = http.get(`${BASE_URL}/reservations`);
  check(resReservations, {
    'Reservas status 200': (r) => r.status === 200,
  });

  sleep(1);
}
