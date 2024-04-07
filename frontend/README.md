# AgentCoord Frontend

This is the frontend for the AgentCoord project. Root project is located [here](https://github.com/AgentCoord/AgentCoord)

## Installation

You can launch the frontend by simply using `docker-compose` in the root directory of the project.

Or, you can launch the frontend manually by following the steps below.

1. Install the dependencies by running `npm install`.

```bash
npm install
```

2. Build the frontend by running `npm run build`.

```bash
npm run build
```

3. Start the frontend by running `npm run serve`.

```bash
npm run serve
```

Then you can access the frontend by visiting `http://localhost:8080`.

## Development

You can run the frontend in development mode by running `npm run dev`.

```bash
npm run dev
```

The frontend website requires the backend server to be running. You can configure the backend server address by copying the `.env.example` file to `.env` and changing the `API_BASE` value to the backend server address.
