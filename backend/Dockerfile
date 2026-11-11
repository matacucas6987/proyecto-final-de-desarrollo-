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

# Exponer el puerto de NestJS
EXPOSE 3000

# Comando para ejecutar en desarrollo con recarga en caliente
CMD ["npm", "run", "start:dev"]
