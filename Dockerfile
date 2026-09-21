# Build from the last local production image so deploys work when Docker Hub / npm are blocked.
ARG BASE_IMAGE=toyooran:latest
FROM ${BASE_IMAGE}
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --prefer-offline --no-audit --no-fund
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]
