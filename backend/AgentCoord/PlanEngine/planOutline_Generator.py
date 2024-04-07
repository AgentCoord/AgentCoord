from AgentCoord.util.converter import read_LLM_Completion
from typing import List
from pydantic import BaseModel
import json

PROMPT_PLAN_OUTLINE_GENERATION = """
## Instruction
Based on "Output Format Example", "General Goal", and "Initial Key Object List", output a formatted "Plan_Outline".

## Initial Key Object List (Specify the list of initial key objects available, each initial key object should be the input object of at least one Step)
{InitialObject_List}

## General Goal (Specify the general goal for the collaboration plan)
{General_Goal}

## Output Format Example (Specify the output format)
```json
{{
    "Plan_Outline": [
        {{
            "StepName": "Love Element Brainstorming",
            "TaskContent": "Decide the main love element in the love story.",
            "InputObject_List": [],
            "OutputObject": "Love Element"
        }},
        {{
            "StepName": "Story World Buiding",
            "TaskContent": "Build the world setting for the story.",
            "InputObject_List": [],
            "OutputObject": "World Setting"
        }},
        {{
            "StepName": "Story Outline Drafting",
            "TaskContent": "Draft the story outline for the story.",
            "InputObject_List": ["Love Element", "World Setting"],
            "OutputObject": "Story Outline"
        }},
        {{
            "StepName": "Final Story Writing",
            "TaskContent": "Writing the final story.",
            "InputObject_List": [],
            "OutputObject": "Completed Story"
        }}
    ]
}}
```

## Format Explaination (Explain the Output Format):
StepName: Provide a CONCISE and UNIQUE name for this step, smartly summarize what this step is doing.
TaskContent: Describe the task of the current step.
InputObject_List: The list of the input obejects that will be used in current step.
OutputObject: The name of the final output object of current step.

"""


class Step(BaseModel):
    StepName: str
    TaskContent: str
    InputObject_List: List[str]
    OutputObject: str


class PlanOutline(BaseModel):
    Plan_Outline: List[Step]

    class Config:
        extra = "allow"


def generate_PlanOutline(InitialObject_List, General_Goal):
    messages = [
        {
            "role": "system",
            "content": "You are a recipe database that outputs recipes in JSON.\n"
            f" The JSON object must use the schema: {json.dumps(PlanOutline.model_json_schema(), indent=2)}",
        },
        {
            "role": "system",
            "content": PROMPT_PLAN_OUTLINE_GENERATION.format(
                InitialObject_List=str(InitialObject_List),
                General_Goal=General_Goal,
            ),
        },
    ]
    return read_LLM_Completion(messages)["Plan_Outline"]
