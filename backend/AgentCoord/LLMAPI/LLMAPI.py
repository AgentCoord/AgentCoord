import asyncio
import openai
import yaml
from termcolor import colored
import os
from groq import AsyncGroq
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# load config (apikey, apibase, model)
yaml_file = os.path.join(os.getcwd(), "config", "config.yaml")
try:
    with open(yaml_file, "r", encoding="utf-8") as file:
        yaml_data = yaml.safe_load(file)
except Exception:
    yaml_file = {}
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE") or yaml_data.get(
    "OPENAI_API_BASE", "https://api.openai.com"
)
openai.api_base = OPENAI_API_BASE
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or yaml_data.get(
    "OPENAI_API_KEY", ""
)
openai.api_key = OPENAI_API_KEY
MODEL: str = os.getenv("OPENAI_API_MODEL") or yaml_data.get(
    "OPENAI_API_MODEL", "gpt-4-turbo-preview"
)
FAST_DESIGN_MODE: bool = os.getenv("FAST_DESIGN_MODE")
if FAST_DESIGN_MODE is None:
    FAST_DESIGN_MODE = yaml_data.get("FAST_DESIGN_MODE", False)
else:
    FAST_DESIGN_MODE = FAST_DESIGN_MODE.lower() in ["true", "1", "yes"]
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or yaml_data.get("GROQ_API_KEY", "")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY") or yaml_data.get(
    "MISTRAL_API_KEY", ""
)


# for LLM completion
def LLM_Completion(
    messages: list[dict], stream: bool = True, useGroq: bool = True
) -> str:
    if not useGroq or not FAST_DESIGN_MODE:
        force_gpt4 = True
        useGroq = False
    else:
        force_gpt4 = False
        useGroq = True

    if stream:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError as ex:
            if "There is no current event loop in thread" in str(ex):
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
        if useGroq:
            if force_gpt4:
                return loop.run_until_complete(
                    _achat_completion_json(messages=messages)
                )
            else:
                return loop.run_until_complete(
                    _achat_completion_stream_groq(messages=messages)
                )
        else:
            return loop.run_until_complete(
                _achat_completion_stream(messages=messages)
            )
        # return asyncio.run(_achat_completion_stream(messages = messages))
    else:
        return _chat_completion(messages=messages)


async def _achat_completion_stream_groq(messages: list[dict]) -> str:
    client = AsyncGroq(api_key=GROQ_API_KEY)

    max_attempts = 5

    for attempt in range(max_attempts):
        print("Attempt to use Groq (Fase Design Mode):")
        try:
            stream = await client.chat.completions.create(
                messages=messages,
                # model='gemma-7b-it',
                model="mixtral-8x7b-32768",
                # model='llama2-70b-4096',
                temperature=0.3,
                response_format={"type": "json_object"},
                stream=False,
            )
            break
        except Exception:
            if attempt < max_attempts - 1:  # i is zero indexed
                continue
            else:
                raise "failed"

    full_reply_content = stream.choices[0].message.content
    print(colored(full_reply_content, "blue", "on_white"), end="")
    print()
    return full_reply_content


async def _achat_completion_stream_mixtral(messages: list[dict]) -> str:
    client = MistralClient(api_key=MISTRAL_API_KEY)
    # client=AsyncGroq(api_key=GROQ_API_KEY)
    max_attempts = 5

    for attempt in range(max_attempts):
        try:
            messages[len(messages) - 1]["role"] = "user"
            stream = client.chat(
                messages=[
                    ChatMessage(
                        role=message["role"], content=message["content"]
                    )
                    for message in messages
                ],
                # model = "mistral-small-latest",
                model="open-mixtral-8x7b",
                # response_format={"type": "json_object"},
            )
            break  # If the operation is successful, break the loop
        except Exception:
            if attempt < max_attempts - 1:  # i is zero indexed
                continue
            else:
                raise "failed"

    full_reply_content = stream.choices[0].message.content
    print(colored(full_reply_content, "blue", "on_white"), end="")
    print()
    return full_reply_content


async def _achat_completion_stream_gpt35(messages: list[dict]) -> str:
    openai.api_key = OPENAI_API_KEY
    openai.api_base = OPENAI_API_BASE
    response = await openai.ChatCompletion.acreate(
        messages=messages,
        max_tokens=4096,
        n=1,
        stop=None,
        temperature=0.3,
        timeout=3,
        model="gpt-3.5-turbo-16k",
        stream=True,
    )

    # create variables to collect the stream of chunks
    collected_chunks = []
    collected_messages = []
    # iterate through the stream of events
    async for chunk in response:
        collected_chunks.append(chunk)  # save the event response
        choices = chunk["choices"]
        if len(choices) > 0:
            chunk_message = chunk["choices"][0].get(
                "delta", {}
            )  # extract the message
            collected_messages.append(chunk_message)  # save the message
            if "content" in chunk_message:
                print(
                    colored(chunk_message["content"], "blue", "on_white"),
                    end="",
                )
    print()

    full_reply_content = "".join(
        [m.get("content", "") for m in collected_messages]
    )
    return full_reply_content


async def _achat_completion_json(messages: list[dict]) -> str:
    openai.api_key = OPENAI_API_KEY
    openai.api_base = OPENAI_API_BASE

    max_attempts = 5

    for attempt in range(max_attempts):
        try:
            stream = await openai.ChatCompletion.acreate(
                messages=messages,
                max_tokens=4096,
                n=1,
                stop=None,
                temperature=0.3,
                timeout=3,
                model=MODEL,
                response_format={"type": "json_object"},
            )
            break
        except Exception:
            if attempt < max_attempts - 1:  # i is zero indexed
                continue
            else:
                raise "failed"

    full_reply_content = stream.choices[0].message.content
    print(colored(full_reply_content, "blue", "on_white"), end="")
    print()
    return full_reply_content


async def _achat_completion_stream(messages: list[dict]) -> str:
    openai.api_key = OPENAI_API_KEY
    openai.api_base = OPENAI_API_BASE
    response = await openai.ChatCompletion.acreate(
        **_cons_kwargs(messages), stream=True
    )

    # create variables to collect the stream of chunks
    collected_chunks = []
    collected_messages = []
    # iterate through the stream of events
    async for chunk in response:
        collected_chunks.append(chunk)  # save the event response
        choices = chunk["choices"]
        if len(choices) > 0:
            chunk_message = chunk["choices"][0].get(
                "delta", {}
            )  # extract the message
            collected_messages.append(chunk_message)  # save the message
            if "content" in chunk_message:
                print(
                    colored(chunk_message["content"], "blue", "on_white"),
                    end="",
                )
    print()

    full_reply_content = "".join(
        [m.get("content", "") for m in collected_messages]
    )
    return full_reply_content


def _chat_completion(messages: list[dict]) -> str:
    rsp = openai.ChatCompletion.create(**_cons_kwargs(messages))
    content = rsp["choices"][0]["message"]["content"]
    return content


def _cons_kwargs(messages: list[dict]) -> dict:
    kwargs = {
        "messages": messages,
        "max_tokens": 4096,
        "n": 1,
        "stop": None,
        "temperature": 0.5,
        "timeout": 3,
    }
    kwargs_mode = {"model": MODEL}
    kwargs.update(kwargs_mode)
    return kwargs
