FROM node:lts-alpine as build

# bundler tag arg
ARG BUNDLER_VERSION

#install git, typescript and pnpm
RUN apk --no-cache add git && \
    npm add -g typescript pnpm

RUN pnpm --version

# set working directory
RUN git clone --branch $BUNDLER_VERSION https://github.com/wakeuplabs-io/pimlico-alto-smart-account-bundler.git /app

WORKDIR /app

RUN pnpm fetch

# install dependencies
RUN pnpm install -r

# build the bundler
RUN pnpm build

FROM node:lts-alpine as runner

# install pnpm
RUN npm add -g pnpm

# copy built app
COPY --from=build /app /app

# set working directory
WORKDIR /app

# run app
ENTRYPOINT ["sh", "alto" ]

CMD ["help"]