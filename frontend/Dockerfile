FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-alpine
WORKDIR /app
ENV API_PROXY_TARGET=http://backend:8000
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
