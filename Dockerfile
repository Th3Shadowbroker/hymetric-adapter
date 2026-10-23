FROM node:lts-trixie-slim

COPY --from=ghcr.io/pnpm/pnpm:12 /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm

RUN adduser appuser --uid 10001 --home /home/app
USER 10001

WORKDIR /home/app
COPY . .

EXPOSE 3000
RUN pnpm i
CMD ["pnpm", "start"]