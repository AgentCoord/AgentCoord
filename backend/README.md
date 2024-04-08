# AgentCoord Backend
This is the backend for the AgentCoord project. Root project is located [here](https://github.com/AgentCoord/AgentCoord). See [LLM configuration](README.md#llm-configuration) for LLM configuration before you launch the backend server.

## Launch

You can launch the backend by simply using `docker-compose` in the root directory of the project.

Or, you can launch the backend manually by following the steps below.

1. Install the dependencies by running `pip install -r requirements.txt`.
```bash
pip install -r ./requirements.txt
```

2. launch the backend server (the default port is 8017)
```bash
python ./server.py --port 8017
```



