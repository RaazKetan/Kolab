import os
from google.adk.agents import Agent
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPServerParams

def create_github_agent():
    """
    Creates and returns a configured GitHub Agent using MCP.
    Requires GITHUB_TOKEN environment variable.
    """
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        print("Warning: GITHUB_TOKEN not found. GitHub agent may not function correctly.")
        github_token = "dummy_token" # Prevent immediate crash, but auth will fail if used

    return Agent(
        model="gemini-2.5-pro",
        name="github_agent",
        instruction="Help users get information from GitHub. You can analyze repositories, search code, and manage issues.",
        tools=[
            McpToolset(
                connection_params=StreamableHTTPServerParams(
                    url="https://api.githubcopilot.com/mcp/",
                    headers={
                        "Authorization": f"Bearer {github_token}",
                        "X-MCP-Toolsets": "repos", # Start with repos, can expand later
                        "X-MCP-Readonly": "true"
                    },
                ),
            )
        ],
    )
