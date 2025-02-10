# Pump Rand

## Install

First follow the instructions in our [GitBook](https://seismic-2.gitbook.io/seismic-book/onboarding/publish-your-docs) to install:

- cargo
- brew
- jq
- sfoundryup to install:
  - sanvil
  - sforge

### Javascript

First install bun:

```sh
curl -fsSL https://bun.sh/install | bash
```

Then from project root, run:

```sh
bun install
```

Note: Run all `bun install` commands from root. The only `node_modules/` with your JS packages should be the one at root. `vite` will create temp files in `frontend/web/node_modules`, but that's all that should live there

## Local development

Start `sanvil`, storing blockchain state to a local JSON:

```sh
sanvil --state ~/.anvil/pump.json
```

Copy over the `.env.anvil` to `.env` for deploying to anvil:

```sh
cp .env.anvil .env
```

Deploy the contract:

```sh
bun contract:deploy
```

Start local development server:

```sh
bun web:dev
```

Start backend:

```sh
cargo run --bin pump-rand-server
```
