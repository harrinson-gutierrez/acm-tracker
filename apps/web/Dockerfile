FROM node:20-alpine
RUN npm i -g pnpm@9
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile=false
WORKDIR /repo/apps/web
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
