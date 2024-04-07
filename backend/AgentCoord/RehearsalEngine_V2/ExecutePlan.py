import AgentCoord.util as util
import AgentCoord.RehearsalEngine_V2.Action as Action
from termcolor import colored


# Accept inputs: num_StepToRun (the number of step to run, if None, run to the end), plan, RehearsalLog, AgentProfile_Dict
def executePlan(plan, num_StepToRun, RehearsalLog, AgentProfile_Dict):
    # Prepare for execution
    KeyObjects = {}
    finishedStep_index = -1
    for logNode in RehearsalLog:
        # Increment for finishedStep_index: finishedStep_index is the index of the lastest finished step seen in RehearsalLog, if no step finished yet, index will be -1
        if logNode["LogNodeType"] == "step":
            finishedStep_index += 1
        # Set existing key object
        if logNode["LogNodeType"] == "object":
            KeyObjects[logNode["NodeId"]] = logNode["content"]

    # Execute
    # specify which steps will be run
    if num_StepToRun is None:
        run_to = len(plan["Collaboration Process"])
    else:
        run_to = (finishedStep_index + 1) + num_StepToRun

    StepRun_count = 0  # count how many steps are run during execution
    # loop for each step to run
    for stepDescrip in plan["Collaboration Process"][
        (finishedStep_index + 1): run_to
    ]:
        StepRun_count += 1
        # collect infos for executing the current step
        StepName = (
            util.camel_case_to_normal(stepDescrip["StepName"])
            if util.is_camel_case(stepDescrip["StepName"])
            else stepDescrip["StepName"]
        )
        TaskContent = stepDescrip["TaskContent"]
        InputName_List = (
            [
                (
                    util.camel_case_to_normal(obj)
                    if util.is_camel_case(obj)
                    else obj
                )
                for obj in stepDescrip["InputObject_List"]
            ]
            if stepDescrip["InputObject_List"] is not None
            else None
        )
        OutputName = (
            util.camel_case_to_normal(stepDescrip["OutputObject"])
            if util.is_camel_case(stepDescrip["OutputObject"])
            else stepDescrip["OutputObject"]
        )
        Agent_List = stepDescrip["AgentSelection"]
        TaskProcess = stepDescrip["TaskProcess"]
        TaskDescription = (
            util.converter.generate_template_sentence_for_CollaborationBrief(
                input_object_list=InputName_List,
                output_object=OutputName,
                agent_list=Agent_List,
                step_task=TaskContent,
            )
        )

        # init log for RehearsalLog
        inputObject_Record = [
            {InputName: KeyObjects[InputName]} for InputName in InputName_List
        ]
        stepLogNode = {
            "LogNodeType": "step",
            "NodeId": StepName,
            "InputName_List": InputName_List,
            "OutputName": OutputName,
            "chatLog": [],
            "inputObject_Record": inputObject_Record,
        }
        objectLogNode = {
            "LogNodeType": "object",
            "NodeId": OutputName,
            "content": None,
        }

        # start the group chat
        util.print_colored(TaskDescription, text_color="green")
        ActionHistory = []
        for ActionInfo in TaskProcess:
            actionType = ActionInfo["ActionType"]
            agentName = ActionInfo["AgentName"]
            if actionType in Action.customAction_Dict:
                currentAction = Action.customAction_Dict[actionType](
                    info=ActionInfo,
                    OutputName=OutputName,
                    KeyObjects=KeyObjects,
                )
            else:
                currentAction = Action.BaseAction(
                    info=ActionInfo,
                    OutputName=OutputName,
                    KeyObjects=KeyObjects,
                )
            ActionInfo_with_Result = currentAction.run(
                General_Goal=plan["General Goal"],
                TaskDescription=TaskDescription,
                agentName=agentName,
                AgentProfile_Dict=AgentProfile_Dict,
                InputName_List=InputName_List,
                OutputName=OutputName,
                KeyObjects=KeyObjects,
                ActionHistory=ActionHistory,
            )
            ActionHistory.append(ActionInfo_with_Result)
        # post processing for the group chat (finish)
        objectLogNode["content"] = KeyObjects[OutputName]
        RehearsalLog.append(stepLogNode)
        RehearsalLog.append(objectLogNode)
        stepLogNode["ActionHistory"] = ActionHistory

    # Return Output
    print(
        colored(
            "$Run " + str(StepRun_count) + "step$",
            color="black",
            on_color="on_white",
        )
    )
    return RehearsalLog
