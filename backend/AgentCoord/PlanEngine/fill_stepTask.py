from AgentCoord.PlanEngine.AgentSelection_Generator import (
    generate_AgentSelection,
)
from AgentCoord.PlanEngine.taskProcess_Generator import generate_TaskProcess
import AgentCoord.util as util


def fill_stepTask(General_Goal, stepTask, Agent_Board, AgentProfile_Dict):
    Current_Task = {
        "TaskName": stepTask["StepName"],
        "InputObject_List": stepTask["InputObject_List"],
        "OutputObject": stepTask["OutputObject"],
        "TaskContent": stepTask["TaskContent"],
    }
    AgentSelection = generate_AgentSelection(
        General_Goal=General_Goal,
        Current_Task=Current_Task,
        Agent_Board=Agent_Board,
    )
    Current_Task_Description = {
        "TaskName": stepTask["StepName"],
        "AgentInvolved": [
            {"Name": name, "Profile": AgentProfile_Dict[name]}
            for name in AgentSelection
        ],
        "InputObject_List": stepTask["InputObject_List"],
        "OutputObject": stepTask["OutputObject"],
        "CurrentTaskDescription": util.generate_template_sentence_for_CollaborationBrief(
            stepTask["InputObject_List"],
            stepTask["OutputObject"],
            AgentSelection,
            stepTask["TaskContent"],
        ),
    }
    TaskProcess = generate_TaskProcess(
        General_Goal=General_Goal,
        Current_Task_Description=Current_Task_Description,
    )
    # add the generated AgentSelection and TaskProcess to the stepItem
    stepTask["AgentSelection"] = AgentSelection
    stepTask["TaskProcess"] = TaskProcess
    return stepTask
