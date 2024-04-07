from AgentCoord.util.converter import read_LLM_Completion
import AgentCoord.util as util
from typing import List
from pydantic import BaseModel, Field
import json


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

PROMPT_TASK_PROCESS_BRANCHING = """
## Instruction
Based on "Existing Steps", your task is to comeplete the "Remaining Steps" for the "Task for Current Step".
Note: "Modification Requirement" specifies how to modify the "Baseline Completion" for a better/alternative solution.

## General Goal (The general goal for the collaboration plan, you just design the plan for one of its step (i.e. "Task for Current Step"))
{General_Goal}

## Task for Current Step
{Current_Task_Description}

## Action Set (The list of Action Type Available)
{Act_Set}

## Existing Steps
{Existing_Steps}

## Baseline Completion
{Baseline_Completion}

## Modification Requirement
{Modification_Requirement}

## Output Format Example (Specify the output format)
```json
{{
    "Remaining Steps": [
    {{
      "ID": "Action4",
      "ActionType": "Propose",
      "AgentName": "Mia",
      "Description": "Propose psychological theories on love and attachment that could be applied to AI's emotional development.",
      "ImportantInput": [
        "InputObject:Story Outline"
      ]
    }},
    {{
      "ID": "Action5",
      "ActionType": "Propose",
      "AgentName": "Noah",
      "Description": "Propose ethical considerations and philosophical questions regarding AI's capacity for love.",
      "ImportantInput": []
    }},
    {{
      "ID": "Action6",
      "ActionType": "Finalize",
      "AgentName": "Liam",
      "Description": "Combine the poetic elements and ethical considerations into a cohesive set of core love elements for the story.",
      "ImportantInput": [
        "ActionResult:Action1",
        "ActionResult:Action5"
      ]
    }}
  ]
}}

## Format Explaination (Explain the Output Format):
ImportantInput: Specify if there is any previous result that should be taken special consideration during the execution the action. Should be of format "InputObject:xx" or "ActionResult:xx".
InputObject_List: List existing objects that should be utilized in current step.
AgentName: Specify the agent who will perform the action, You CAN ONLY USE THE NAME APPEARS IN "AgentInvolved".
ActionType: Specify the type of action, note that only the last action can be of type "Finalize", and the last action must be "Finalize".

"""


class JSON_Step(BaseModel):
    ID: str
    ActionType: str
    AgentName: str
    Description: str
    ImportantInput: List[str]


class JSON_TASK_PROCESS_BRANCHING(BaseModel):
    Remaining_Steps: List[JSON_Step] = Field(..., alias="Remaining Steps")


def branch_TaskProcess(
    branch_Number,
    Modification_Requirement,
    Existing_Steps,
    Baseline_Completion,
    stepTaskExisting,
    General_Goal,
    AgentProfile_Dict,
):
    Current_Task_Description = {
        "TaskName": stepTaskExisting["StepName"],
        "AgentInvolved": [
            {"Name": name, "Profile": AgentProfile_Dict[name]}
            for name in stepTaskExisting["AgentSelection"]
        ],
        "InputObject_List": stepTaskExisting["InputObject_List"],
        "OutputObject": stepTaskExisting["OutputObject"],
        "CurrentTaskDescription": util.generate_template_sentence_for_CollaborationBrief(
            stepTaskExisting["InputObject_List"],
            stepTaskExisting["OutputObject"],
            stepTaskExisting["AgentSelection"],
            stepTaskExisting["TaskContent"],
        ),
    }
    prompt = PROMPT_TASK_PROCESS_BRANCHING.format(
        Modification_Requirement=Modification_Requirement,
        Current_Task_Description=json.dumps(
            Current_Task_Description, indent=4
        ),
        Existing_Steps=json.dumps(Existing_Steps, indent=4),
        Baseline_Completion=json.dumps(Baseline_Completion, indent=4),
        General_Goal=General_Goal,
        Act_Set=ACT_SET,
    )
    print(prompt)
    branch_List = []
    for i in range(branch_Number):
        messages = [
            {
                "role": "system",
                "content": f" The JSON object must use the schema: {json.dumps(JSON_TASK_PROCESS_BRANCHING.model_json_schema(), indent=2)}",
            },
            {"role": "system", "content": prompt},
        ]
        Remaining_Steps = read_LLM_Completion(messages, useGroq=False)[
            "Remaining Steps"
        ]

        branch_List.append(Remaining_Steps)
    return branch_List
