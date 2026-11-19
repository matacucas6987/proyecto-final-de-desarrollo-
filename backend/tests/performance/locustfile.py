"""
SIGB Universidad de Madeira - Suite de Rendimiento y Estrés (Locust)
Ejecución con interfaz web en tiempo real:
  locust -f tests/performance/locustfile.py --host=http://localhost:3000
"""
from locust import HttpUser, task, between


class BibliotecaMadeiraUser(HttpUser):
    wait_time = between(0.5, 2.0)

    @task(4)
    def consultar_catalogo(self):
        """Flujo más frecuente: Búsqueda en Catálogo y Colecciones"""
        self.client.get("/api/resources", name="GET /api/resources (Catálogo)")

    @task(2)
    def consultar_prestamos(self):
        """Consulta de préstamos activos e historial"""
        self.client.get("/api/loans", name="GET /api/loans (Circulación)")

    @task(2)
    def consultar_cola_reservas(self):
        """Consulta de posición en cola de reservas"""
        self.client.get("/api/reservations", name="GET /api/reservations (Cola FIFO)")

    @task(1)
    def consultar_usuarios(self):
        """Consulta del directorio institucional"""
        self.client.get("/api/users", name="GET /api/users (Directorio)")
