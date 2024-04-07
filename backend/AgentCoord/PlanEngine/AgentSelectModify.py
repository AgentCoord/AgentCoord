import json
from AgentCoord.util.converter import read_LLM_Completion
from typing import List, Dict
from pydantic import BaseModel, RootModel

PROMPT_ABILITY_REQUIREMENT_GENERATION = """
## Instruction
Based on "General Goal" and "Current Task", output a formatted "Ability Requirement" which lists at least 3 different ability requirement that is required by the "Current Task". The ability should be summarized concisely within a few words.

## General Goal (The general goal for the collaboration plan, "Current Task" is just one of its substep)
{General_Goal}

## Current Task
{Current_Task}

## Output Format Example (Specify the output format)
```json
{{
    "AbilityRequirement":["Critical Thinking", "Understanding of VR", "Story Structuring Skill"]
}}
```

"""


class JSON_ABILITY_REQUIREMENT_GENERATION(BaseModel):
    AbilityRequirement: List[str]


def generate_AbilityRequirement(General_Goal, Current_Task):
    messages = [
        {
            "role": "system",
            "content": f" The JSON object must use the schema: {json.dumps(JSON_ABILITY_REQUIREMENT_GENERATION.model_json_schema(), indent=2)}",
        },
        {
            "role": "system",
            "content": PROMPT_ABILITY_REQUIREMENT_GENERATION.format(
                General_Goal=General_Goal,
                Current_Task=json.dumps(Current_Task, indent=4),
            ),
        },
    ]
    print(messages[1]["content"])
    return read_LLM_Completion(messages)["AbilityRequirement"]


PROMPT_AGENT_ABILITY_SCORING = """
## Instruction
Based on "Agent Board" and "Ability Requirement", output a score for each agent to estimate the possibility that the agent can fulfil the "Ability Requirement". The score should be 1-5. Provide a concise reason before you assign the score.

## AgentBoard
{Agent_Board}

## Ability Requirement
{Ability_Requirement}

## Attention
Do not omit any agent from the agentboard.

## Output Format Example (Specify the output format)
```json
{{
    "Sam":{{
        "Reason":"...",
        "Score": 1
    }},
    "Alice":{{
        "Reason":"...",
        "Score": 5
    }}
}}
```

"""


class JSON_Agent(BaseModel):
    Reason: str
    Score: int


class JSON_AGENT_ABILITY_SCORING(RootModel):
    root: Dict[str, JSON_Agent]


def agentAbilityScoring(Agent_Board, Ability_Requirement_List):
    scoreTable = {}
    for Ability_Requirement in Ability_Requirement_List:
        messages = [
            {
                "role": "system",
                "content": f" The JSON object must use the schema: {json.dumps(JSON_AGENT_ABILITY_SCORING.model_json_schema(), indent=2)}",
            },
            {
                "role": "system",
                "content": PROMPT_AGENT_ABILITY_SCORING.format(
                    Agent_Board=json.dumps(Agent_Board, indent=4),
                    Ability_Requirement=Ability_Requirement,
                ),
            },
        ]
        print(messages[1]["content"])
        scoreTable[Ability_Requirement] = read_LLM_Completion(messages)
    return scoreTable


def AgentSelectModify_init(stepTask, General_Goal, Agent_Board):
    Current_Task = {
        "TaskName": stepTask["StepName"],
        "InputObject_List": stepTask["InputObject_List"],
        "OutputObject": stepTask["OutputObject"],
        "TaskContent": stepTask["TaskContent"],
    }
    messages = [
        {
            "role": "system",
            "content": f" The JSON object must use the schema: {json.dumps(JSON_ABILITY_REQUIREMENT_GENERATION.model_json_schema(), indent=2)}",
        },
        {
            "role": "system",
            "content": PROMPT_ABILITY_REQUIREMENT_GENERATION.format(
                General_Goal=General_Goal,
                Current_Task=json.dumps(Current_Task, indent=4),
            ),
        },
    ]
    Ability_Requirement_List = read_LLM_Completion(messages)[
        "AbilityRequirement"
    ]
    scoreTable = agentAbilityScoring(Agent_Board, Ability_Requirement_List)
    return scoreTable


def AgentSelectModify_addAspect(aspectList, Agent_Board):
    scoreTable = agentAbilityScoring(Agent_Board, aspectList)
    return scoreTable
