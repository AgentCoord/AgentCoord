from AgentCoord.PlanEngine.planOutline_Generator import generate_PlanOutline
from AgentCoord.PlanEngine.AgentSelection_Generator import (
    generate_AgentSelection,
)
from AgentCoord.PlanEngine.taskProcess_Generator import generate_TaskProcess
import AgentCoord.util as util


def generate_basePlan(
    General_Goal, Agent_Board, AgentProfile_Dict, InitialObject_List
):
    basePlan = {
        "Initial Input Object": InitialObject_List,
        "Collaboration Process": [],
    }
    PlanOutline = generate_PlanOutline(
        InitialObject_List=[], General_Goal=General_Goal
    )
    for stepItem in PlanOutline:
        Current_Task = {
            "TaskName": stepItem["StepName"],
            "InputObject_List": stepItem["InputObject_List"],
            "OutputObject": stepItem["OutputObject"],
            "TaskContent": stepItem["TaskContent"],
        }
        AgentSelection = generate_AgentSelection(
            General_Goal=General_Goal,
            Current_Task=Current_Task,
            Agent_Board=Agent_Board,
        )
        Current_Task_Description = {
            "TaskName": stepItem["StepName"],
            "AgentInvolved": [
                {"Name": name, "Profile": AgentProfile_Dict[name]}
                for name in AgentSelection
            ],
            "InputObject_List": stepItem["InputObject_List"],
            "OutputObject": stepItem["OutputObject"],
            "CurrentTaskDescription": util.generate_template_sentence_for_CollaborationBrief(
                stepItem["InputObject_List"],
                stepItem["OutputObject"],
                AgentSelection,
                stepItem["TaskContent"],
            ),
        }
        TaskProcess = generate_TaskProcess(
            General_Goal=General_Goal,
            Current_Task_Description=Current_Task_Description,
        )
        # add the generated AgentSelection and TaskProcess to the stepItem
        stepItem["AgentSelection"] = AgentSelection
        stepItem["TaskProcess"] = TaskProcess
        basePlan["Collaboration Process"].append(stepItem)
    basePlan["General Goal"] = General_Goal
    return basePlan
