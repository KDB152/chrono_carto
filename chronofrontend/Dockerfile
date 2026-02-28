FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy everything (including src/app/globals.css)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

