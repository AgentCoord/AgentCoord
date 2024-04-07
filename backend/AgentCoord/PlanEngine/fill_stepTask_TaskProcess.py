from AgentCoord.PlanEngine.taskProcess_Generator import generate_TaskProcess
import AgentCoord.util as util


def fill_stepTask_TaskProcess(General_Goal, stepTask, AgentProfile_Dict):
    AgentSelection = stepTask["AgentSelection"]
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
