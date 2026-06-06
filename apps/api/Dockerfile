FROM node:20-alpine
RUN npm i -g pnpm@9
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile=false
COPY packages/shared packages/shared
COPY apps/api apps/api
WORKDIR /repo/apps/api
RUN pnpm prisma generate && pnpm build
EXPOSE 4000
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]
