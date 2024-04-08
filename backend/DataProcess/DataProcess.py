import re
from .FormatList import FormatList, TransToFrontFormat

is_mock = False

colorMap = {
    "propose": [194, 34, 73],
    "execute": [242, 28, 86],
    "critique": [68, 24, 70],
    "finalize": [14, 27, 73],
    "inputobject": [108, 45, 74],
    "outputobject": [32, 100, 78],
    "agent": [0, 0, 80],
}

def OperateCamelStr(_str: str):
    if " " in _str:
        return _str
    return "".join(" " + c if c.isupper() else c for c in _str).lstrip()


def ParseRole(_str: str) -> dict:
    if _str[0] == "(" and _str[-1] == ")":
        _str = _str[1:-1].split(":")
    return dict({"Name": _str[0], "Job": _str[1]})


def ParseStepTask(step_task: str):
    if len(step_task) == 0:
        return ""

    if step_task[0].isupper() and step_task[-1] == ".":
        step_task = step_task[0].lower() + step_task[1:-1]
    return step_task


def Generate_Collaboration_Specification_frontEnd(_str):
    assert isinstance(_str, str)
    res = dict()
    res["template"] = ""
    res["data"] = dict()
    Persons = []

    temp = re.findall(r"\(\w*:\w*?\)", _str, flags=re.M)
    new_str = re.sub(r" *\(\w*:\w*?\) *", " ", _str, flags=re.M)
    words = new_str.split(" ")
    for i in range(len(temp)):
        temp[i] = ParseRole(temp[i])
        res["data"][str(len(Persons))] = dict(
            {
                "text": temp[i]["Name"],
                "color": colorMap[temp[i]["Job"].lower()],
            }
        )
        Persons.append(temp[i]["Name"])

    index = int(0)
    for i in range(len(words)):
        if words[i] in Persons:
            words[i] = TransToFrontFormat(index)
            index += 1

    res["template"] = " ".join(words)
    return res


def Generate_Agent_DutySpecification_frontEnd(_obj: dict):
    _obj = _obj.copy()
    for key, val in _obj.items():
        if isinstance(val, list):
            for i, v in enumerate(val):
                if isinstance(v, dict) and "DutyType" in v.keys():
                    _obj[key][i]["renderSpec"] = dict(
                        {"color": colorMap[_obj[key][i]["DutyType"].lower()]}
                    )
    return _obj


def CheckDict(_dict: dict) -> bool:
    items = ["InputObject_List", "OutputObject", "TaskContent"]
    for e in items:
        if e not in _dict.keys():
            return False
    return True


def Add_Collaboration_Brief_FrontEnd(_obj):
    if isinstance(_obj, list):
        for i in range(len(_obj)):
            _obj[i] = Add_Collaboration_Brief_FrontEnd(_obj[i])
    elif isinstance(_obj, dict) and (
        CheckDict(_obj) or "Collaboration Process" in _obj.keys()
    ):
        if "Collaboration Process" in _obj.keys():
            _obj["Collaboration Process"] = Add_Collaboration_Brief_FrontEnd(
                _obj["Collaboration Process"]
            )
        else:
            _obj = _obj.copy()
            Agent_List = (
                _obj["AgentSelection"][:]
                if "AgentSelection" in _obj.keys()
                else None
            )
            InputObject_List = (
                [OperateCamelStr(b) for b in _obj["InputObject_List"]]
                if "InputObject_List" in _obj.keys()
                and _obj["InputObject_List"] is not None
                else []
            )
            OutputObject = (
                OperateCamelStr(_obj["OutputObject"])
                if "OutputObject" in _obj.keys()
                else ""
            )

            _obj["StepName"] = OperateCamelStr(_obj["StepName"])
            _obj["InputObject_List"] = InputObject_List
            _obj["OutputObject"] = OutputObject

            TaskContent = _obj["TaskContent"]
            # add Collaboration Brief
            _key = (
                "Collaboration_Brief_FrontEnd"
                if Agent_List is not None and len(Agent_List) > 0
                else "Collaboration_Brief_LackAgent_FrontEnd"
            )
            _obj[_key] = Generate_Collaboration_Brief_FrontEnd(
                InputObject_List, OutputObject, Agent_List, TaskContent
            )
    return _obj


def Generate_Collaboration_Brief_FrontEnd(
    InputObject_List, OutputObject, Agent_List, TaskContent
):
    res = dict({})
    res["template"] = str("")
    res["data"] = dict({})
    len_in = len(InputObject_List)
    len_out = 1
    len_ag = len(Agent_List) if Agent_List is not None else 0

    Template_Sentence_InputObject = (
        f"Based on {FormatList(InputObject_List).Format()}, "
        if len_in > 0
        else ""
    )
    Template_Sentence_Agent = (
        f"{FormatList(Agent_List, len_in).Format()} "
        if Agent_List is not None and len_ag > 0
        else ""
    )
    Template_Sentence_TaskContent = f"perform{'s' if len_ag == 1 else ''} the task of {ParseStepTask(TaskContent)} "
    Template_Sentence_OutputObject = (
        f"to obtain {FormatList([OutputObject], len_ag + len_in).Format()}."
        if len_out > 0
        else ""
    )
    Template_Sentence = (
        Template_Sentence_InputObject
        + Template_Sentence_Agent
        + Template_Sentence_TaskContent
        + Template_Sentence_OutputObject
    )

    res["template"] = Template_Sentence
    index = int(0)
    for i in range(len_in):
        res["data"][str(index)] = dict(
            {
                "text": InputObject_List[i],
                "color": colorMap["InputObject".lower()],
            }
        )
        index += 1
    for i in range(len_ag):
        res["data"][str(index)] = dict(
            {"text": Agent_List[i], "color": colorMap["Agent".lower()]}
        )
        index += 1

    res["data"][str(index)] = dict(
        {"text": OutputObject, "color": colorMap["OutputObject".lower()]}
    )
    index += 1
    return res
