from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import openai
from external_api import get_location, get_weather

app = FastAPI()

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server for Vite
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/encouragement")
async def get_encouragement():
    try:
        loc = get_location()
        if not loc or 'latitude' not in loc or 'longitude' not in loc:
            raise ValueError("Could not retrieve valid location data.")
            
        weather = get_weather(loc['latitude'], loc['longitude'])
        if not weather or 'temperature' not in weather or 'humidity' not in weather:
            raise ValueError("Could not retrieve valid weather data.")

    except Exception as e:
        print(f"Error getting location or weather: {e}")
        raise HTTPException(status_code=503, detail="Could not fetch external weather/location data.")

    time_since_last_sip = 10  # Placeholder for time since last sip, replace with actual logic
    
    system_prompt = f"""
    You are a friendly and motivating hydration coach. Your job is to remind users to drink water in a fun and encouraging way.

    Here is the current weather context and time since last sip:
    - Temperature: {weather['temperature']}°C
    - Humidity: {weather['humidity']}%
    - Time since last sip: {time_since_last_sip} minutes

    Based on this, generate a short, engaging reminder for the user to stay hydrated.
    If it's hot or humid, emphasize the importance of drinking more. If it's cool, still encourage hydration but without urgency.
    If the user hasn't sipped in a while, make it sound like a friendly nudge rather than a command.

    Avoid being robotic. Use some emojis if appropriate, not too many. Make it sound like a human coach who cares about the user’s health and mood. No hashtags.
    Keep it concise, around 2-3 sentences.
    """
    
    try:
        # Note: The openai library v1.0+ is sync by default.
        # For true async, you would use `AsyncOpenAI` and `await openai.chat.completions.create(...)`
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": system_prompt}],
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate encouragement from AI model.")