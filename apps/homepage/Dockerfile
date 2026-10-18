# Imagem nginx que já roda como usuário sem privilégio (uid 101) e escuta na 8080.
FROM nginxinc/nginx-unprivileged:1.30-alpine

# A imagem base atrasa patches do Alpine; aplicamos os de segurança no build
# e o CI reconstrói toda semana (schedule) para pegar os próximos.
USER 0
# hadolint ignore=DL3017
RUN apk upgrade --no-cache
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/healthz"]
