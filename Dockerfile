FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
COPY --from=frontend-build /frontend/dist ./public
RUN mkdir -p /data/uploads /data/covers /data/artist-images /data/catalog-covers

# Install ffmpeg, python3, wget + latest yt-dlp binary
RUN apk add --no-cache python3 py3-pip ffmpeg wget curl ca-certificates && \
    wget -q "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp" \
         -O /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp && \
    yt-dlp --version

EXPOSE ${PORT:-4000}
CMD ["node", "server.js"]
