FROM node:20-alpine AS builder

workdir /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run builder

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
