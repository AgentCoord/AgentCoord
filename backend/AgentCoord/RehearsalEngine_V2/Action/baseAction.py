from AgentCoord.LLMAPI.LLMAPI import LLM_Completion
from AgentCoord.util.colorLog import print_colored
import copy
PROMPT_TEMPLATE_TAKE_ACTION_BASE = '''
Your name is {agentName}. You will play the role as the Profile indicates.
Profile: {agentProfile}

You are within a multi-agent collaboration for the "Current Task". 
Now it's your turn to take action. Read the "Context Information" and take your action following "Instruction for Your Current Action". 
Note: Important Input for your action are marked with *Important Input*

## Context Information

### General Goal (The "Current Task" is indeed a substep of the general goal)
{General_Goal}

### Current Task
{Current_Task_Description}

### Input Objects (Input objects for the current task)
{Input_Objects}

### History Action
{History_Action}

## Instruction for Your Current Action 
{Action_Description} 

{Action_Custom_Note}

'''

PROMPT_TEMPLATE_INPUTOBJECT_RECORD = '''
{{
{Important_Mark}
{Input_Objects_Name}:
{Input_Objects_Content}
}}

'''

PROMPT_TEMPLATE_ACTION_RECORD = '''
{{
{Important_Mark}
{AgentName} ({Action_Description}):
{Action_Result}
}}

'''

class BaseAction():
    def __init__(self, info, OutputName, KeyObjects) -> None:
        self.KeyObjects = KeyObjects
        self.OutputName = OutputName
        self.Action_Result = None
        self.info = info
        self.Action_Custom_Note = ""

    def postRun_Callback(self) -> None:
        return

    def run(self, General_Goal, TaskDescription, agentName, AgentProfile_Dict, InputName_List, OutputName, KeyObjects, ActionHistory):
        # construct input record
        inputObject_Record = ""
        for InputName in InputName_List:
            ImportantInput_Identifier = "InputObject:" + InputName
            if ImportantInput_Identifier in self.info["ImportantInput"]:
                Important_Mark = "*Important Input*"
            else:
                Important_Mark = ""
            inputObject_Record += PROMPT_TEMPLATE_INPUTOBJECT_RECORD.format(Input_Objects_Name = InputName, Input_Objects_Content = KeyObjects[InputName], Important_Mark = Important_Mark)
        
        # construct history action record
        action_Record = ""
        for actionInfo in ActionHistory:
            ImportantInput_Identifier = "ActionResult:" + actionInfo["ID"]
            if ImportantInput_Identifier in self.info["ImportantInput"]:
                Important_Mark = "*Important Input*"
            else:
                Important_Mark = ""
            action_Record += PROMPT_TEMPLATE_ACTION_RECORD.format(AgentName = actionInfo["AgentName"], Action_Description = actionInfo["AgentName"], Action_Result = actionInfo["Action_Result"], Important_Mark = Important_Mark)

        prompt = PROMPT_TEMPLATE_TAKE_ACTION_BASE.format(agentName = agentName, agentProfile = AgentProfile_Dict[agentName], General_Goal = General_Goal, Current_Task_Description = TaskDescription, Input_Objects = inputObject_Record, History_Action = action_Record, Action_Description = self.info["Description"], Action_Custom_Note = self.Action_Custom_Note)
        print_colored(text = prompt, text_color="red")
        messages = [{"role":"system", "content": prompt}]
        ActionResult = LLM_Completion(messages,True,False)
        ActionInfo_with_Result = copy.deepcopy(self.info)
        ActionInfo_with_Result["Action_Result"] = ActionResult

        # run customizable callback
        self.Action_Result = ActionResult
        self.postRun_Callback()
        return ActionInfo_with_Result

    