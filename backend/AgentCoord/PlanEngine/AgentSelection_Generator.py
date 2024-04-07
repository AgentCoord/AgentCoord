import json
from AgentCoord.util.converter import read_LLM_Completion
from typing import List
from pydantic import BaseModel
import random

MIN_TEAM_SIZE = 2  # the minimum number of agent allowed in a task for the initial coordination strategy.
MAX_TEAM_SIZE = 3  # the maximun number of agent allowed in a task for the initial coordination strategy. You can set it as any number that is larger than MIN_TEAM_SIZE. Recomend to start with less agents and manually add more.

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


PROMPT_AGENT_SELECTION_GENERATION = """
## Instruction
Based on "General Goal", "Current Task" and "Agent Board", output a formatted "Agent Selection Plan". Your selection should consider the ability needed for "Current Task" and the profile of each agent in "Agent Board".

## General Goal (Specify the general goal for the collaboration plan)
{General_Goal}

## Current Task
{Current_Task}

## Agent Board (Specify the list of agents available for selection)
{Agent_Board}

## Attention
Just use agents in Agent Board.

## Output Format Example (Select one or more agent)
```json
{{
    "AgentSelectionPlan": ["Alice","Bob"]
}}
```

"""


class JSON_AGENT_SELECTION_GENERATION(BaseModel):
    AgentSelectionPlan: List[str]


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


def generate_AgentSelection(General_Goal, Current_Task, Agent_Board):
    messages = [
        {
            "role": "system",
            "content": f" The JSON object must use the schema: {json.dumps(JSON_AGENT_SELECTION_GENERATION.model_json_schema(), indent=2)}",
        },
        {
            "role": "system",
            "content": PROMPT_AGENT_SELECTION_GENERATION.format(
                General_Goal=General_Goal,
                Current_Task=json.dumps(Current_Task, indent=4),
                Agent_Board=json.dumps(Agent_Board, indent=4),
            ),
        },
    ]
    print(messages[1]["content"])

    agentboard_set = {agent["Name"] for agent in Agent_Board}

    while True:
        candidate = read_LLM_Completion(messages)["AgentSelectionPlan"]
        if len(candidate) > MAX_TEAM_SIZE:
            teamSize = random.randint(2, MAX_TEAM_SIZE)
            candidate = candidate[0:teamSize]
        elif len(candidate) < MIN_TEAM_SIZE:
            continue
        AgentSelectionPlan = sorted(candidate)
        AgentSelectionPlan_set = set(AgentSelectionPlan)

        # Check if every item in AgentSelectionPlan is in agentboard
        if AgentSelectionPlan_set.issubset(agentboard_set):
            break  # If all items are in agentboard, break the loop

    # AgentSelectionPlan= sorted(read_LLM_Completion(messages)["AgentSelectionPlan"]) # sort the select agent list for unique sequence
    return AgentSelectionPlan
