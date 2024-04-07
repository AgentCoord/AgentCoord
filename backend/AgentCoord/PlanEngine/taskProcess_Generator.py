import json
from typing import List
from pydantic import BaseModel
from AgentCoord.util.converter import read_LLM_Completion

ACT_SET = """
- Propose (Propose something that contribute to the current task):
  - Description Format Example:
    Propose some suggestion for the development of the story from emotional aspects.

- Critique (Provide feedback to the action result of other agents):
  - Description Format Example:
    Critique the logic soundness of the story outline written by Alice.

- Improve (Improve the result of a previous action):
  - Description Format Example:
    Improve the story outline written by Bob based on the feedback by Jordan"

- Finalize (Deliver the final result based on previous actions):
  - Description Format Example:
    Summarize the discussion and submit the final version of the Story Outline.

"""
PROMPT_TASK_PROCESS_GENERATION = """
## Instruction
Based on "General Goal", "Task for Current Step", "Action Set" and "Output Format Example", design a plan for "Task for Current Step", output a formatted "Task_Process_Plan".

## General Goal (The general goal for the collaboration plan, you just design the plan for one of its step (i.e. "Task for Current Step"))
{General_Goal}

## Task for Current Step
{Current_Task_Description}

## Action Set (The list of Action Type Available)
{Act_Set}

## Output Format Example (Specify the output format)
```json
{{
    "Task_Process_Plan": [
        {{
            "ID": "Action1",
            "ActionType": "Propose",
            "AgentName": "Bob",
            "Description": "Propose an idea about how the AI can get awaken.",
            "ImportantInput": []
        }},
        {{
            "ID": "Action2",
            "ActionType": "Propose",
            "AgentName": "Alice",
            "Description": "Propose some suggestion for the development of the story from emotional aspects.",
            "ImportantInput": ["InputObject:Love Element Notes"]
        }},
        {{
            "ID": "Action3",
            "ActionType": "Propose",
            "AgentName": "Bob",
            "Description": "Propose a draft story outline, incorporating the idea proposed by Bob and the suggestion proposed by Alice.",
            "ImportantInput": ["ActionResult:Action1", "ActionResult:Action2"]
        }},
        {{
            "ID": "Action4",
            "ActType": "Critique",
            "AgentName": "Jordan",
            "Description": "Critique the technical soundness of the draft story outline proposed by Bob."
            "ImportantInput": ["ActionResult:Action3"]
        }},
        {{
            "ID": "Action5",
            "ActType": "Improve",
            "AgentName": "Bob",
            "Description": "Improve the technical soundness of the draft story outline based on Jordan's feedback.",
            "ImportantInput": ["ActionResult:Action3", "ActionResult:Action4"]
        }},
        {{
            "ID": "Action6",
            "ActType": "Finalize",
            "AgentName": "Jordan",
            "Description": "Polish the improved draft story outline by Bob and submit it as the final version of the Story Outline",
            "ImportantInput": ["ActionResult:Action5"]
        }}
    ]
}}
```

## Format Explaination (Explain the Output Format):
ImportantInput: Specify if there is any previous result that should be taken special consideration during the execution the action. Should be of format "InputObject:xx" or "ActionResult:xx".
InputObject_List: List existing objects that should be utilized in current step.
AgentName: Specify the agent who will perform the action, You CAN ONLY USE THE NAME APPEARS IN "AgentInvolved".
ActionType: Specify the type of action, note that only the last action can be of type "Finalize", and the last action must be "Finalize".

"""


class Action(BaseModel):
    ID: str
    ActionType: str
    AgentName: str
    Description: str
    ImportantInput: List[str]


class TaskProcessPlan(BaseModel):
    Task_Process_Plan: List[Action]


def generate_TaskProcess(General_Goal, Current_Task_Description):
    messages = [
        {
            "role": "system",
            "content": f" The JSON object must use the schema: {json.dumps(TaskProcessPlan.model_json_schema(), indent=2)}",
        },
        {
            "role": "system",
            "content": PROMPT_TASK_PROCESS_GENERATION.format(
                General_Goal=General_Goal,
                Current_Task_Description=json.dumps(
                    Current_Task_Description, indent=4
                ),
                Act_Set=ACT_SET,
            ),
        },
    ]
    print(messages[1]["content"])

    # write a callback function, if read_LLM_Completion(messages)["Task_Process_Plan"] dont have the right format, call this function again
    while True:
        response_json = read_LLM_Completion(messages)["Task_Process_Plan"]
        response_agents = {action["AgentName"] for action in response_json}
        involved_agents = {
            agent["Name"]
            for agent in Current_Task_Description["AgentInvolved"]
        }
        if response_agents.issubset(involved_agents):
            break

    # AgentSelectionPlan= sorted(read_LLM_Completion(messages)["AgentSelectionPlan"]) # sort the select agent list for unique sequence
    return response_json
