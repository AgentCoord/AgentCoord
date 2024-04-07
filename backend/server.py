from flask import Flask, request, jsonify
import json
from DataProcess import Add_Collaboration_Brief_FrontEnd
from AgentCoord.RehearsalEngine_V2.ExecutePlan import executePlan
from AgentCoord.PlanEngine.basePlan_Generator import generate_basePlan
from AgentCoord.PlanEngine.fill_stepTask import fill_stepTask
from AgentCoord.PlanEngine.fill_stepTask_TaskProcess import (
    fill_stepTask_TaskProcess,
)
from AgentCoord.PlanEngine.branch_PlanOutline import branch_PlanOutline
from AgentCoord.PlanEngine.branch_TaskProcess import branch_TaskProcess
from AgentCoord.PlanEngine.AgentSelectModify import (
    AgentSelectModify_init,
    AgentSelectModify_addAspect,
)
import os
import yaml
import argparse

# initialize global variables
yaml_file = os.path.join(os.getcwd(), "config", "config.yaml")
try:
    with open(yaml_file, "r", encoding="utf-8") as file:
        yaml_data = yaml.safe_load(file)
except Exception:
    yaml_file = {}
USE_CACHE: bool = os.getenv("USE_CACHE")
if USE_CACHE is None:
    USE_CACHE = yaml_data.get("USE_CACHE", False)
else:
    USE_CACHE = USE_CACHE.lower() in ["true", "1", "yes"]
AgentBoard = None
AgentProfile_Dict = {}
Request_Cache: dict[str, str] = {}
app = Flask(__name__)


