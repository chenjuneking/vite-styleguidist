FROM node:16-alpine AS deps

ENV TZ Asia/Shanghai
WORKDIR /app

RUN yarn add vitepress@1.0.0-alpha.4

EXPOSE 4876

USER node

CMD [ "npx", "vitepress", "serve", "docs", "--port", "4876" ]