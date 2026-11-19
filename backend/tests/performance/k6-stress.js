/**
 * SIGB Universidad de Madeira - Prueba de Estrés en Rampa (Grafana k6)
 * Escenario: Incremento progresivo de usuarios concurrentes hasta detectar el punto de quiebre
 * y evaluación de recuperación (cooldown).
 * Ejecución: k6 run tests/performance/k6-stress.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 30 },  // Fase 1: Carga normal (30 VUs)
    { duration: '30s', target: 80 },  // Fase 2: Carga alta (80 VUs)
    { duration: '30s', target: 150 }, // Fase 3: Carga crítica (150 VUs)
    { duration: '30s', target: 250 }, // Fase 4: Punto de saturación / estrés extremo (250 VUs)
    { duration: '30s', target: 350 }, // Fase 5: Punto de quiebre del pool de conexiones DB (350 VUs)
    { duration: '40s', target: 20 },  // Fase 6: Descenso y evaluación de recuperación del servidor
    { duration: '20s', target: 0 },   // Fase 7: Enfriamiento total
  ],
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/resources`],
    ['GET', `${BASE_URL}/loans`],
    ['GET', `${BASE_URL}/reservations`],
    ['GET', `${BASE_URL}/users`],
  ]);

  check(responses[0], {
    'Status 200 en Catálogo': (r) => r.status === 200,
  });

  sleep(0.5);
}
