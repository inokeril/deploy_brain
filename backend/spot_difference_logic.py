import os
import uuid
import base64
from typing import List, Dict, Tuple
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

# Difficulty settings
DIFFICULTY_SETTINGS = {
    "easy": {
        "size": "512x512",
        "differences_count": 3,
        "name": "Легко"
    },
    "medium": {
        "size": "768x768", 
        "differences_count": 5,
        "name": "Средне"
    },
    "hard": {
        "size": "1024x1024",
        "differences_count": 7,
        "name": "Сложно"
    }
}

# Scene themes for variety
SCENE_THEMES = [
    "a cozy living room with furniture and decorations",
    "a park with trees, benches, and people",
    "a busy street with shops and cafes",
    "a beach with umbrellas and people",
    "a library with bookshelves and reading areas",
    "a kitchen with appliances and utensils",
    "a garden with flowers and plants",
    "a children's playground with swings and slides",
    "a coffee shop interior with tables and chairs",
    "an office space with desks and computers"
]

def get_random_theme() -> str:
    """Get a random scene theme."""
    import random
    return random.choice(SCENE_THEMES)

def create_difference_zones(difficulty: str) -> List[Dict]:
    """
    Create zones where differences should appear.
    Returns list of zones with positions and descriptions.
    """
    diff_count = DIFFICULTY_SETTINGS[difficulty]["differences_count"]
    
    # Define 9 zones (3x3 grid)
    zones = [
        {"area": "top-left", "x_range": (0, 33), "y_range": (0, 33), "desc": "в левом верхнем углу"},
        {"area": "top-center", "x_range": (33, 67), "y_range": (0, 33), "desc": "в верхней центральной части"},
        {"area": "top-right", "x_range": (67, 100), "y_range": (0, 33), "desc": "в правом верхнем углу"},
        {"area": "middle-left", "x_range": (0, 33), "y_range": (33, 67), "desc": "в левой части по центру"},
        {"area": "middle-center", "x_range": (33, 67), "y_range": (33, 67), "desc": "в центре"},
        {"area": "middle-right", "x_range": (67, 100), "y_range": (33, 67), "desc": "в правой части по центру"},
        {"area": "bottom-left", "x_range": (0, 33), "y_range": (67, 100), "desc": "в левом нижнем углу"},
        {"area": "bottom-center", "x_range": (33, 67), "y_range": (67, 100), "desc": "в нижней центральной части"},
        {"area": "bottom-right", "x_range": (67, 100), "y_range": (67, 100), "desc": "в правом нижнем углу"}
    ]
    
    # Shuffle and select required number of zones
    import random
    random.shuffle(zones)
    selected_zones = zones[:diff_count]
    
    return selected_zones

def generate_difference_descriptions(zones: List[Dict], theme: str) -> List[Dict]:
    """
    Generate descriptions for differences based on zones and theme.
    """
    difference_types = [
        "цвет объекта изменен на {}",
        "добавлен новый элемент: {}",
        "убран один элемент",
        "объект повернут в другую сторону",
        "размер объекта изменен"
    ]
    
    colors = ["красный", "синий", "зеленый", "желтый", "оранжевый", "фиолетовый"]
    objects = ["шарик", "цветок", "книга", "чашка", "часы", "картина", "лампа", "подушка"]
    
    import random
    differences = []
    
    for zone in zones:
        diff_type = random.choice(difference_types)
        
        if "{}" in diff_type:
            if "цвет" in diff_type:
                description = diff_type.format(random.choice(colors))
            else:
                description = diff_type.format(random.choice(objects))
        else:
            description = diff_type
        
        differences.append({
            "area": zone["area"],
            "x_range": zone["x_range"],
            "y_range": zone["y_range"],
            "description": f"{description} {zone['desc']}",
            "found": False
        })
    
    return differences

async def generate_spot_difference_game(difficulty: str) -> Dict:
    """
    Generate a spot the difference game with two images.
    Returns game data with images and difference zones.
    """
    settings = DIFFICULTY_SETTINGS[difficulty]
    theme = get_random_theme()
    
    # Create difference zones and descriptions
    zones = create_difference_zones(difficulty)
    differences = generate_difference_descriptions(zones, theme)
    
    # Prepare API key
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
    # Generate first image
    print(f"Generating first image with theme: {theme}")
    chat1 = LlmChat(
        api_key=api_key,
        session_id=f"spot-diff-{uuid.uuid4().hex[:8]}",
        system_message="You are an AI that creates detailed, clear images for a spot-the-difference game."
    )
    chat1.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
    
    prompt1 = f"""Create a detailed, colorful illustration of {theme}. 
The image should be clear and have distinct objects that can be easily modified.
Style: cartoon illustration, bright colors, clear details.
Size: {settings['size']}"""
    
    msg1 = UserMessage(text=prompt1)
    text1, images1 = await chat1.send_message_multimodal_response(msg1)
    
    if not images1 or len(images1) == 0:
        raise ValueError("Failed to generate first image")
    
    image1_data = images1[0]['data']
    
    # Generate second image with differences
    print(f"Generating second image with {settings['differences_count']} differences")
    
    # Build differences description for prompt
    diff_descriptions = []
    for diff in differences:
        diff_descriptions.append(diff['description'])
    
    differences_text = "\n".join([f"{i+1}. {desc}" for i, desc in enumerate(diff_descriptions)])
    
    chat2 = LlmChat(
        api_key=api_key,
        session_id=f"spot-diff-{uuid.uuid4().hex[:8]}",
        system_message="You are an AI that creates detailed, clear images for a spot-the-difference game."
    )
    chat2.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
    
    prompt2 = f"""Create a VERY SIMILAR illustration to this image, but with these SPECIFIC differences:

{differences_text}

IMPORTANT: 
- Keep everything else EXACTLY the same as the original image
- Only change the elements mentioned above
- Make the differences clear but not too obvious
- Maintain the same style, colors, and composition
- Size: {settings['size']}"""
    
    # Use first image as reference
    from emergentintegrations.llm.chat import ImageContent
    msg2 = UserMessage(
        text=prompt2,
        file_contents=[ImageContent(image1_data)]
    )
    
    text2, images2 = await chat2.send_message_multimodal_response(msg2)
    
    if not images2 or len(images2) == 0:
        raise ValueError("Failed to generate second image")
    
    image2_data = images2[0]['data']
    
    # Return game data
    game_data = {
        "game_id": f"game_{uuid.uuid4().hex[:12]}",
        "difficulty": difficulty,
        "theme": theme,
        "image1": image1_data,
        "image2": image2_data,
        "differences": differences,
        "total_differences": len(differences),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    return game_data

def check_click_in_zone(x_percent: float, y_percent: float, zone: Dict) -> bool:
    """
    Check if click coordinates (in percentages) are within a difference zone.
    """
    x_min, x_max = zone["x_range"]
    y_min, y_max = zone["y_range"]
    
    return x_min <= x_percent <= x_max and y_min <= y_percent <= y_max

def find_clicked_difference(x_percent: float, y_percent: float, differences: List[Dict]) -> Tuple[bool, int]:
    """
    Check if click hits any unfound difference.
    Returns (found, index) tuple.
    """
    for i, diff in enumerate(differences):
        if not diff.get("found", False):
            if check_click_in_zone(x_percent, y_percent, diff):
                return True, i
    
    return False, -1
