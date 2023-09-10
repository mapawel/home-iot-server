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

# Dodanie użytkownika 'node'
RUN useradd -m node

# Instalacja Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Ustawienie użytkownika i katalogu roboczego
USER node
WORKDIR /usr/app/home-iot-server

# Instalacja zależności
COPY --chown=node:node package*.json ./
RUN npm install

# Kopiowanie reszty plików
COPY --chown=node:node . .

# Uruchomienie aplikacji
CMD [ "sudo", "npm", "run", "start:dev" ]
