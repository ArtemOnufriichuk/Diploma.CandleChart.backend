FROM node
WORKDIR /app

COPY package.json .
RUN npm i

COPY . .
CMD ["npm", "run", "start-prod"]
