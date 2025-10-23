from openai import OpenAI
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import instructor
from groq import Groq
from google.generativeai import configure, GenerativeModel
import google.generativeai as genai
from instructor import patch
import tiktoken

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """
    Count tokens for any model using tiktoken.
    For non-OpenAI models, uses the closest OpenAI model encoding.
    """
    try:
        # Try to get encoding for the specific model
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fallback to cl100k_base encoding (used by GPT-4)
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(text))

def count_tokens_in_messages(messages: List[Dict[str, str]], model: str = "gpt-4") -> int:
    """
    Count tokens in a list of messages (conversation format).
    """
    total_tokens = 0
    for message in messages:
        # Count tokens in the content
        content_tokens = count_tokens(message.get("content", ""), model)
        # Add overhead for role and formatting (rough estimate)
        total_tokens += content_tokens + 4  # 4 tokens overhead per message
    
    return total_tokens



load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client with instructor for structured outputs
openai_client = instructor.patch(OpenAI(api_key=OPENAI_API_KEY), mode=instructor.Mode.JSON)

async def call_llm_api_1(messages: List[Dict[str, str]], 
                model: str = "gpt-4o-mini",
                response_format: Optional[BaseModel] = None,
                max_tokens: int = 2000,
                temperature: float = 0.3) -> Any:
    """
    Make a call to the OpenAI API for chat completions.
    """
    try:
        # If a response model is provided, use it for structured output
        if response_format:
            response = openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                response_model=response_format,
                max_retries=3
            )
            # Return the parsed response directly
            return response
        else:
            # For unstructured responses
            response = openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                max_retries=3
            )
            return response.choices[0].message.content
    except Exception as e:
        print(f"Error in OpenAI API call: {e}")
        raise

    # Groq API


# Patch Groq() with instructor, this is where the magic happens!
groq_client = instructor.from_groq(Groq(api_key=os.getenv("GROQ_API_KEY")), mode=instructor.Mode.JSON)

async def call_llm_api_2(messages: List[Dict[str, str]],
                model: str = "llama3-70b-8192",
                response_format: Optional[BaseModel] = None,
                max_tokens: int = 2000,
                temperature: float = 0.3) -> Any:
    """
    Make a call to the Groq API for chat completions.
    """
    try:
        # If a response model is provided, use it for structured output
        if response_format:
            response = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                response_model=response_format,
                max_retries=3
            )
            # Return the parsed response directly
            return response
        else:
            # For unstructured responses
            response = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                max_retries=3
            )
            return response.choices[0].message.content
    except Exception as e:
        print(f"Error in Groq API call: {e}")
        raise


# OpenRouter API

openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Patch OpenRouter client with instructor for structured outputs
openrouter_client = instructor.patch(openrouter_client, mode=instructor.Mode.JSON)

async def call_llm_api(messages: List[Dict[str, str]],
                model: str = "x-ai/grok-4-fast",
                response_format: Optional[BaseModel] = None,
                max_tokens: int = 2000,
                temperature: float = 0.3) -> Any:
    """
    Make a call to the OpenRouter API for chat completions with structured output support.
    Args:
        messages: List of message dictionaries
        model: Model to use (default: gemini-2.0-flash-lite)
        response_format: Optional Pydantic model for structured output
        max_tokens: Maximum tokens in response
        temperature: Temperature for response generation
    Returns:
        Either structured output matching response_format or raw text response
    """
    # Count input tokens
    input_tokens = count_tokens_in_messages(messages, model)
    print(f"📊 Input tokens: {input_tokens}")
    
    try:
        # If a response model is provided, use it for structured output
        if response_format:
            response = openrouter_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                response_model=response_format,
                max_retries=3,
                extra_headers={
                    "HTTP-Referer": "https://mwalimu.ai", # Optional. Site URL for rankings on openrouter.ai.
                    "X-Title": "Mwalimu", # Optional. Site title for rankings on openrouter.ai.
                }
            )
            result = response
        else:
            # For unstructured responses
            response = openrouter_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                max_retries=3
            )
            result = response.choices[0].message.content
        
        # Count output tokens (approximate)
        if hasattr(result, 'message_to_user'):
            output_text = result.message_to_user or ""
        elif hasattr(result, 'content'):
            output_text = result.content or ""
        else:
            output_text = str(result)
        
        output_tokens = count_tokens(output_text, model)
        print(f"📊 Output tokens: {output_tokens}")
        print(f"📊 Total tokens: {input_tokens + output_tokens}")
        
        return result
    except Exception as e:
        print(f"Error in OpenRouter API call: {e}")
        raise