@app.route("/fill_stepTask_TaskProcess", methods=["post"])
def Handle_fill_stepTask_TaskProcess():
    incoming_data = request.get_json()
    requestIdentifier = str(
        (
            "/fill_stepTask_TaskProcess",
            incoming_data["General Goal"],
            incoming_data["stepTask_lackTaskProcess"],
        )
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    filled_stepTask = fill_stepTask_TaskProcess(
        General_Goal=incoming_data["General Goal"],
        stepTask=incoming_data["stepTask_lackTaskProcess"],
        AgentProfile_Dict=AgentProfile_Dict,
    )
    filled_stepTask = Add_Collaboration_Brief_FrontEnd(filled_stepTask)
    Request_Cache[requestIdentifier] = filled_stepTask
    response = jsonify(filled_stepTask)
    return response


@app.route("/agentSelectModify_init", methods=["post"])
def Handle_agentSelectModify_init():
    incoming_data = request.get_json()
    requestIdentifier = str(
        (
            "/agentSelectModify_init",
            incoming_data["General Goal"],
            incoming_data["stepTask"],
        )
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    scoreTable = AgentSelectModify_init(
        stepTask=incoming_data["stepTask"],
        General_Goal=incoming_data["General Goal"],
        Agent_Board=AgentBoard,
    )
    Request_Cache[requestIdentifier] = scoreTable
    response = jsonify(scoreTable)
    return response


@app.route("/agentSelectModify_addAspect", methods=["post"])
def Handle_agentSelectModify_addAspect():
    incoming_data = request.get_json()
    requestIdentifier = str(
        ("/agentSelectModify_addAspect", incoming_data["aspectList"])
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    scoreTable = AgentSelectModify_addAspect(
        aspectList=incoming_data["aspectList"], Agent_Board=AgentBoard
    )
    Request_Cache[requestIdentifier] = scoreTable
    response = jsonify(scoreTable)
    return response


@app.route("/fill_stepTask", methods=["post"])
def Handle_fill_stepTask():
    incoming_data = request.get_json()
    requestIdentifier = str(
        (
            "/fill_stepTask",
            incoming_data["General Goal"],
            incoming_data["stepTask"],
        )
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    filled_stepTask = fill_stepTask(
        General_Goal=incoming_data["General Goal"],
        stepTask=incoming_data["stepTask"],
        Agent_Board=AgentBoard,
        AgentProfile_Dict=AgentProfile_Dict,
    )
    filled_stepTask = Add_Collaboration_Brief_FrontEnd(filled_stepTask)
    Request_Cache[requestIdentifier] = filled_stepTask
    response = jsonify(filled_stepTask)
    return response


@app.route("/branch_PlanOutline", methods=["post"])
def Handle_branch_PlanOutline():
    incoming_data = request.get_json()
    requestIdentifier = str(
        (
            "/branch_PlanOutline",
            incoming_data["branch_Number"],
            incoming_data["Modification_Requirement"],
            incoming_data["Existing_Steps"],
            incoming_data["Baseline_Completion"],
            incoming_data["Initial Input Object"],
            incoming_data["General Goal"],
        )
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    branchList = branch_PlanOutline(
        branch_Number=incoming_data["branch_Number"],
        Modification_Requirement=incoming_data["Modification_Requirement"],
        Existing_Steps=incoming_data["Existing_Steps"],
        Baseline_Completion=incoming_data["Baseline_Completion"],
        InitialObject_List=incoming_data["Initial Input Object"],
        General_Goal=incoming_data["General Goal"],
    )
    branchList = Add_Collaboration_Brief_FrontEnd(branchList)
    Request_Cache[requestIdentifier] = branchList
    response = jsonify(branchList)
    return response


@app.route("/branch_TaskProcess", methods=["post"])
def Handle_branch_TaskProcess():
    incoming_data = request.get_json()
    requestIdentifier = str(
        (
            "/branch_TaskProcess",
            incoming_data["branch_Number"],
            incoming_data["Modification_Requirement"],
            incoming_data["Existing_Steps"],
            incoming_data["Baseline_Completion"],
            incoming_data["stepTaskExisting"],
            incoming_data["General Goal"],
        )
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    branchList = branch_TaskProcess(
        branch_Number=incoming_data["branch_Number"],
        Modification_Requirement=incoming_data["Modification_Requirement"],
        Existing_Steps=incoming_data["Existing_Steps"],
        Baseline_Completion=incoming_data["Baseline_Completion"],
        stepTaskExisting=incoming_data["stepTaskExisting"],
        General_Goal=incoming_data["General Goal"],
        AgentProfile_Dict=AgentProfile_Dict,
    )
    Request_Cache[requestIdentifier] = branchList
    response = jsonify(branchList)
    return response


@app.route("/generate_basePlan", methods=["post"])
def Handle_generate_basePlan():
    incoming_data = request.get_json()
    requestIdentifier = str(
        (
            "/generate_basePlan",
            incoming_data["General Goal"],
            incoming_data["Initial Input Object"],
        )
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    basePlan = generate_basePlan(
        General_Goal=incoming_data["General Goal"],
        Agent_Board=AgentBoard,
        AgentProfile_Dict=AgentProfile_Dict,
        InitialObject_List=incoming_data["Initial Input Object"],
    )
    basePlan_withRenderSpec = Add_Collaboration_Brief_FrontEnd(basePlan)
    Request_Cache[requestIdentifier] = basePlan_withRenderSpec
    response = jsonify(basePlan_withRenderSpec)
    return response


@app.route("/executePlan", methods=["post"])
def Handle_executePlan():
    incoming_data = request.get_json()
    requestIdentifier = str(
        (
            "/executePlan",
            incoming_data["num_StepToRun"],
            incoming_data["RehearsalLog"],
            incoming_data["plan"],
        )
    )

    if USE_CACHE:
        if requestIdentifier in Request_Cache:
            return jsonify(Request_Cache[requestIdentifier])

    RehearsalLog = executePlan(
        incoming_data["plan"],
        incoming_data["num_StepToRun"],
        incoming_data["RehearsalLog"],
        AgentProfile_Dict,
    )
    Request_Cache[requestIdentifier] = RehearsalLog
    response = jsonify(RehearsalLog)
    return response


@app.route("/_saveRequestCashe", methods=["post"])
def Handle_saveRequestCashe():
    with open(
        os.path.join(os.getcwd(), "RequestCache", "Request_Cache.json"), "w"
    ) as json_file:
        json.dump(Request_Cache, json_file, indent=4)
    response = jsonify(
        {"code": 200, "content": "request cashe sucessfully saved"}
    )
    return response


@app.route("/setAgents", methods=["POST"])
def set_agents():
    global AgentBoard, AgentProfile_Dict
    AgentBoard = request.json
    AgentProfile_Dict = {}
    for item in AgentBoard:
        name = item["Name"]
        profile = item["Profile"]
        AgentProfile_Dict[name] = profile
    return jsonify({"code": 200, "content": "set agentboard successfully"})


def init():
    global AgentBoard, AgentProfile_Dict, Request_Cache
    with open(
        os.path.join(os.getcwd(), "RequestCache", "Request_Cache.json"), "r"
    ) as json_file:
        Request_Cache = json.load(json_file)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="start the backend for AgentCoord"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8017,
        help="set the port number, 8017 by defaul.",
    )
    args = parser.parse_args()
    init()
    app.run(host="0.0.0.0", port=args.port, debug=True)
