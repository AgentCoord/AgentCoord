# AgentCoord: Visually Exploring Coordination Strategy for LLM-based Multi-Agent Collaboration
<p align="center">
<a ><img src="https://github.com/bopan3/AgentCoord_Backend/assets/21981916/bbad2f66-368f-488a-af36-72e79fdb6805" alt=" AgentCoord: Visually Exploring Coordination Strategy for LLM-based Multi-Agent Collaboration" width="200px"></a>
</p>
AgentCoord is an experimental open-source system to help general users design coordination strategies for multiple LLM-based agents (Research paper forthcoming).

## System Usage
<a href="https://youtu.be/s56rHJx-eqY" target="_blank"><img src="https://github.com/bopan3/AgentCoord_Backend/assets/21981916/0d907e64-2a25-4bdf-977d-e90197ab1aab" 
alt="System Usage Video" width="800" border="5" /></a>

## Installation

### Install with Docker (Recommended)

If you have installed [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/) on your machine, we recommend running AgentCoord in docker：

Step 1: Clone the project:
```bash
git clone https://github.com/AgentCoord/AgentCoord.git 
cd AgentCoord
```
Step 2: Config LLM (see [LLM configration](readme.md### LLM configuration)):
and start the servers 
Step 2: Open http://localhost:8080/ to use the system.

### Install on your machine

If you want to install and run AgentCoord on your machine without using docker:

Step 1: Clone the project
```bash
git clone https://github.com/AgentCoord/AgentCoord.git 
cd AgentCoord
```
Step 2: Install required packages for the backend and frontend servers (see readme.md in ./frontend and ./backend folders)

Step 3: Run the backend and frontend servers separately (see readme.md in ./frontend and ./backend folders). 

Step 4: Open http://localhost:8080/ to use the system.

## Configuration 
### LLM configuration
You can set the configuration (i.e. API base, API key, Model name, Max tokens, Response per minute) for default LLM in ./backend/config/config.yaml. Currently, we only support OpenAI’s LLMs as the default model. We recommend using gpt-4-0125-preview as the default model (WARNING: the execution process of multiple agents may consume a significant number of tokens). 

You can switch to a fast mode that uses the Mistral 8×7B model with hardware acceleration by [Groq](https://groq.com/) for the first time in strategy generation to strike a balance of response quality and efficiency. To achieve this, you need to set the FAST_DESIGN_MODE field in the yaml file as True and fill the GROQ_API_KEY field with the api key of [Groq](https://wow.groq.com/).

### Agent configuration
Currently, we support config agents by [role-prompting](https://arxiv.org/abs/2305.14688). You can customize your agents by changing the role prompts in AgentRepo\agentBoard_v1.json. We plan to support more methods to customize agents (e.g., supporting RAG, or providing a unified wrapper for customized agents). 


## More Papers & Projects for LLM-based Multi-Agent Collaboration
If you’re interested in LLM-based multi-agent collaboration and want more papers & projects for reference, you may check out the corpus collected by us:





