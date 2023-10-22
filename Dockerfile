###################
# BUILD FOR DEVELOPMENT
###################

FROM debian:bullseye-slim AS development
ENV NODE_ENV development

# Instalacja narzędzi
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential

# Instalacja Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Ustawienie katalogu roboczego
WORKDIR /usr/app/home-iot-server

# Instalacja zależności
COPY package*.json ./
RUN npm install

# Kopiowanie reszty plików
COPY . .

# Uruchomienie aplikacji
#CMD [ "sudo", "npm", "run", "start:dev" ]
