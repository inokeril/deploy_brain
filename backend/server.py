from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    session_id: str = Field(default_factory=lambda: f"session_{uuid.uuid4().hex}")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Exercise(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    exercise_id: str
    name: str
    description: str
    icon: str
    difficulty: str  # easy, medium, hard
    category: str

class UserResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    result_id: str = Field(default_factory=lambda: f"result_{uuid.uuid4().hex[:12]}")
    user_id: str
    exercise_id: str
    score: int  # For Schulte: grid size (e.g., 25 for 5x5)
    time: float  # Time in seconds
    grid_size: Optional[int] = None  # For Schulte tables
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    progress_id: str = Field(default_factory=lambda: f"progress_{uuid.uuid4().hex[:12]}")
    user_id: str
    exercise_id: str
    level: int = 1
    total_games: int = 0
    best_score: Optional[float] = None
    average_score: Optional[float] = None
    last_played: Optional[datetime] = None

class Competition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    competition_id: str = Field(default_factory=lambda: f"comp_{uuid.uuid4().hex[:12]}")
    exercise_id: str
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    prize_description: str
    is_active: bool = True

class CompetitionResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    comp_result_id: str = Field(default_factory=lambda: f"comp_res_{uuid.uuid4().hex[:12]}")
    competition_id: str
    user_id: str
    best_time: float
    attempts: int = 1
    last_attempt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request/Response models
class SessionRequest(BaseModel):
    session_id: str

class ResultCreate(BaseModel):
    exercise_id: str
    score: int
    time: float
    grid_size: Optional[int] = None

# ============================================================================
# AUTHENTICATION HELPERS
# ============================================================================

async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Get current user from session_token cookie or Authorization header.
    Cookie takes precedence over header.
    """
    session_token = None
    
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
        else:
            session_token = authorization
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check if session is expired
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user data
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_doc

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@api_router.post("/auth/session")
async def create_session(session_request: SessionRequest, response: Response):
    """
    Exchange session_id for user data and create session_token.
    """
    try:
        # Call Emergent Auth API to get user data
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_request.session_id},
                timeout=10.0
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session ID")
            
            user_data = auth_response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one(
            {"email": user_data["email"]},
            {"_id": 0}
        )
        
        if existing_user:
            user_id = existing_user["user_id"]
            # Update user data if needed
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": user_data["name"],
                    "picture": user_data.get("picture")
                }}
            )
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            new_user = {
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(new_user)
        
        # Create session
        session_token = user_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session_doc = {
            "session_id": f"session_{uuid.uuid4().hex}",
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.user_sessions.insert_one(session_doc)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/"
        )
        
        # Get full user data
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        
        return {
            "user": user_doc,
            "session_token": session_token
        }
        
    except httpx.RequestError as e:
        logger.error(f"Error calling Emergent Auth API: {e}")
        raise HTTPException(status_code=500, detail="Authentication service error")

@api_router.get("/auth/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current authenticated user data.
    """
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """
    Logout user by deleting session.
    """
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Delete session from database
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}

# ============================================================================
# EXERCISE ROUTES
# ============================================================================

@api_router.get("/exercises")
async def get_exercises():
    """
    Get all available exercises.
    """
    exercises = await db.exercises.find({}, {"_id": 0}).to_list(100)
    
    if not exercises:
        # Initialize default exercises if none exist
        default_exercises = [
            {
                "exercise_id": "schulte",
                "name": "Таблицы Шульте",
                "description": "Тренировка периферийного зрения и концентрации",
                "icon": "grid-3x3",
                "difficulty": "medium",
                "category": "attention"
            },
            {
                "exercise_id": "sequence",
                "name": "Запоминание последовательностей",
                "description": "Запомните порядок чисел или цветов",
                "icon": "list-ordered",
                "difficulty": "medium",
                "category": "memory"
            },
            {
                "exercise_id": "spot-difference",
                "name": "Поиск отличий",
                "description": "Найдите различия между изображениями",
                "icon": "scan-search",
                "difficulty": "easy",
                "category": "attention"
            },
            {
                "exercise_id": "reaction",
                "name": "Скорость реакции",
                "description": "Проверьте свою скорость реакции",
                "icon": "zap",
                "difficulty": "easy",
                "category": "speed"
            },
            {
                "exercise_id": "math",
                "name": "Математические задачи",
                "description": "Решайте примеры на скорость",
                "icon": "calculator",
                "difficulty": "hard",
                "category": "logic"
            }
        ]
        
        await db.exercises.insert_many(default_exercises)
        exercises = default_exercises
    
    return exercises

@api_router.get("/exercises/{exercise_id}")
async def get_exercise(exercise_id: str):
    """
    Get specific exercise details.
    """
    exercise = await db.exercises.find_one(
        {"exercise_id": exercise_id},
        {"_id": 0}
    )
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    return exercise

