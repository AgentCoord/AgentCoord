import re
import json
from AgentCoord.LLMAPI.LLMAPI import LLM_Completion


def create_agent_dict(agent_list):
    return {agent["Name"]: agent["Profile"] for agent in agent_list}


def is_camel_case(s):
    # If there are no spaces, it might be camel case
    return " " not in s


def camel_case_to_normal(s):
    # Split the camel case string into words
    return "".join(" " + c if c.isupper() else c for c in s).lstrip()


def generate_template_sentence_for_CollaborationBrief(
    input_object_list, output_object, agent_list, step_task
):
    # Check if the names are in camel case (no spaces) and convert them to normal naming convention
    input_object_list = (
        [
            camel_case_to_normal(obj) if is_camel_case(obj) else obj
            for obj in input_object_list
        ]
        if input_object_list is not None
        else None
    )
    output_object = (
        camel_case_to_normal(output_object)
        if is_camel_case(output_object)
        else output_object
    )

    # Format the agents into a string with proper grammar
    agent_str = (
        " and ".join([", ".join(agent_list[:-1]), agent_list[-1]])
        if len(agent_list) > 1
        else agent_list[0]
    )

    if input_object_list is None or len(input_object_list) == 0:
        # Combine all the parts into the template sentence
        template_sentence = f"{agent_str} perform the task of {step_task} to obtain {output_object}."
    else:
        # Format the input objects into a string with proper grammar
        input_str = (
            " and ".join(
                [", ".join(input_object_list[:-1]), input_object_list[-1]]
            )
            if len(input_object_list) > 1
            else input_object_list[0]
        )
        # Combine all the parts into the template sentence
        template_sentence = f"Based on {input_str}, {agent_str} perform the task of {step_task} to obtain {output_object}."

    return template_sentence


def remove_render_spec(duty_spec):
    if isinstance(duty_spec, dict):
        return {
            k: remove_render_spec(v)
            for k, v in duty_spec.items()
            if k != "renderSpec"
        }
    elif isinstance(duty_spec, list):
        return [remove_render_spec(item) for item in duty_spec]
    else:
        return duty_spec


def read_LLM_Completion(messages, useGroq=True):
    for _ in range(3):
        text = LLM_Completion(messages, useGroq=useGroq)

        pattern = r"(?:.*?```json)(.*?)(?:```.*?)"
        match = re.search(pattern, text, re.DOTALL)

        if match:
            return json.loads(match.group(1).strip())

        pattern = r"\{.*\}"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0).strip())
            except Exception:
                pass
    raise ("bad format!")


def read_json_content(text):
    """
    Extracts and returns content between ```json and ```

    :param text: The string containing the content enclosed by ```json and ```
    """
    # pattern = r"```json(.*?)```"
    pattern = r"(?:.*?```json)(.*?)(?:```.*?)"
    match = re.search(pattern, text, re.DOTALL)

    if match:
        return json.loads(match.group(1).strip())

    pattern = r"\{.*\}"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return json.loads(match.group(0).strip())

    raise ("bad format!")


def read_outputObject_content(text, keyword):
    """
    Extracts and returns content between ```{keyword} and ```

    :param text: The string containing the content enclosed by ```{keyword} and ```
    """

    pattern = r"```{}(.*?)```".format(keyword)
    match = re.search(pattern, text, re.DOTALL)

    if match:
        return match.group(1).strip()
    else:
        raise ("bad format!")
