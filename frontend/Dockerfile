FROM node:24-alpine3.24

WORKDIR /app

# Instalar dependencias del sistema requeridas
RUN apk add --no-cache libc6-compat

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Iniciar servidor de desarrollo con soporte explícito para --host
CMD ["npm", "run", "dev", "--", "--host"]