# ============================================================================
# RESULTS ROUTES
# ============================================================================

@api_router.post("/results")
async def save_result(
    result_data: ResultCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Save user's exercise result and update progress.
    """
    user_id = user["user_id"]
    
    # Create result document
    result_doc = {
        "result_id": f"result_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "exercise_id": result_data.exercise_id,
        "score": result_data.score,
        "time": result_data.time,
        "grid_size": result_data.grid_size,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_results.insert_one(result_doc)
    
    # Update user progress
    progress = await db.user_progress.find_one(
        {"user_id": user_id, "exercise_id": result_data.exercise_id},
        {"_id": 0}
    )
    
    if progress:
        # Update existing progress
        total_games = progress["total_games"] + 1
        best_score = min(result_data.time, progress.get("best_score", result_data.time))
        
        # Calculate average (simple moving average)
        current_avg = progress.get("average_score", result_data.time)
        new_avg = ((current_avg * progress["total_games"]) + result_data.time) / total_games
        
        # Calculate level (1 level per 10 games, with bonus for good scores)
        level = 1 + (total_games // 10)
        
        await db.user_progress.update_one(
            {"user_id": user_id, "exercise_id": result_data.exercise_id},
            {"$set": {
                "total_games": total_games,
                "best_score": best_score,
                "average_score": new_avg,
                "level": level,
                "last_played": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new progress
        progress_doc = {
            "progress_id": f"progress_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "exercise_id": result_data.exercise_id,
            "level": 1,
            "total_games": 1,
            "best_score": result_data.time,
            "average_score": result_data.time,
            "last_played": datetime.now(timezone.utc).isoformat()
        }
        await db.user_progress.insert_one(progress_doc)
    
    return {"message": "Result saved successfully", "result_id": result_doc["result_id"]}

@api_router.get("/results/user")
async def get_user_results(
    exercise_id: Optional[str] = None,
    limit: int = 10,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get user's results, optionally filtered by exercise.
    """
    query = {"user_id": user["user_id"]}
    if exercise_id:
        query["exercise_id"] = exercise_id
    
    results = await db.user_results.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return results

# ============================================================================
# LEADERBOARD ROUTES
# ============================================================================

@api_router.get("/leaderboard/{exercise_id}")
async def get_leaderboard(
    exercise_id: str,
    limit: int = 10
):
    """
    Get leaderboard for specific exercise.
    Returns top players by best score (lowest time).
    """
    # Aggregate to get best score per user
    pipeline = [
        {"$match": {"exercise_id": exercise_id}},
        {"$group": {
            "_id": "$user_id",
            "best_time": {"$min": "$time"},
            "total_games": {"$sum": 1}
        }},
        {"$sort": {"best_time": 1}},
        {"$limit": limit}
    ]
    
    leaderboard_data = await db.user_results.aggregate(pipeline).to_list(limit)
    
    # Enrich with user data and progress
    leaderboard = []
    for entry in leaderboard_data:
        user_doc = await db.users.find_one(
            {"user_id": entry["_id"]},
            {"_id": 0, "user_id": 1, "name": 1, "picture": 1}
        )
        
        progress_doc = await db.user_progress.find_one(
            {"user_id": entry["_id"], "exercise_id": exercise_id},
            {"_id": 0, "level": 1}
        )
        
        if user_doc:
            leaderboard.append({
                "user_id": user_doc["user_id"],
                "name": user_doc["name"],
                "picture": user_doc.get("picture"),
                "best_time": entry["best_time"],
                "total_games": entry["total_games"],
                "level": progress_doc["level"] if progress_doc else 1
            })
    
    return leaderboard

# ============================================================================
# PROFILE ROUTES
# ============================================================================

@api_router.get("/profile/stats")
async def get_profile_stats(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get user's statistics across all exercises.
    """
    user_id = user["user_id"]
    
    # Get all progress
    progress_list = await db.user_progress.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    # Get total results count
    total_results = await db.user_results.count_documents({"user_id": user_id})
    
    return {
        "user": user,
        "progress": progress_list,
        "total_games": total_results
    }

# ============================================================================
# SPOT THE DIFFERENCE GAME ROUTES
# ============================================================================

# Import game logic
from spot_difference_logic import (
    generate_spot_difference_game,
    find_clicked_difference,
    DIFFICULTY_SETTINGS
)

class SpotDifferenceStartRequest(BaseModel):
    difficulty: str  # easy, medium, hard

class SpotDifferenceClickRequest(BaseModel):
    game_id: str
    x_percent: float  # 0-100
    y_percent: float  # 0-100

@api_router.post("/spot-difference/start")
async def start_spot_difference_game(
    request: SpotDifferenceStartRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Start a new spot the difference game.
    Generates two images with differences.
    """
    difficulty = request.difficulty
    
    if difficulty not in DIFFICULTY_SETTINGS:
        raise HTTPException(status_code=400, detail="Invalid difficulty level")
    
    try:
        # Generate game
        logger.info(f"Generating spot difference game for user {user['user_id']}, difficulty: {difficulty}")
        game_data = await generate_spot_difference_game(difficulty)
        
        # Save game to database
        game_doc = {
            "game_id": game_data["game_id"],
            "user_id": user["user_id"],
            "difficulty": difficulty,
            "theme": game_data["theme"],
            "differences": game_data["differences"],
            "found_count": 0,
            "total_differences": game_data["total_differences"],
            "completed": False,
            "start_time": datetime.now(timezone.utc).isoformat(),
            "end_time": None
        }
        
        await db.spot_difference_games.insert_one(game_doc)
        
        # Return game data (without saving images in DB - too large)
        return {
            "game_id": game_data["game_id"],
            "difficulty": difficulty,
            "image1": game_data["image1"],
            "image2": game_data["image2"],
            "total_differences": game_data["total_differences"],
            "found_count": 0
        }
        
    except Exception as e:
        logger.error(f"Error generating spot difference game: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate game: {str(e)}")

@api_router.post("/spot-difference/check")
async def check_spot_difference_click(
    request: SpotDifferenceClickRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Check if a click hits a difference.
    """
    # Get game from database
    game_doc = await db.spot_difference_games.find_one(
        {"game_id": request.game_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not game_doc:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game_doc["completed"]:
        raise HTTPException(status_code=400, detail="Game already completed")
    
    # Check click
    differences = game_doc["differences"]
    found, diff_index = find_clicked_difference(request.x_percent, request.y_percent, differences)
    
    if found:
        # Mark difference as found
        differences[diff_index]["found"] = True
        found_count = sum(1 for d in differences if d.get("found", False))
        
        # Check if game completed
        completed = found_count == game_doc["total_differences"]
        
        update_data = {
            "differences": differences,
            "found_count": found_count,
            "completed": completed
        }
        
        if completed:
            update_data["end_time"] = datetime.now(timezone.utc).isoformat()
            
            # Calculate time taken
            start_time = datetime.fromisoformat(game_doc["start_time"])
            end_time = datetime.now(timezone.utc)
            time_taken = (end_time - start_time).total_seconds()
            
            # Save result
            result_doc = {
                "result_id": f"result_{uuid.uuid4().hex[:12]}",
                "user_id": user["user_id"],
                "exercise_id": "spot-difference",
                "score": game_doc["total_differences"],
                "time": time_taken,
                "difficulty": game_doc["difficulty"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_results.insert_one(result_doc)
            
            # Update user progress
            await update_user_progress_for_spot_difference(user["user_id"], time_taken, game_doc["difficulty"])
        
        # Update game
        await db.spot_difference_games.update_one(
            {"game_id": request.game_id},
            {"$set": update_data}
        )
        
        return {
            "correct": True,
            "found_count": found_count,
            "total_differences": game_doc["total_differences"],
            "completed": completed,
            "difference_area": differences[diff_index]["area"],
            "time_taken": time_taken if completed else None
        }
    else:
        return {
            "correct": False,
            "found_count": game_doc["found_count"],
            "total_differences": game_doc["total_differences"],
            "completed": False
        }

async def update_user_progress_for_spot_difference(user_id: str, time: float, difficulty: str):
    """
    Update user progress for spot the difference exercise.
    """
    exercise_id = "spot-difference"
    
    progress = await db.user_progress.find_one(
        {"user_id": user_id, "exercise_id": exercise_id},
        {"_id": 0}
    )
    
    if progress:
        # Update existing progress
        total_games = progress["total_games"] + 1
        best_score = min(time, progress.get("best_score", time))
        
        # Calculate average
        current_avg = progress.get("average_score", time)
        new_avg = ((current_avg * progress["total_games"]) + time) / total_games
        
        # Calculate level
        level = 1 + (total_games // 10)
        
        await db.user_progress.update_one(
            {"user_id": user_id, "exercise_id": exercise_id},
            {"$set": {
                "total_games": total_games,
                "best_score": best_score,
                "average_score": new_avg,
                "level": level,
                "last_played": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new progress
        progress_doc = {
            "progress_id": f"progress_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "exercise_id": exercise_id,
            "level": 1,
            "total_games": 1,
            "best_score": time,
            "average_score": time,
            "last_played": datetime.now(timezone.utc).isoformat()
        }
        await db.user_progress.insert_one(progress_doc)

# ============================================================================
# BASIC ROUTES
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "Brain Training Platform API", "version": "1.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
