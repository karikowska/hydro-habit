from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import openai

app = FastAPI()

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat-with-weather")
async def chat_with_weather(data: dict):
    lat, lon = data["latitude"], data["longitude"]
    user_message = data["message"]
    
    # Get weather
    weather = get_weather(lat, lon)
    
    # Create weather-aware prompt
    system_prompt = f"""
    You are a helpful assistant. Current weather context:
    - Temperature: {weather['temp']}°C
    - Conditions: {weather['description']}
    - Humidity: {weather['humidity']}%
    
    Consider this weather when giving advice.
    """
    
    # Call OpenAI with weather context
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )
    
    return {"response": response.choices[0].message.content}