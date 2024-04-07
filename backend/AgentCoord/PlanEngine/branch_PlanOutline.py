from AgentCoord.util.converter import read_LLM_Completion
import json
from typing import List
from pydantic import BaseModel, Field


PROMPT_PLAN_OUTLINE_BRANCHING = """
## Instruction
Based on "Existing Steps", your task is to comeplete the "Remaining Steps" for the plan for "General Goal".
Note: "Modification Requirement" specifies how to modify the "Baseline Completion" for a better/alternative solution.

## General Goal (Specify the general goal for the plan)
{General_Goal}

## Initial Key Object List (Specify the list of initial key objects available for use as the input object of a Step)
{InitialObject_List}

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
            "StepName": "xx",
            "TaskContent": "xxx...",
            "InputObject_List": [xx],
            "OutputObject": "xx"
        }},
        {{
            "StepName": "xx",
            "TaskContent": "xxx...",
            "InputObject_List": [xx],
            "OutputObject": "xx"
        }},
        {{
            "StepName": "xx",
            "TaskContent": "xxx...",
            "InputObject_List": [xx],
            "OutputObject": "xx"
        }}
    ]
}}
```

## Format Explaination (Explain the Output Format):
TaskContent: Describe the task of the current step.
InputObject_List: The list of the input obejects that will be used in current step.
OutputObject: The name of the final output object of current step.
StepName: Provide a CONCISE and UNIQUE name for this step, smartly summarize what this step is doing.

"""


class JSON_Step(BaseModel):
    StepName: str
    TaskContent: str
    InputObject_List: List[str]
    OutputObject: str


class JSON_PLAN_OUTLINE_BRANCHING(BaseModel):
    Remaining_Steps: List[JSON_Step] = Field(..., alias="Remaining Steps")


def branch_PlanOutline(
    branch_Number,
    Modification_Requirement,
    Existing_Steps,
    Baseline_Completion,
    InitialObject_List,
    General_Goal,
):
    prompt = PROMPT_PLAN_OUTLINE_BRANCHING.format(
        Modification_Requirement=Modification_Requirement,
        Existing_Steps=json.dumps(Existing_Steps, indent=4),
        Baseline_Completion=json.dumps(Baseline_Completion, indent=4),
        InitialObject_List=str(InitialObject_List),
        General_Goal=General_Goal,
    )
    print(prompt)
    branch_List = []
    for _ in range(branch_Number):
        messages = [
            {
                "role": "system",
                "content": f" The JSON object must use the schema: {json.dumps(JSON_PLAN_OUTLINE_BRANCHING.model_json_schema(), indent=2)}",
            },
            {"role": "system", "content": prompt},
        ]
        Remaining_Steps = read_LLM_Completion(messages, useGroq=False)[
            "Remaining Steps"
        ]
        branch_List.append(Remaining_Steps)
    return branch_List
